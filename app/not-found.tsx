import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6] px-4">
      <div className="max-w-md w-full rounded-3xl border border-stone-200/50 bg-white p-8 sm:p-10 shadow-xl shadow-stone-200/20 text-center space-y-6">
        {/* Not Found Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-2xl">
          🔍
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
            Lost Masterpiece
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-wider">
            Page Not Found
          </h1>
          <p className="text-xs text-stone-400 font-light leading-relaxed">
            The collection, jacket, or route you are searching for does not exist in our catalog or has been moved.
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="block w-full rounded-full bg-stone-900 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-stone-850 transition-colors shadow-md text-center"
            aria-label="Return to storefront home"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
