import type { Idea } from "./engine/types";

/**
 * Client for the Kindling API (a Cloudflare Worker over D1).
 *
 * Accounts have no email and no password. The server mints a 160-bit recovery
 * code, stores only its hash, and that code is the bearer token. It is kept in
 * localStorage — but only the *key*: every saved idea and every seen
 * fingerprint lives in the database, scoped server-side to the account the
 * token resolves to.
 */

const BASE = process.env.NEXT_PUBLIC_KINDLING_API ?? "";
const TOKEN_KEY = "kindling.token";

export const isCloudConfigured = Boolean(BASE);

export type RemoteState = { saved: Idea[]; seen: string[] };

export function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode. The session still works; it just won't survive a reload.
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!BASE) throw new ApiError("No API configured", 0);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection.", 0);
  }

  if (res.status === 401) throw new ApiError("That code isn't recognised.", 401);
  if (!res.ok) throw new ApiError(`Something went wrong (${res.status}).`, res.status);
  return (await res.json()) as T;
}

/** Creates an account and returns the one and only copy of its recovery code. */
export async function createAccount(): Promise<string> {
  const { recoveryCode } = await call<{ recoveryCode: string }>("/v1/accounts", { method: "POST" });
  return recoveryCode;
}

/** Confirms a code is real by fetching the state it unlocks. */
export function fetchState(token: string): Promise<RemoteState> {
  return call<RemoteState>("/v1/state", {}, token);
}

/**
 * Pushes local state up and gets the union back. This doubles as the
 * guest-to-account migration — a brand new account posts everything built up
 * before signing up and receives all of it.
 */
export function syncState(token: string, saved: Idea[], seen: string[]): Promise<RemoteState> {
  return call<RemoteState>(
    "/v1/sync",
    { method: "POST", body: JSON.stringify({ saved, seen }) },
    token,
  );
}

export function deleteSaved(token: string, ideaId: string): Promise<{ ok: boolean }> {
  return call<{ ok: boolean }>(
    `/v1/saved/${encodeURIComponent(ideaId)}`,
    { method: "DELETE" },
    token,
  );
}

/** Display form: groups of four, which is how the server mints them. */
export function formatCode(code: string): string {
  const clean = code.toUpperCase().replace(/[^0-9A-Z]/g, "");
  return clean.match(/.{1,4}/g)?.join("-") ?? clean;
}
