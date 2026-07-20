/**
 * Supabase Middleware Session Manager
 *
 * This file contains middleware logic to refresh session tokens using cookies.
 * It ensures that even if a user is browsing static or cached pages, their
 * auth cookie remains fresh and valid.
 *
 * Session Refresh:
 *   - The browser automatically sends the supabase auth token in cookies.
 *   - We check and refresh this token via `supabase.auth.getUser()`.
 *   - Any updated cookies are passed to both the downstream request and the upstream response.
 *
 * Protected Route Handling:
 *   - If the user attempts to access `/profile` without a session, they are redirected to `/signin`.
 *   - If the user attempts to access login pages (`/signin`, `/signup`, `/forgot-password`, `/reset-password`)
 *     while already authenticated, they are automatically redirected to `/profile`.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "./types";

export async function updateSession(request: NextRequest) {
  request.headers.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Calling getUser() refreshes the session cookie automatically if expired.
  // Do not use getSession() since it is insecure and relies on cookie content without verification.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin" || user.email === "admin@cloudcertitude.com";
    } catch {
      isAdmin = user.email === "admin@cloudcertitude.com";
    }
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/checkout") ||
    request.nextUrl.pathname.startsWith("/orders") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    isAdminRoute;

  const isAuthRoute = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(request.nextUrl.pathname);

  // Route Protection Logic
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    // Keep track of the original destination to redirect back after sign in if needed
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes from non-admin users
  if (isAdminRoute && user && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // If the user is resetting password, allow them to view /reset-password if they came via the email link,
    // but standard users should go to /profile.
    if (request.nextUrl.pathname === "/reset-password") {
      // Check if they have the recovery type flow or access token
      const hasRecoveryType = request.nextUrl.searchParams.get("type") === "recovery";
      if (hasRecoveryType) {
        return supabaseResponse;
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
