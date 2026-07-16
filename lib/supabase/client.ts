/**
 * Supabase Browser Client
 *
 * This is the client-side Supabase client for use in Client Components.
 * It reads the public env vars exposed to the browser.
 *
 * Authentication will be configured in a future phase.
 *
 * Usage:
 *   import { getSupabaseClient } from "@/lib/supabase/client";
 *   const supabase = getSupabaseClient();
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns the singleton browser-side Supabase client.
 * Throws a descriptive error if required env vars are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Supabase] Missing environment variables.\n" +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n" +
        "See .env.example for reference."
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}
