"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error details to analytics service
    console.error("[GlobalError] Caught unexpected runtime crash:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] px-4">
      <div className="max-w-md w-full rounded-3xl border border-stone-200/50 bg-white p-8 sm:p-10 shadow-xl shadow-stone-200/20 text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-2xl">
          ⚠️
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
            System Disruption
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-wider">
            An Error Occurred
          </h1>
          <p className="text-xs text-stone-400 font-light leading-relaxed">
            Our private atelier is temporarily undergoing maintenance. Rest assured, our systems have been notified.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 rounded-full bg-stone-900 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-stone-800 transition-colors shadow-md cursor-pointer"
            aria-label="Retry loading page"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-full border border-stone-200 py-3 text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center"
            aria-label="Go to homepage"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
