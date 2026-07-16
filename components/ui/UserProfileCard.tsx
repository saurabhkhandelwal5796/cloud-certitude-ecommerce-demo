"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/utils";

interface UserProfileCardProps {
  user: {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
  };
}

/**
 * UserProfileCard Component
 *
 * Renders the customer profile details inside a clean, modern card.
 * Handles logout operations via the client-side Supabase instance.
 */
export default function UserProfileCard({ user }: UserProfileCardProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMsg(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMsg(error.message);
        setIsLoggingOut(false);
        return;
      }

      // Refresh the page and route back to signin (middleware will ensure redirection if route is protected)
      router.push("/signin");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred during logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md">
      {/* Header Info */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-lg">
          {user.email ? user.email.slice(0, 2).toUpperCase() : "U"}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">Customer Profile</h3>
          <p className="text-sm text-slate-400">Certitude Atelier Patron</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Details List */}
      <div className="space-y-4">
        {/* Email */}
        <div className="flex justify-between border-b border-white/5 pb-3">
          <span className="text-sm text-slate-400">Email Address</span>
          <span className="text-sm font-semibold text-slate-200">{user.email || "N/A"}</span>
        </div>

        {/* User ID */}
        <div className="flex justify-between border-b border-white/5 pb-3">
          <span className="text-sm text-slate-400">Customer ID</span>
          <span className="text-sm font-mono text-slate-300 select-all">{user.id}</span>
        </div>

        {/* Member Since */}
        <div className="flex justify-between border-b border-white/5 pb-3">
          <span className="text-sm text-slate-400">Account Created</span>
          <span className="text-sm font-semibold text-slate-200">
            {user.created_at ? formatDate(user.created_at) : "N/A"}
          </span>
        </div>

        {/* Last Sign In */}
        <div className="flex justify-between pb-3">
          <span className="text-sm text-slate-400">Last Active</span>
          <span className="text-sm font-semibold text-slate-200">
            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "N/A"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
