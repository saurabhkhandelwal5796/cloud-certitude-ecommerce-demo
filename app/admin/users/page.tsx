"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Users route consolidated into unified Customers workspace (/admin/customers).
 * Performs automatic client-side redirect.
 */
export default function AdminUsersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/customers");
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Redirecting to consolidated Customers Workspace...
        </div>
        <p className="text-xs text-stone-400">
          If you are not redirected automatically,{" "}
          <Link href="/admin/customers" className="text-[#A65B4E] font-bold underline">
            click here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
