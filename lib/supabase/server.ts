/**
 * Supabase Server Admin Client
 *
 * This is the server-side Supabase client for use in Server Components,
 * Route Handlers, and Server Actions. It uses the service role key
 * for privileged operations, bypassing Row Level Security.
 *
 * ⚠️  WARNING: NEVER expose the service role key to the browser.
 * Do not import this file in Client Components.
 *
 * Server Initialization:
 *   Uses a lazy singleton factory pattern `getSupabaseAdmin()` to prevent
 *   module-level crashes when environment variables are not yet present.
 *
 * Environment Variable Usage:
 *   - NEXT_PUBLIC_SUPABASE_URL: The unique endpoint for your Supabase project.
 *   - SUPABASE_SERVICE_ROLE_KEY: The secret key with administrative privileges.
 *
 * Future Extension Points:
 *   - Cookie-Based Auth via SSR: When user authentication is implemented,
 *     this file should be extended or duplicated to create a cookie-based client
 *     using `@supabase/ssr` to retrieve user sessions safe for SSR and routing.
 *     Example:
 *     ```typescript
 *     import { createServerClient } from '@supabase/ssr'
 *     // client wrapper that uses next/headers to read/write cookies
 *     ```
 *   - Webhooks & Background Workers: Use `getSupabaseAdmin()` inside API route handlers
 *     listening to Stripe webhooks or cron tasks to securely update databases (e.g., set order status).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

let _adminClient: SupabaseClient<Database> | null = null;

/**
 * Returns the singleton server-side Supabase admin client.
 * Throws a descriptive error if required env vars are missing.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_adminClient) return _adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "[Supabase Admin] Missing environment variables.\n" +
        "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.\n" +
        "See .env.example for reference."
    );
  }

  _adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
