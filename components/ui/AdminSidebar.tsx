"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAdminNav } from "@/components/ui/AdminNavigationContext";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  sectionLabel?: string; // optional section header above this item
}

interface AdminSidebarProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Products", href: "/admin/products", icon: "👗", sectionLabel: "Catalog" },
  { name: "Variants", href: "/admin/variants", icon: "🎨" },
  { name: "Navigation Tree", href: "/admin/navigation", icon: "🌲" },
  { name: "Attributes", href: "/admin/catalog/attributes", icon: "🏷️" },
  { name: "Facet Mappings", href: "/admin/catalog/facets", icon: "🔍" },
  { name: "Orders", href: "/admin/orders", icon: "📦", sectionLabel: "Operations" },
  { name: "Returns", href: "/admin/returns", icon: "🔄" },
  { name: "Customers", href: "/admin/customers", icon: "👥" },
  { name: "Reviews", href: "/admin/reviews", icon: "💬", sectionLabel: "Insights" },
  { name: "AI Recommendations", href: "/admin/recommendations", icon: "✨" },
  { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Activity Audit", href: "/admin/activity", icon: "📜" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️", sectionLabel: "Config" },
];


/**
 * AdminSidebar Component
 *
 * Renders the responsive side navigation panel for the admin module.
 * Incorporates a glassmorphic cream design matching the customer storefront.
 */
export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerReset } = useAdminNav();
  const [isOpen, setIsOpen] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-stone-200/50 bg-white/90 backdrop-blur-md transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex shrink-0 h-20 items-center px-6 border-b border-stone-100 bg-white/90 sticky top-0 z-10 backdrop-blur-md">
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
        <nav className="flex-1 space-y-0.5 px-4 py-6 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const active = checkActive(item.href);
            return (
              <React.Fragment key={item.name}>
                {item.sectionLabel && (
                  <p className="pt-4 pb-1 px-4 text-[8px] font-extrabold uppercase tracking-[0.2em] text-stone-300 select-none">
                    {item.sectionLabel}
                  </p>
                )}
                <Link
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    if (pathname === item.href) {
                      triggerReset();
                    }
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs uppercase font-extrabold tracking-wider transition-all duration-300 transform ${
                    active
                      ? "bg-[#E0A99E]/15 text-[#C68B7D] border-l-2 border-[#E0A99E] shadow-sm shadow-[#E0A99E]/5 scale-[1.02]"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900 hover:scale-[1.02] hover:translate-x-1"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              </React.Fragment>
            );
          })}
          {user && (
            <div className="pt-4 mt-4 border-t border-stone-100/50">
              <Link
                href="/admin/profile"
                title="Open profile"
                aria-label="Open profile"
                className="flex items-center justify-center w-full py-2.5 rounded-2xl bg-stone-50 border border-stone-100 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-stone-100 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E0A99E]/20 text-[#C68B7D] flex items-center justify-center font-bold overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base">👤</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider group-hover:text-stone-900 transition-colors">Profile</span>
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-stone-100 p-4 space-y-2 bg-white/90 sticky bottom-0 z-10 backdrop-blur-md">
          <Link
            href="/?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors uppercase tracking-wider"
          >
            <span className="text-sm">🏠</span> View Storefront
          </Link>
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
