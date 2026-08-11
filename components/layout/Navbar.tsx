import React from "react";
import { createServerClient } from "@/lib/supabase/cookie-client";
import NavbarClient from "./NavbarClient";
import { getNavTree } from "@/services/NavigationService";

/**
 * Navbar (Server Component Wrapper)
 *
 * Reads session cookies on the server to prevent layout flashes
 * when evaluating authenticated vs. unauthenticated states.
 * Passes user context and the dynamic navigation tree to NavbarClient.
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

  // Fetch navigation tree (cached 5 min via unstable_cache)
  const navTree = await getNavTree();

  return (
    <NavbarClient
      user={user ? { id: user.id, email: user.email } : null}
      navTree={navTree}
    />
  );
}
