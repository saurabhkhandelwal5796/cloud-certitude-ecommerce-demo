"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import CartBadge from "@/components/ui/CartBadge";
import WishlistBadge from "@/components/ui/WishlistBadge";
import {
  getUserNotifications,
  markNotificationsAsRead,
  InAppNotification,
} from "@/services/AdminService";

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
 * Features warm charcoal text, rose gold buttons, interactive notifications, and order links.
 */
export default function NavbarClient({ user }: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "customer">("customer");

  // In-App Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync auth state changes
  useEffect(() => {
    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth Navbar] Auth State Changed Event: ${event}`);

      if (session) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
        });
        // Fetch role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = profile?.role || (session.user.email === "admin@cloudcertitude.com" ? "admin" : "customer");
        setUserRole(role as "admin" | "customer");
      } else {
        setCurrentUser(null);
        setUserRole("customer");
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    // Fetch role on initial mount if user already logged in
    if (user) {
      supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
        const role = data?.role || (user.email === "admin@cloudcertitude.com" ? "admin" : "customer");
        setUserRole(role as "admin" | "customer");
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, user]);

  // Sync notifications on user session changes or custom events
  useEffect(() => {
    const handleUpdate = () => {
      if (currentUser && currentUser.email) {
        setNotifications(getUserNotifications(currentUser.email));
      } else {
        setNotifications([]);
      }
    };

    // Defer initialization to avoid synchronous setState inside the effect body
    setTimeout(handleUpdate, 0);

    window.addEventListener("certitude_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("certitude_notifications_updated", handleUpdate);
    };
  }, [currentUser]);

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

  const handleMarkAllRead = () => {
    if (currentUser && currentUser.email) {
      markNotificationsAsRead(currentUser.email);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                ...(userRole === "admin" ? [
                  { name: "Customer View", href: "/", isAdmin: true },
                  { name: "Admin Portal", href: "/admin", isAdmin: true },
                  { name: "Users", href: "/admin/users", isAdmin: true },
                ] : []),
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-extrabold uppercase tracking-widest transition-colors ${
                    (link as {isSale?:boolean}).isSale
                      ? "text-rose-500 hover:text-rose-600"
                      : (link as {isAdmin?:boolean}).isAdmin
                      ? pathname === link.href
                        ? "text-violet-600 border-b-2 border-violet-400 pb-0.5"
                        : "text-violet-500 hover:text-violet-700"
                      : pathname === link.href
                      ? "text-[#C68B7D] border-b-2 border-[#C68B7D] pb-0.5"
                      : "text-stone-600 hover:text-[#C68B7D]"
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
            <div className="flex items-center gap-4 flex-shrink-0 relative">
              
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="text-stone-600 hover:text-[#C68B7D] transition-colors relative cursor-pointer p-1"
                title="Wishlist"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <WishlistBadge />
              </Link>

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

              {/* In-app Notification Bell (Visible if signed in) */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-stone-600 hover:text-[#C68B7D] transition-colors relative p-1 cursor-pointer focus:outline-none"
                    title="Notifications"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </button>

                  {/* Notification Dropdown Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3.5 w-80 bg-white border border-stone-200/50 shadow-2xl rounded-2xl p-4 z-50 backdrop-blur-md max-h-[350px] overflow-y-auto text-left animate-fade-in">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-900">
                          In-App Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <p className="text-stone-400 font-light text-center py-6 text-xs">
                          No notifications yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-2.5 rounded-xl border transition-all text-xs relative ${
                                notif.isRead
                                  ? "bg-stone-50/50 border-stone-100 text-stone-500 font-light"
                                  : "bg-[#E0A99E]/5 border-[#E0A99E]/10 text-stone-900 font-medium"
                              }`}
                            >
                              <p className="pr-4">{notif.message}</p>
                              <span className="block text-[8px] text-stone-400 font-light mt-1 text-right">
                                {notif.timestamp}
                              </span>
                              {!notif.isRead && (
                                <span className="absolute top-3.5 right-2 block h-1.5 w-1.5 rounded-full bg-[#E0A99E]" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Orders list link (Clipboard Icon) */}
              {currentUser && (
                <Link
                  href="/orders"
                  className="text-stone-600 hover:text-[#C68B7D] transition-colors relative p-1 cursor-pointer"
                  title="My Orders"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </Link>
              )}

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
            ...(userRole === "admin" ? [
              { name: "Customer View", href: "/", isAdmin: true },
              { name: "Admin Portal", href: "/admin", isAdmin: true },
              { name: "Users", href: "/admin/users", isAdmin: true },
            ] : []),
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider ${
                (link as {isSale?:boolean}).isSale
                  ? "text-rose-500 hover:bg-rose-50"
                  : (link as {isAdmin?:boolean}).isAdmin
                  ? "text-violet-600 hover:bg-violet-50"
                  : pathname === link.href
                  ? "text-[#C68B7D] bg-[#E0A99E]/10"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {currentUser ? (
            <div className="border-t border-stone-200/50 mt-4 pt-4 space-y-1">
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50"
              >
                My Orders
              </Link>
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
