"use client";

import React, { useState, useEffect } from "react";
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
 * Premium navigation header styled for "Cloud Certitude Fashion".
 * Integrates dynamic routing, search inputs, active wishlist/cart indicators,
 * and maintains reactive user session rendering.
 */
export default function NavbarClient({ user }: NavbarClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [searchQuery, setSearchQuery] = useState("");



  useEffect(() => {
    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth Navbar] Auth State Changed Event: ${event}`);

      if (session) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
        });
      } else {
        setCurrentUser(null);
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch {
      console.error("[Auth Navbar] Unexpected error during logout");
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Search feature is coming soon! Query: "${searchQuery}"`);
    }
  };

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl font-black tracking-widest uppercase hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              Cloud <span className="text-emerald-400 font-light">Certitude</span> Fashion
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:block">
            <div className="flex space-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Men", href: "#men" },
                { name: "Women", href: "#women" },
                { name: "Kids", href: "#kids" },
                { name: "New Arrivals", href: "#new-arrivals" },
                { name: "Sale", href: "#sale", isSale: true },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white ${
                    link.isSale ? "text-rose-400" : "text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Search & Controls */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-sm lg:max-w-xs justify-end">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full rounded-full border border-white/10 bg-white/5 pl-4 pr-10 py-1.5 text-xs text-white placeholder-slate-500 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Icons */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Wishlist */}
              <button
                onClick={() => alert("Wishlist is coming soon!")}
                className="text-slate-300 hover:text-white transition-colors relative cursor-pointer"
                title="Wishlist"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Cart */}
              <button
                onClick={() => alert("Cart is coming soon!")}
                className="text-slate-300 hover:text-white transition-colors relative cursor-pointer"
                title="Cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-[10px] text-slate-950 font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </button>

              {/* Profile / Auth Menu */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Profile"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/signin"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Search (small viewport icon click triggers modal/search page in future, for now dummy click) */}
            <button onClick={() => alert("Search is coming soon!")} className="text-slate-300 hover:text-white p-2 cursor-pointer md:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <button onClick={() => alert("Cart is coming soon!")} className="text-slate-300 hover:text-white p-2 relative cursor-pointer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-0.5 right-0.5 bg-emerald-500 text-[8px] text-slate-950 font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Hamburger toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none cursor-pointer"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`${isOpen ? "block" : "hidden"} lg:hidden border-t border-white/5 bg-slate-950`} id="mobile-menu">
        <div className="space-y-1 px-3 pb-4 pt-3">
          {[
            { name: "Home", href: "/" },
            { name: "Men", href: "#men" },
            { name: "Women", href: "#women" },
            { name: "Kids", href: "#kids" },
            { name: "New Arrivals", href: "#new-arrivals" },
            { name: "Sale", href: "#sale", isSale: true },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-white/5 ${
                link.isSale ? "text-rose-400" : "text-slate-300 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {currentUser ? (
            <div className="border-t border-white/5 mt-4 pt-4 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="border-t border-white/5 mt-4 pt-4 flex flex-col gap-2 px-3">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-md border border-white/10 px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold uppercase tracking-wider text-slate-950 hover:bg-emerald-400"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
