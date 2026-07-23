"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import CartBadge from "@/components/ui/CartBadge";
import WishlistBadge from "@/components/ui/WishlistBadge";
import { formatPrice } from "@/utils";
import {
  getUserNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
  clearNotifications,
  InAppNotification,
} from "@/services/AdminService";

// Helper functions for custom notification UI
function getNotificationIcon(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("placed")) return "🛒";
  if (msg.includes("processing")) return "⚙️";
  if (msg.includes("shipped")) return "🚚";
  if (msg.includes("delivered")) return "✅";
  if (msg.includes("cancelled")) return "❌";
  return "🔔";
}

function getRelativeTime(timestamp: string): string {
  const parsed = Date.parse(timestamp);
  if (isNaN(parsed)) return timestamp;
  const diffMs = Date.now() - parsed;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  return `${diffDay} days ago`;
}

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

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const [profileName, setProfileName] = useState<string>("User");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleLiveSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Clear search state on page change
  useEffect(() => {
    closeModal();
  }, [pathname]);

  const handleLiveSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, brand, images")
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (!error && data) {
        setSearchResults(data);
      }
    } catch (e) {
      console.error("[LiveSearch] Error:", e);
    }
  };

  // In-App Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchProfileDetails = async () => {
    if (!currentUser) return;
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("role, name, avatar_url")
        .eq("id", currentUser.id)
        .single();
        
      if (data) {
        setProfileName(data.name || (currentUser.email ? currentUser.email.split("@")[0] : "User"));
        setProfileAvatarUrl(data.avatar_url || null);
        const role = data.role || (currentUser.email === "admin@cloudcertitude.com" ? "admin" : "customer");
        setUserRole(role as "admin" | "customer");
      }
    } catch (err) {
      console.error("[NavbarClient] fetchProfileDetails error:", err);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
    window.addEventListener("certitude_profile_updated", fetchProfileDetails);
    return () => {
      window.removeEventListener("certitude_profile_updated", fetchProfileDetails);
    };
  }, [currentUser]);

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
        // Fetch role, name, avatar_url
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name, avatar_url")
          .eq("id", session.user.id)
          .single();
        const role = profile?.role || (session.user.email === "admin@cloudcertitude.com" ? "admin" : "customer");
        setUserRole(role as "admin" | "customer");
        setProfileName(profile?.name || (session.user.email ? session.user.email.split("@")[0] : "User"));
        setProfileAvatarUrl(profile?.avatar_url || null);
      } else {
        setCurrentUser(null);
        setUserRole("customer");
        setProfileName("User");
        setProfileAvatarUrl(null);
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    // Fetch role, name, avatar_url on initial mount if user already logged in
    if (user) {
      supabase.from("profiles").select("role, name, avatar_url").eq("id", user.id).single().then(({ data }) => {
        const role = data?.role || (user.email === "admin@cloudcertitude.com" ? "admin" : "customer");
        setUserRole(role as "admin" | "customer");
        setProfileName(data?.name || (user.email ? user.email.split("@")[0] : "User"));
        setProfileAvatarUrl(data?.avatar_url || null);
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeModal();
    }
  };

  const handleMarkAllRead = () => {
    if (currentUser && currentUser.email) {
      markNotificationsAsRead(currentUser.email);
    }
  };

  const handleClearAll = () => {
    if (currentUser && currentUser.email) {
      clearNotifications(currentUser.email);
    }
  };

  const handleBellClick = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && currentUser && currentUser.email) {
      markNotificationsAsRead(currentUser.email);
    }
  };

  const handleNotificationClick = (notif: InAppNotification) => {
    if (currentUser && currentUser.email) {
      if (!notif.isRead) {
        markNotificationAsRead(currentUser.email, notif.id);
      }
    }
    setShowNotifications(false);
    if (notif.targetUrl) {
      router.push(notif.targetUrl);
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
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-extrabold uppercase tracking-widest transition-colors ${
                    link.isSale
                      ? "text-rose-500 hover:text-rose-600"
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
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-xl lg:max-w-lg justify-end">
            {/* Search Input */}
            {/* Search Icon */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-stone-600 hover:text-[#C68B7D] transition-colors relative cursor-pointer p-1"
              title="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

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
                    onClick={handleBellClick}
                    className="text-stone-600 hover:text-[#C68B7D] transition-colors relative p-1 cursor-pointer focus:outline-none"
                    title="Notifications"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white ring-2 ring-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3.5 w-[380px] bg-white border border-stone-200/50 shadow-2xl rounded-2xl p-4 z-50 backdrop-blur-md max-h-[500px] overflow-y-auto text-left animate-fade-in">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-900">
                          In-App Notifications
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest cursor-pointer"
                          >
                            Mark all read
                          </button>
                          {notifications.length > 0 && (
                            <>
                              <span className="text-stone-200 text-[9px]">|</span>
                              <button
                                onClick={handleClearAll}
                                className="text-[9px] font-extrabold text-stone-400 hover:text-stone-600 uppercase tracking-widest cursor-pointer"
                              >
                                Clear all
                              </button>
                            </>
                          )}
                        </div>
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
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 rounded-xl border transition-all text-xs flex gap-3 relative cursor-pointer ${
                                notif.isRead
                                  ? "bg-transparent border-stone-100 hover:bg-stone-50/80 text-stone-500 font-light"
                                  : "bg-[#E0A99E]/5 border-[#E0A99E]/10 hover:bg-[#E0A99E]/10 text-stone-900 font-medium"
                              }`}
                            >
                              <span className="text-base flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notif.message)}
                              </span>
                              <div className="flex-1 min-w-0 pr-2 text-left">
                                <p className="leading-snug">{notif.message}</p>
                                <span className="block text-[8px] text-stone-400 font-light mt-1">
                                  {getRelativeTime(notif.timestamp)}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <span className="absolute top-4 right-3.5 block h-1.5 w-1.5 rounded-full bg-[#E0A99E]" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* Profile / Auth Dropdown Menu */}
              {currentUser ? (
                <div ref={dropdownRef} className="relative group flex items-center">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:text-[#C68B7D] transition-colors relative cursor-pointer focus:outline-none"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center flex-shrink-0">
                      {profileAvatarUrl ? (
                        <img
                          src={profileAvatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#C68B7D]">
                          {profileName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 hidden sm:inline-block max-w-[100px] truncate">
                      {profileName}
                    </span>
                    <span className="text-[10px] text-stone-400 group-hover:text-[#C68B7D] transition-colors ml-0.5">▼</span>
                  </button>

                  {/* Dropdown Card */}
                  <div className={`absolute right-0 top-full mt-2 w-[220px] bg-white border border-stone-200/50 shadow-2xl rounded-2xl p-3 z-50 backdrop-blur-md transition-all duration-200 text-left ${
                    showDropdown 
                      ? "opacity-100 pointer-events-auto" 
                      : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:opacity-100 hover:pointer-events-auto"
                  }`}>
                    <div className="border-b border-stone-100 pb-2 mb-2 px-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#E0A99E]">
                        Account
                      </span>
                      <span className="block text-[10px] text-stone-400 truncate mt-0.5">
                        {currentUser.email}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <svg className="h-4 w-4 text-rose-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
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
            <button onClick={() => router.push("/search")} className="text-stone-600 hover:text-[#C68B7D] p-2 cursor-pointer md:hidden">
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
              className={`block rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider ${
                link.isSale
                  ? "text-rose-500 hover:bg-rose-50"
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="fixed top-[100px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full max-w-[700px] bg-white rounded-3xl border border-stone-200/50 shadow-2xl p-6 flex flex-col gap-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                Premium Search Catalog
              </span>
              <button
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Input field */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full rounded-full border border-stone-250 bg-stone-50/50 pl-5 pr-12 py-3 text-sm text-stone-850 placeholder-stone-400 shadow-sm focus:border-[#E0A99E]/80 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/80 transition-all font-medium"
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-[#C68B7D] transition-colors cursor-pointer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Live search results */}
            <div className="overflow-y-auto max-h-[400px] min-h-0 pr-1">
              {searchResults.length > 0 ? (
                <div className="space-y-2 divide-y divide-stone-100/50">
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.id}`}
                      className="flex items-center gap-4 py-3 first:pt-0 rounded-2xl hover:bg-stone-50/60 px-2 -mx-2 transition-colors text-left"
                      onClick={closeModal}
                    >
                      <div className="relative h-14 w-11 overflow-hidden rounded-lg bg-stone-50 border border-stone-100 flex-shrink-0">
                        <img
                          src={prod.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"}
                          alt={prod.name}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-850 line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                          {prod.brand || "Cloud Certitude"}
                        </p>
                      </div>
                      <span className="text-xs font-black text-stone-900 pr-1">
                        {formatPrice(prod.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                debouncedQuery.trim() && (
                  <div className="py-12 text-center text-xs text-stone-400 font-light">
                    No matching products found.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
