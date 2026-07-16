/**
 * Supabase Cookie-Based Server Client
 *
 * This client is designed for use in Server Components, Server Actions,
 * and Route Handlers. It automatically handles cookie synchronization with Next.js headers,
 * ensuring user sessions are persisted correctly across SSR pages.
 *
 * Session Management:
 *   - Cookies are read from the incoming request headers.
 *   - If any auth cookies are refreshed or modified during requests, they are set
 *     on the response headers using Next.js `cookies()`.
 *
 * Usage:
 *   import { createServerClient } from "@/lib/supabase/cookie-client";
 *   const supabase = await createServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./types";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
