"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import CartBadge from "@/components/ui/CartBadge";

interface NavbarClientProps {
  user: {
    id: string;
    email?: string;
  } | null;
}

/**
 * NavbarClient Component
 *
 * Premium light glassmorphic navigation header styled for "Cloud Certitude Fashion".
 * Features warm charcoal text, rose gold buttons, and elegant visual states.
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
    <nav className="border-b border-stone-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50 text-stone-850 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl font-black tracking-widest uppercase text-stone-850 hover:text-[#C68B7D] transition-colors flex items-center gap-1.5"
            >
              Cloud <span className="text-[#E0A99E] font-light">Certitude</span> Fashion
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:block">
            <div className="flex space-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Men", href: "/men" },
                { name: "Women", href: "/women" },
                { name: "Kids", href: "/kids" },
                { name: "New Arrivals", href: "/new-arrivals" },
                { name: "Sale", href: "/sale", isSale: true },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-stone-900 ${
                    link.isSale ? "text-rose-500 hover:text-rose-600" : "text-stone-600 hover:text-stone-900"
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
                className="w-full rounded-full border border-stone-200 bg-stone-100/50 pl-4 pr-10 py-1.5 text-xs text-stone-850 placeholder-stone-400 shadow-sm focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 transition-all"
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-[#C68B7D] transition-colors cursor-pointer">
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
                className="text-stone-600 hover:text-[#C68B7D] transition-colors relative cursor-pointer"
                title="Wishlist"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="text-stone-600 hover:text-[#C68B7D] transition-colors relative p-1 cursor-pointer"
                title="Cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <CartBadge />
              </Link>

              {/* Profile / Auth Menu */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="text-stone-600 hover:text-[#C68B7D] transition-colors cursor-pointer"
                    title="Profile"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/signin"
                    className="text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-[#E0A99E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors cursor-pointer shadow-sm hover:shadow-[#E0A99E]/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Search */}
            <button onClick={() => alert("Search is coming soon!")} className="text-stone-600 hover:text-[#C68B7D] p-2 cursor-pointer md:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <Link href="/cart" className="text-stone-600 hover:text-[#C68B7D] p-2 relative cursor-pointer">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <CartBadge />
            </Link>

            {/* Hamburger toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus:outline-none cursor-pointer"
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
      <div className={`${isOpen ? "block" : "hidden"} lg:hidden border-t border-stone-200/50 bg-white/95 backdrop-blur-md`} id="mobile-menu">
        <div className="space-y-1 px-3 pb-4 pt-3">
          {[
            { name: "Home", href: "/" },
            { name: "Men", href: "/men" },
            { name: "Women", href: "/women" },
            { name: "Kids", href: "/kids" },
            { name: "New Arrivals", href: "/new-arrivals" },
            { name: "Sale", href: "/sale", isSale: true },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider hover:bg-stone-50 ${
                link.isSale ? "text-rose-500" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {currentUser ? (
            <div className="border-t border-stone-200/50 mt-4 pt-4 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50/50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="border-t border-stone-200/50 mt-4 pt-4 flex flex-col gap-2 px-3">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-md border border-stone-200 px-3 py-2 text-sm font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-md bg-[#E0A99E] px-3 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#D4988D]"
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
