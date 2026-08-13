import React from "react";
import AdminSidebar from "@/components/ui/AdminSidebar";
import { AdminNavigationProvider, AdminContentArea } from "@/components/ui/AdminNavigationContext";
import { createServerClient } from "@/lib/supabase/cookie-client";
import { redirect } from "next/navigation";
import { verifySupabaseConfig } from "@/utils";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Admin Portal",
  "Cloud Certitude Fashion Internal Admin Dashboard.",
  "/admin"
);

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = verifySupabaseConfig();

  // If Supabase is not configured yet, redirect to storefront
  if (!config.isConfigured) {
    redirect("/");
  }

  let currentUser: any = null;
  let currentProfile: any = null;

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signin");
    }
    
    currentUser = user;

    // Check role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, name, avatar_url")
      .eq("id", user.id)
      .single();

    // Fallback: rely exclusively on profiles.role field
    const isAdmin = profile?.role === "admin";

    if (!isAdmin) {
      redirect("/");
    }
    
    currentProfile = profile;
  } catch (err) {
    console.error("[AdminLayout] Error fetching authenticated user:", err);
    redirect("/");
  }

  return (
    <AdminNavigationProvider>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#FAF9F6] text-stone-800">
        <AdminSidebar 
          user={{ 
            email: currentUser?.email || "", 
            name: currentProfile?.name || "Admin User", 
            avatarUrl: currentProfile?.avatar_url 
          }} 
        />
        <AdminContentArea>
          {children}
        </AdminContentArea>
      </div>
    </AdminNavigationProvider>
  );
}
