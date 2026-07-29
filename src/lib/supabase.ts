import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional. The whole app — questions, generation, saving, the
 * never-repeat guarantee — runs with no backend at all. An account only adds
 * one thing: the same library on every device.
 *
 * When the two public env vars are absent (the default for a fresh clone) this
 * module returns null and every caller falls back to local-only behaviour.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

export type RemoteIdea = {
  idea_id: string;
  payload: unknown;
  created_at?: string;
};
