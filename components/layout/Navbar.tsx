import React from "react";
import { createServerClient } from "@/lib/supabase/cookie-client";
import NavbarClient from "./NavbarClient";

/**
 * Navbar (Server Component Wrapper)
 *
 * Reads session cookies on the server to prevent layout flashes
 * when evaluating authenticated vs. unauthenticated states.
 * Passes user context to the Client Component navbar.
 */
export default async function Navbar() {
  // Suppress warnings in environments without Supabase configured
  let user = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch {
    // Silent fail if Supabase is unconfigured (defaults to logged-out navbar)
  }

  return <NavbarClient user={user ? { id: user.id, email: user.email } : null} />;
}
