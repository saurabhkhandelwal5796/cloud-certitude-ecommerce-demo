"use client";

/**
 * Global Error Boundary — app/error.tsx
 *
 * Next.js App Router automatically uses this file as the error boundary
 * for every route segment below the root layout. It catches:
 *   - Unexpected render exceptions
 *   - Hydration mismatches
 *   - Client component runtime errors
 *
 * The component receives:
 *   - error:  the Error object (with optional digest for server-side errors)
 *   - reset:  a function that re-renders the failed segment without a full reload
 *
 * Guarantees:
 *   - Layout (Navbar, Footer) is preserved — this renders inside <main> only.
 *   - CartContext, WishlistContext, auth state and localStorage are untouched.
 *   - No external services, analytics, or dependencies added.
 */

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface the error in the browser console for developer awareness.
    // Replace this with a proper logging service (e.g. Sentry) in future.
    console.error("[GlobalError] Unhandled render exception:", error.message, {
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] px-4 py-16"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full rounded-3xl border border-stone-200/50 bg-white p-8 sm:p-10 shadow-xl shadow-stone-200/20 text-center space-y-7">

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-2xl select-none">
          ⚠️
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
            Unexpected Error
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Something went wrong.
          </h1>
          <p className="text-xs text-stone-400 font-light leading-relaxed max-w-xs mx-auto">
            An unexpected issue interrupted this page. Your cart and account
            are safe. You can try again or return to the homepage.
          </p>
        </div>

        {/* Error Digest (dev aid — hidden in clean prod environments) */}
        {error.digest && (
          <p className="text-[10px] font-mono text-stone-300 break-all">
            ref: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            id="error-boundary-retry"
            onClick={reset}
            className="flex-1 rounded-full bg-stone-900 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-stone-700 active:scale-95 transition-all shadow-md cursor-pointer"
            aria-label="Retry loading the page"
          >
            Try Again
          </button>
          <Link
            id="error-boundary-home"
            href="/"
            className="flex-1 rounded-full border border-stone-200 py-3.5 text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Return to homepage"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
