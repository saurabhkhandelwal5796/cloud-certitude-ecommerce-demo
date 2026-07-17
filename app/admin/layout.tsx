import React from "react";
import AdminSidebar from "@/components/ui/AdminSidebar";
import { createServerClient } from "@/lib/supabase/cookie-client";
import { redirect } from "next/navigation";
import { verifySupabaseConfig } from "@/utils";

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

    // Enforce admin permission constraint (admin@cloudcertitude.com only)
    if (!user || user.email !== "admin@cloudcertitude.com") {
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
