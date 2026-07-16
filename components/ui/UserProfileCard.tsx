"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/utils";

interface UserProfileCardProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  };
}

/**
 * UserProfileCard Component
 *
 * Displays active customer profile parameters and allows logout actions.
 * Styled in warm cream, soft shadows, and rose gold accents.
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

      // Refresh the page and route back to signin
      router.push("/signin");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred during logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-stone-200/50 bg-white p-6 md:p-8 shadow-xl shadow-stone-200/30 text-stone-800 transition-all duration-300">
      {/* Header Info */}
      <div className="flex items-center gap-4 border-b border-stone-100 pb-6 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0A99E]/20 text-[#C68B7D] font-bold text-lg">
          {user.email ? user.email.slice(0, 2).toUpperCase() : "U"}
        </div>
        <div className="text-left">
          <h3 className="text-lg font-bold text-stone-900 leading-tight">Customer Profile</h3>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-0.5">Certitude Patron</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}

      {/* Details List */}
      <div className="space-y-4 text-left">
        {/* Email */}
        <div className="flex justify-between border-b border-stone-50 pb-3">
          <span className="text-sm text-stone-500">Email Address</span>
          <span className="text-sm font-semibold text-stone-850">{user.email || "N/A"}</span>
        </div>

        {/* User ID */}
        <div className="flex justify-between border-b border-stone-50 pb-3">
          <span className="text-sm text-stone-500">Customer ID</span>
          <span className="text-sm font-mono text-stone-600 select-all">{user.id}</span>
        </div>

        {/* Member Since */}
        <div className="flex justify-between border-b border-stone-50 pb-3">
          <span className="text-sm text-stone-500">Account Created</span>
          <span className="text-sm font-semibold text-stone-850">
            {user.created_at ? formatDate(user.created_at) : "N/A"}
          </span>
        </div>

        {/* Last Sign In */}
        <div className="flex justify-between pb-3">
          <span className="text-sm text-stone-500">Last Active</span>
          <span className="text-sm font-semibold text-stone-850">
            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "N/A"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
        >
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
