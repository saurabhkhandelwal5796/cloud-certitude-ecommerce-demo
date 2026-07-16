/**
 * PKCE Authorization Code Callback Route Handler
 *
 * This handler exchanges the one-time authorization code returned by Supabase Auth
 * for a persistent user session cookie. It is used during:
 *   - Email Sign Up Verification
 *   - Password Recovery/Reset flow
 *
 * Flow:
 *   1. Supabase redirects the user to `/auth/callback?code=xxx` after verification.
 *   2. This handler exchanges `code` for a session token via `supabase.auth.exchangeCodeForSession()`.
 *   3. If successful, session cookies are automatically set, and the user is redirected to the target route.
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/cookie-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/profile";
  const type = requestUrl.searchParams.get("type"); // e.g. "recovery"

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If it is a password recovery redirect, forward the user to /reset-password with recovery query param
      if (type === "recovery") {
        return NextResponse.redirect(new URL(`/reset-password?type=recovery`, request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Fallback if exchange fails or code is missing, redirect to signin with error parameter
  return NextResponse.redirect(
    new URL(`/signin?error=Could not authenticate user session`, request.url)
  );
}
