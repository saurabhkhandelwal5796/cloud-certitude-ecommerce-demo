/**
 * Supabase Server Client
 *
 * This is the server-side Supabase client for use in Server Components,
 * Route Handlers, and Server Actions. It uses the service role key
 * for privileged operations, bypassing Row Level Security.
 *
 * ⚠️  NEVER expose the service role key to the browser.
 * Authentication will be configured in a future phase.
 *
 * Usage:
 *   import { getSupabaseAdmin } from "@/lib/supabase/server";
 *   const supabase = getSupabaseAdmin();
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Returns the singleton server-side Supabase admin client.
 * Throws a descriptive error if required env vars are missing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "[Supabase] Missing environment variables.\n" +
        "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.\n" +
        "See .env.example for reference."
    );
  }

  _adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
