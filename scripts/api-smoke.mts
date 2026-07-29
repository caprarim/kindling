/**
 * End-to-end check of the API's contract.
 *
 * Run against a local worker (`cd api && npm run dev`) or a deployed one:
 *   KINDLING_API=http://127.0.0.1:8787 npm run smoke:api
 *
 * The point is the cross-device promise: a fingerprint recorded on one "device"
 * must come back on another, or "never the same idea twice" is only true per
 * browser.
 */
const base = process.env.KINDLING_API ?? "http://127.0.0.1:8787";
const origin = "http://localhost:3000";

const ok = (label: string) => console.log(`✓ ${label}`);

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

async function call(path: string, init: RequestInit = {}, token?: string) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  return { res, body: text ? JSON.parse(text) : null };
}

// ── health ────────────────────────────────────────────────────────────────
{
  const { res, body } = await call("/v1/health");
  assert(res.status === 200 && body.ok, `health failed: ${res.status}`);
  assert(
    res.headers.get("access-control-allow-origin") === origin,
    "CORS did not echo the allowed origin",
  );
  ok("health responds and CORS allows the site origin");
}

// ── unauthenticated access is refused ─────────────────────────────────────
{
  const { res } = await call("/v1/state");
  assert(res.status === 401, `expected 401 without a token, got ${res.status}`);
  const bogus = await call("/v1/state", {}, "ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ");
  assert(bogus.res.status === 401, `expected 401 for a bogus token, got ${bogus.res.status}`);
  ok("no token and wrong token are both refused");
}

// ── account creation ──────────────────────────────────────────────────────
const { body: account } = await call("/v1/accounts", { method: "POST" });
assert(typeof account.recoveryCode === "string", "no recovery code returned");
assert(
  account.recoveryCode.replace(/-/g, "").length === 32,
  `recovery code should be 32 chars, got ${account.recoveryCode.replace(/-/g, "").length}`,
);
ok(`account created, code looks like ${account.recoveryCode.slice(0, 9)}…`);

const token = account.recoveryCode;

// ── guest state migrates in ───────────────────────────────────────────────
const guestSaved = [
  { id: "food.waste.food:tired.tracker.offline", title: "Larderloop", pitch: "…" },
  { id: "dev.debug.dev:juniors.library.slow", title: "Traceyard", pitch: "…" },
];
const guestSeen = [
  "food.waste.food:tired.tracker.offline",
  "dev.debug.dev:juniors.library.slow",
  "home.chores.home:sharers.nudger.sixtysec",
];

{
  const { res, body } = await call(
    "/v1/sync",
    { method: "POST", body: JSON.stringify({ saved: guestSaved, seen: guestSeen }) },
    token,
  );
  assert(res.status === 200, `sync failed: ${res.status}`);
  assert(body.saved.length === 2, `expected 2 saved, got ${body.saved.length}`);
  assert(body.seen.length === 3, `expected 3 seen, got ${body.seen.length}`);
  ok("guest state migrated into a fresh account");
}

// ── a second device sees it, formatted differently ────────────────────────
{
  const messy = token.toLowerCase().replace(/-/g, " ");
  const { res, body } = await call("/v1/state", {}, messy);
  assert(res.status === 200, `second device rejected: ${res.status}`);
  assert(body.seen.length === 3, `second device saw ${body.seen.length} seen ids, expected 3`);
  assert(
    body.saved.some((i: { title: string }) => i.title === "Larderloop"),
    "second device did not receive the saved idea",
  );
  ok("a second device with the same code (lowercased, spaced) sees the same library");
}

// ── sync is a merge, not a replace ────────────────────────────────────────
{
  const { body } = await call(
    "/v1/sync",
    {
      method: "POST",
      body: JSON.stringify({ saved: [], seen: ["climate.growing.climate:gardeners.planner.seasonal"] }),
    },
    token,
  );
  assert(body.seen.length === 4, `merge lost history: expected 4 seen, got ${body.seen.length}`);
  assert(body.saved.length === 2, `merge dropped saved ideas: got ${body.saved.length}`);
  ok("posting new state merges rather than replacing");
}

// ── deletes are scoped, and other accounts cannot reach in ────────────────
{
  await call(`/v1/saved/${encodeURIComponent(guestSaved[0].id)}`, { method: "DELETE" }, token);
  const { body } = await call("/v1/state", {}, token);
  assert(body.saved.length === 1, `delete did not take: ${body.saved.length} left`);

  const { body: other } = await call("/v1/accounts", { method: "POST" });
  const { body: otherState } = await call("/v1/state", {}, other.recoveryCode);
  assert(otherState.saved.length === 0 && otherState.seen.length === 0, "accounts are not isolated");
  ok("delete is scoped to the account, and a new account sees nothing of it");
}

console.log("\nAll API checks passed.");
