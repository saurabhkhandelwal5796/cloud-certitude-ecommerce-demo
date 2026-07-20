import React from "react";
import AdminSidebar from "@/components/ui/AdminSidebar";
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

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signin");
    }

    // Check role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fallback: also allow the hardcoded admin email
    const isAdmin =
      profile?.role === "admin" || user.email === "admin@cloudcertitude.com";

    if (!isAdmin) {
      redirect("/");
    }
  } catch (err) {
    console.error("[AdminLayout] Error fetching authenticated user:", err);
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF9F6] text-stone-800">
      <AdminSidebar />
      <main className="flex-grow w-full p-4 sm:p-6 lg:p-8 overflow-y-auto lg:h-screen">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
