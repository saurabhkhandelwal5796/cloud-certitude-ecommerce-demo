"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "customer";
  status?: string | null;
  created_at: string;
  updated_at: string | null;
  last_sign_in_at?: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (err) {
      console.error("[AdminUsers] Error loading users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (userId: string, newRole: "admin" | "customer") => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      setActionMsg(`Error: ${error.message}`);
    } else {
      setActionMsg(`Role updated to ${newRole}.`);
      loadUsers();
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const updateStatus = async (userId: string, newStatus: "active" | "disabled") => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ status: newStatus } as any)
      .eq("id", userId);

    if (error) {
      setActionMsg(`Error: ${error.message}`);
    } else {
      setActionMsg(`User ${newStatus === "disabled" ? "disabled" : "enabled"}.`);
      loadUsers();
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          User Management
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Manage roles and access for all registered users.
        </p>
      </div>

      {actionMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          {actionMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-stone-200/50 bg-white p-10 text-center text-sm text-stone-400 font-light">
          No user profiles found. Users are added here automatically upon registration.
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Last Login</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-stone-900">
                      {u.full_name || u.email.split("@")[0]}
                    </td>
                    <td className="px-5 py-4 text-stone-600 font-mono select-all">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === "admin"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}>
                        {u.role === "admin" ? "👑 Admin" : "👤 Customer"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        u.status === "disabled"
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {u.status === "disabled" ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-400 font-light">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-5 py-4 text-stone-400 font-light">
                      {formatDate(u.last_sign_in_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {u.role === "admin" ? (
                          <button
                            onClick={() => updateRole(u.id, "customer")}
                            className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-bold text-stone-600 hover:bg-stone-50 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => updateRole(u.id, "admin")}
                            className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Make Admin
                          </button>
                        )}
                        {u.status === "disabled" ? (
                          <button
                            onClick={() => updateStatus(u.id, "active")}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(u.id, "disabled")}
                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
