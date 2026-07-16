import React from "react";
import Link from "next/link";

/**
 * EmptyCart Component
 *
 * Friendly indicator screen rendering details for unpopulated shopping carts.
 */
export default function EmptyCart() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-stone-200/50 bg-white p-12 text-center shadow-sm">
      {/* Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF6F0] text-[#E0A99E] mb-6">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      {/* Copy */}
      <h2 className="text-xl font-black text-stone-900 tracking-wide uppercase">
        Your Cart is Empty
      </h2>
      <p className="mt-2.5 text-sm text-stone-500 font-light leading-relaxed">
        Start exploring our latest collections to find tailored classics and luxury essentials curated for every occasion.
      </p>

      {/* Button */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-full bg-[#E0A99E] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
