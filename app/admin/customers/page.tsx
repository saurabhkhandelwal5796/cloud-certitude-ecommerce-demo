"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils";
import {
  getCustomers,
  updateUserRole,
  updateUserStatus,
  AdminCustomer,
} from "@/services/AdminService";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Salesforce Contact-Style Customer List View
 *
 * Consolidated customer and user management workspace providing:
 * - Dynamic list view with search, filter presets, and sorting
 * - Enterprise contact attributes (Phone, Location, Registration, Orders, Spends)
 * - Clickable customer row navigation to dedicated Customer Detail View
 * - Inline user administration (Role management & Status toggle)
 */
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPreset, setFilterPreset] = useState<"all" | "customers" | "admins" | "active" | "with_orders">("all");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc" | "spend_desc" | "orders_desc" | "name_asc">("created_desc");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      const list = await getCustomers();
      setCustomers(list);
    } catch (err: any) {
      console.error("[AdminCustomers] Error loading customer registry:", err);
      setError(err?.message || "Unable to load customer database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3500);
  };

  const handleRoleChange = async (userId: string | undefined, newRole: "admin" | "customer", customerEmail: string) => {
    if (!userId) {
      showToast("Cannot update user without a valid profile ID", "error");
      return;
    }
    if (userId === currentUserId && newRole === "customer") {
      showToast("Security Protection: You cannot revoke your own Admin role.", "error");
      return;
    }
    const success = await updateUserRole(userId, newRole);
    if (success) {
      showToast(`Updated ${customerEmail} role to ${newRole.toUpperCase()}.`);
      loadData();
    } else {
      showToast("Failed to update role.", "error");
    }
  };

  const handleStatusToggle = async (userId: string | undefined, currentStatus: string | null | undefined, customerEmail: string) => {
    if (!userId) {
      showToast("Cannot update user without a valid profile ID", "error");
      return;
    }
    if (userId === currentUserId) {
      showToast("Security Protection: You cannot disable your own active account.", "error");
      return;
    }
    const targetStatus = currentStatus === "disabled" ? "active" : "disabled";
    const success = await updateUserStatus(userId, targetStatus);
    if (success) {
      showToast(`Account for ${customerEmail} set to ${targetStatus.toUpperCase()}.`);
      loadData();
    } else {
      showToast("Failed to update account status.", "error");
    }
  };

  // Filtered and Sorted list
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Preset Filter
        if (filterPreset === "customers" && c.role === "admin") return false;
        if (filterPreset === "admins" && c.role !== "admin") return false;
        if (filterPreset === "active" && c.status === "disabled") return false;
        if (filterPreset === "with_orders" && c.ordersCount === 0) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (c.name || "").toLowerCase().includes(q);
          const matchEmail = (c.email || "").toLowerCase().includes(q);
          const matchPhone = (c.phone || "").toLowerCase().includes(q);
          const matchCity = (c.city || "").toLowerCase().includes(q);
          const matchState = (c.state || "").toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchState) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "created_desc") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "created_asc") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === "spend_desc") {
          return b.totalSpend - a.totalSpend;
        }
        if (sortBy === "orders_desc") {
          return b.ordersCount - a.ordersCount;
        }
        if (sortBy === "name_asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [customers, filterPreset, searchQuery, sortBy]);

  // Aggregate Metrics for Header
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status !== "disabled").length;
    const admins = customers.filter((c) => c.role === "admin").length;
    const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    return { total, active, admins, totalSpend };
  }, [customers]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Customers Registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification Banner */}
      {actionMsg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 transition-all ${
            actionMsg.type === "success"
              ? "border-emerald-250 bg-emerald-50 text-emerald-800"
              : "border-rose-250 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{actionMsg.type === "success" ? "✓" : "⚠️"}</span>
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Salesforce-Style Object Header */}
      <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0A99E] to-stone-800 flex items-center justify-center text-white text-xl shadow-md">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E0A99E]">
                  Contact Workspace
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-[10px] font-semibold text-stone-400">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? "Customer" : "Customers"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Customers & Accounts
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-150">
          <div className="bg-stone-50/70 rounded-2xl p-3 border border-stone-150">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">Total Accounts</span>
            <div className="text-lg font-black text-stone-900 mt-0.5">{metrics.total}</div>
          </div>
          <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-150">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700">Active Users</span>
            <div className="text-lg font-black text-emerald-950 mt-0.5">{metrics.active}</div>
          </div>
          <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-150">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-700">Admins</span>
            <div className="text-lg font-black text-purple-950 mt-0.5">{metrics.admins}</div>
          </div>
          <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-150">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-700">Total Lifetime Spend</span>
            <div className="text-lg font-black text-amber-950 mt-0.5">{formatPrice(metrics.totalSpend)}</div>
          </div>
        </div>
      </div>

      {/* Control / Toolbar Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/60 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Preset View Pills (Salesforce List View selector) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Contacts", count: customers.length },
              { id: "customers", label: "Customers Only", count: customers.filter(c => c.role !== "admin").length },
              { id: "with_orders", label: "With Orders", count: customers.filter(c => c.ordersCount > 0).length },
              { id: "admins", label: "Admins", count: customers.filter(c => c.role === "admin").length },
              { id: "active", label: "Active", count: customers.filter(c => c.status !== "disabled").length },
            ].map((tab) => {
              const isActive = filterPreset === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterPreset(tab.id as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-[#E0A99E] text-white shadow-xs"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Search Box & Sort Options */}
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <input
                type="text"
                placeholder="Search name, email, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 pl-8 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#E0A99E] transition"
              />
              <span className="absolute left-2.5 top-2.5 text-stone-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#E0A99E] cursor-pointer"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="spend_desc">Highest Spend</option>
              <option value="orders_desc">Most Orders</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Salesforce-Style Customer Table */}
      <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/75 text-[10px] uppercase font-black tracking-wider text-stone-500 select-none">
                <th className="py-3.5 px-5">Customer / Contact Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spend</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Role</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400 font-medium">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const detailHref = `/admin/customers/${cust.id || cust.email}`;
                  const isCurrentAdmin = cust.id === currentUserId;

                  return (
                    <tr key={cust.id || cust.email} className="hover:bg-stone-50/75 transition-colors group">
                      {/* Customer Name + Avatar (Clickable link to Customer Detail View) */}
                      <td className="py-3.5 px-5">
                        <Link href={detailHref} className="flex items-center gap-3 group-hover:opacity-90">
                          {cust.avatarUrl ? (
                            <Image
                              src={cust.avatarUrl}
                              alt={cust.name}
                              width={36}
                              height={36}
                              className="rounded-full object-cover border border-stone-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#E0A99E]/20 text-[#A65B4E] font-black text-xs flex items-center justify-center border border-[#E0A99E]/30">
                              {(cust.name || cust.email || "U").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 group-hover:text-[#A65B4E] group-hover:underline flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              ID: {(cust.id || "N/A").slice(0, 8)}...
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <a
                          href={`mailto:${cust.email}`}
                          className="font-mono text-stone-600 hover:text-stone-900 block truncate max-w-[180px]"
                          title={cust.email}
                        >
                          {cust.email}
                        </a>
                        {cust.phone ? (
                          <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1">
                            <span>📞</span> {cust.phone}
                          </div>
                        ) : (
                          <div className="text-[10px] text-stone-300 font-light">—</div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-stone-600">
                        {cust.city || cust.state || cust.country ? (
                          <div>
                            <span className="font-medium text-stone-800">
                              {[cust.city, cust.state].filter(Boolean).join(", ")}
                            </span>
                            {cust.country && (
                              <div className="text-[10px] text-stone-400">{cust.country}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            cust.ordersCount > 0
                              ? "bg-amber-100/70 text-amber-900 border border-amber-200"
                              : "bg-stone-100 text-stone-400"
                          }`}
                        >
                          {cust.ordersCount}
                        </span>
                      </td>

                      {/* Total Spend */}
                      <td className="py-3.5 px-4 text-right font-black text-stone-900">
                        {formatPrice(cust.totalSpend)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            cust.status === "disabled"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {cust.status === "disabled" ? "Disabled" : "Active"}
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={cust.role || "customer"}
                          disabled={isCurrentAdmin}
                          onChange={(e) =>
                            handleRoleChange(
                              cust.id,
                              e.target.value as "admin" | "customer",
                              cust.email
                            )
                          }
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                            cust.role === "admin"
                              ? "bg-purple-50 text-purple-900 border-purple-200 font-extrabold"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          } ${isCurrentAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                        {formatDate(cust.createdAt)}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(cust.id, cust.status, cust.email)}
                          disabled={isCurrentAdmin}
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition cursor-pointer ${
                            cust.status === "disabled"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          } ${isCurrentAdmin ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {cust.status === "disabled" ? "Enable" : "Disable"}
                        </button>
                        <Link
                          href={detailHref}
                          className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 inline-block transition"
                        >
                          View ➔
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
