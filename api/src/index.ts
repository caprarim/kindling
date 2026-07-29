/**
 * Kindling API — a Cloudflare Worker over a D1 database.
 *
 * The site itself is a static export on GitHub Pages, so this runs on a
 * different origin and is reached with CORS. Identity is a bearer token the
 * server mints; the client never sends an account id, and the server never
 * reads one from the request body. Every query is scoped to the account the
 * token resolves to.
 */

export type Env = {
  DB: D1Database;
  /** Comma-separated list of origins allowed to call this API. */
  ALLOWED_ORIGINS?: string;
};

const DEFAULT_ORIGINS = ["https://caprarim.github.io", "http://localhost:3000"];

/** Crockford base32 without the ambiguous letters, so codes survive retyping. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function mintCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  // 20 bytes → exactly 32 characters → 160 bits of entropy.
  return out.match(/.{1,4}/g)!.join("-");
}

/** Codes are compared in a canonical form, so spacing and case never matter. */
function canonical(code: string): string {
  return code.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(canonical(code));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) ?? DEFAULT_ORIGINS).filter(
    Boolean,
  );
  const origin = request.headers.get("Origin") ?? "";
  const ok = allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] ?? "",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, init: ResponseInit & { cors: Record<string, string> }) {
  const { cors, ...rest } = init;
  return new Response(JSON.stringify(body), {
    ...rest,
    headers: { "Content-Type": "application/json", ...cors, ...(rest.headers ?? {}) },
  });
}

/** Resolves the bearer token to an account id, or null. Never trusts the body. */
async function authenticate(request: Request, env: Env): Promise<string | null> {
  const header = request.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const code = canonical(match[1]);
  if (code.length !== 32) return null;

  const row = await env.DB.prepare("select id from accounts where token_hash = ?")
    .bind(await hashCode(code))
    .first<{ id: string }>();
  if (!row) return null;

  await env.DB.prepare("update accounts set last_seen_at = ? where id = ?")
    .bind(Date.now(), row.id)
    .run();
  return row.id;
}

type SyncBody = {
  saved?: { id?: unknown }[];
  seen?: unknown[];
};

/** Guards against a client filling the database with junk. */
const LIMITS = { saved: 500, seen: 20000, payloadBytes: 8000 };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname === "/v1/health") {
      return json({ ok: true }, { cors });
    }

    // ── Create an account ──────────────────────────────────────────────────
    // No email, no password. The response contains the only copy of the code.
    if (url.pathname === "/v1/accounts" && request.method === "POST") {
      const code = mintCode();
      const id = crypto.randomUUID();
      const now = Date.now();

      await env.DB.prepare(
        "insert into accounts (id, token_hash, created_at, last_seen_at) values (?, ?, ?, ?)",
      )
        .bind(id, await hashCode(code), now, now)
        .run();

      return json({ accountId: id, recoveryCode: code }, { status: 201, cors });
    }

    const accountId = await authenticate(request, env);
    if (!accountId) {
      return json({ error: "unauthorised" }, { status: 401, cors });
    }

    // ── Read everything this account owns ──────────────────────────────────
    if (url.pathname === "/v1/state" && request.method === "GET") {
      return json(await readState(env, accountId), { cors });
    }

    // ── Merge the client's state in and hand back the union ────────────────
    // This is also the guest-to-account migration: a brand new account posts
    // everything built up before signing up, and gets it all back.
    if (url.pathname === "/v1/sync" && request.method === "POST") {
      let body: SyncBody;
      try {
        body = (await request.json()) as SyncBody;
      } catch {
        return json({ error: "invalid json" }, { status: 400, cors });
      }

      const now = Date.now();
      const statements: D1PreparedStatement[] = [];

      const saved = Array.isArray(body.saved) ? body.saved.slice(0, LIMITS.saved) : [];
      for (const idea of saved) {
        if (typeof idea?.id !== "string" || !idea.id) continue;
        const payload = JSON.stringify(idea);
        if (payload.length > LIMITS.payloadBytes) continue;
        statements.push(
          env.DB.prepare(
            `insert into saved_ideas (account_id, idea_id, payload, created_at)
             values (?, ?, ?, ?)
             on conflict (account_id, idea_id) do update set payload = excluded.payload`,
          ).bind(accountId, idea.id, payload, now),
        );
      }

      const seen = Array.isArray(body.seen) ? body.seen.slice(0, LIMITS.seen) : [];
      for (const id of seen) {
        if (typeof id !== "string" || !id || id.length > 200) continue;
        statements.push(
          env.DB.prepare(
            `insert into seen_ideas (account_id, idea_id, created_at) values (?, ?, ?)
             on conflict (account_id, idea_id) do nothing`,
          ).bind(accountId, id, now),
        );
      }

      // D1 caps how much a single batch can carry; chunk to stay well under it.
      for (let i = 0; i < statements.length; i += 50) {
        await env.DB.batch(statements.slice(i, i + 50));
      }

      return json(await readState(env, accountId), { cors });
    }

    // ── Remove one saved idea ──────────────────────────────────────────────
    const remove = url.pathname.match(/^\/v1\/saved\/(.+)$/);
    if (remove && request.method === "DELETE") {
      await env.DB.prepare("delete from saved_ideas where account_id = ? and idea_id = ?")
        .bind(accountId, decodeURIComponent(remove[1]))
        .run();
      return json({ ok: true }, { cors });
    }

    return json({ error: "not found" }, { status: 404, cors });
  },
};

async function readState(env: Env, accountId: string) {
  const [saved, seen] = await Promise.all([
    env.DB.prepare(
      "select payload from saved_ideas where account_id = ? order by created_at desc",
    )
      .bind(accountId)
      .all<{ payload: string }>(),
    env.DB.prepare("select idea_id from seen_ideas where account_id = ?")
      .bind(accountId)
      .all<{ idea_id: string }>(),
  ]);

  return {
    saved: (saved.results ?? [])
      .map((row) => {
        try {
          return JSON.parse(row.payload);
        } catch {
          return null;
        }
      })
      .filter(Boolean),
    seen: (seen.results ?? []).map((row) => row.idea_id),
  };
}
