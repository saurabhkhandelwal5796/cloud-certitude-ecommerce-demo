import React from "react";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/cookie-client";
import UserProfileCard from "@/components/ui/UserProfileCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account - Certitude Atelier",
  description: "Manage your Certitude Atelier profile, preferences, and order history.",
};

/**
 * Profile Page (Server Component)
 *
 * Fetches the authenticated user's details on the server using session cookies.
 * Renders the UserProfileCard. Route protection is primarily enforced in middleware.ts,
 * with this server check acting as a secondary layer.
 */
export default async function ProfilePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Secondary protection layer in case middleware bypasses
  if (!user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || user.email === "admin@cloudcertitude.com";
  if (isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-xl mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Account Overview
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your personal information and security settings.
        </p>
      </div>

      <UserProfileCard
        user={{
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        }}
      />
    </div>
  );
}
