"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Products", href: "/admin/products", icon: "👗" },
  { name: "Orders", href: "/admin/orders", icon: "📦" },
  { name: "Customers", href: "/admin/customers", icon: "👥" },
  { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

/**
 * AdminSidebar Component
 *
 * Renders the responsive side navigation panel for the admin module.
 * Incorporates a glassmorphic cream design matching the customer storefront.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      console.error("[AdminSidebar] Error logging out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const checkActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header Banner */}
      <div className="flex h-16 items-center justify-between border-b border-stone-200/50 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:hidden w-full sticky top-0 z-40">
        <Link
          href="/"
          className="text-sm font-black tracking-widest uppercase text-stone-850"
        >
          Cloud <span className="text-[#E0A99E] font-light">Certitude</span> Admin
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-stone-500 hover:bg-stone-100 focus:outline-none"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Toggle Sidebar</span>
          {isOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-stone-200/50 bg-white/90 backdrop-blur-md transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center px-6 border-b border-stone-100">
          <Link
            href="/"
            className="text-base font-black tracking-widest uppercase text-stone-850 hover:text-[#C68B7D] transition-colors"
          >
            Cloud <span className="text-[#E0A99E] font-light">Certitude</span>
            <span className="block text-[9px] font-bold text-stone-400 tracking-[0.25em] mt-0.5">
              FASHION ADMIN
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {SIDEBAR_ITEMS.map((item) => {
            const active = checkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition-all duration-200 ${
                  active
                    ? "bg-[#E0A99E]/10 text-[#C68B7D] border-l-2 border-[#E0A99E] shadow-sm shadow-[#E0A99E]/5"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-stone-100 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors uppercase tracking-wider"
          >
            <span className="text-sm">🏠</span> Storefront
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50/50 transition-colors uppercase tracking-wider text-left cursor-pointer"
          >
            <span className="text-sm">🚪</span>
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      {/* Backdrop (Mobile Only) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-stone-900/20 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
