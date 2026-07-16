/**
 * Supabase Browser Client
 *
 * This is the client-side Supabase client for use in Client Components.
 * It reads public environment variables exposed to the browser.
 *
 * Client-side calls are limited by Row Level Security (RLS) configured on
 * the database. This client can be used to query public data, sign in/out
 * users, manage user sessions, and upload files to public storage buckets.
 *
 * Client Initialization:
 *   Uses a lazy singleton factory pattern `getSupabaseClient()` to prevent
 *   module-level crashes when environment variables are not yet present
 *   (e.g., during Next.js build-time compile or initial dev spin-up).
 *
 * Environment Variable Usage:
 *   - NEXT_PUBLIC_SUPABASE_URL: The unique endpoint for your Supabase project.
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Safe to expose public key that is used to
 *     identify client requests and respect Row Level Security (RLS) policies.
 *
 * Future Extension Points:
 *   - Authentication listeners: Use `supabase.auth.onAuthStateChange()` to handle
 *     tokens/session refreshes and synchronize state across application components.
 *   - Real-time updates: Enable Realtime channel subscriptions to broadcast cart,
 *     inventory, or order status changes directly to the client.
 */

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

let _client: SupabaseClient<Database> | null = null;

/**
 * Returns the singleton browser-side Supabase client.
 * Throws a descriptive error if required env vars are missing.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Supabase Client] Missing environment variables.\n" +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n" +
        "See .env.example for reference."
    );
  }

  _client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return _client;
}
