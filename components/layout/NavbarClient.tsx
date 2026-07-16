"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

interface NavbarClientProps {
  user: {
    id: string;
    email?: string;
  } | null;
}

/**
 * NavbarClient Component
 *
 * Renders the responsive header navigation bar for the e-commerce store.
 * Adapts based on authentication state provided by the Server Component parent.
 * Includes a mobile hamburger drawer toggle and logout functions.
 */
export default function NavbarClient({ user }: NavbarClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="border-b border-white/10 bg-slate-950 text-white backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand/Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold tracking-widest uppercase hover:text-emerald-400 transition-colors"
            >
              Certitude <span className="text-emerald-400 font-light">Atelier</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`${isOpen ? "block" : "hidden"} md:hidden border-t border-white/10 bg-slate-950`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block rounded-md bg-emerald-500 px-3 py-2 text-center text-base font-medium text-slate-950 hover:bg-emerald-400 mt-2"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
