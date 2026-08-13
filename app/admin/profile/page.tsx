import React from "react";
import { createServerClient } from "@/lib/supabase/cookie-client";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function AdminProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">My Profile</h1>
        <LogoutButton />
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/50 shadow-sm max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#E0A99E]/20 text-[#C68B7D] flex items-center justify-center font-bold text-4xl overflow-hidden shrink-0 shadow-inner">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile?.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">{profile?.name || "Admin User"}</h2>
            <p className="text-sm text-stone-500 font-medium">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-600 uppercase tracking-wider">
              {profile?.role || "Admin"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 py-4 border-t border-stone-100">
            <div className="text-sm font-semibold text-stone-500">Name</div>
            <div className="col-span-2 text-sm font-medium text-stone-900">{profile?.name || "Not set"}</div>
          </div>
          <div className="grid grid-cols-3 py-4 border-t border-stone-100">
            <div className="text-sm font-semibold text-stone-500">Email</div>
            <div className="col-span-2 text-sm font-medium text-stone-900">{user.email}</div>
          </div>
          <div className="grid grid-cols-3 py-4 border-t border-stone-100">
            <div className="text-sm font-semibold text-stone-500">Role</div>
            <div className="col-span-2 text-sm font-medium text-stone-900 uppercase tracking-wider">{profile?.role || "Admin"}</div>
          </div>
          <div className="grid grid-cols-3 py-4 border-t border-stone-100">
            <div className="text-sm font-semibold text-stone-500">User ID</div>
            <div className="col-span-2 text-xs font-mono text-stone-500 bg-stone-50 p-2 rounded-lg break-all">{user.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
