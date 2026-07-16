import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * Shared AuthLayout Component
 *
 * Provides a consistent, highly polished UI container for all authentication views.
 * Designed with a premium minimalist fashion boutique theme:
 *   - Bright cream/alabaster backgrounds with warm stone details.
 *   - Soft shadows and glassmorphic card elements.
 *   - Clean typography using geometric accents.
 */
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF9F6] py-12 sm:px-6 lg:px-8 text-stone-800 transition-all duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-widest text-stone-900 hover:text-[#E0A99E] transition-colors uppercase"
          >
            Cloud <span className="text-[#E0A99E] font-light">Certitude</span> Fashion
          </Link>
        </div>

        {/* Page Headings */}
        <h2 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-stone-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500 font-light">
          {subtitle}
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-stone-200/50 bg-white/90 px-6 py-8 shadow-xl shadow-stone-200/30 backdrop-blur-md sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
