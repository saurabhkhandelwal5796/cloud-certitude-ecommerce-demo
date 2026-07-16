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
 * Designed with a premium minimalist fashion boutique theme ("Certitude Atelier"):
 *   - Dark slate backgrounds with elegant border details.
 *   - Clean typography using geometric accents.
 *   - Full responsiveness and accessibility.
 */
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-950 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-widest text-white hover:text-emerald-400 transition-colors uppercase"
          >
            Certitude <span className="text-emerald-400 font-light">Atelier</span>
          </Link>
        </div>

        {/* Page Headings */}
        <h2 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {subtitle}
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-xl backdrop-blur-md sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
