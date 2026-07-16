import React from "react";
import Link from "next/link";

/**
 * EmptyWishlist Component
 *
 * Friendly indicator screen rendering details for empty wishlists.
 * Mirrors the EmptyCart pattern exactly.
 */
export default function EmptyWishlist() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-stone-200/50 bg-white p-12 text-center shadow-sm">
      {/* Heart icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF6F0] text-[#E0A99E] mb-6">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>

      {/* Copy */}
      <h2 className="text-xl font-black text-stone-900 tracking-wide uppercase">
        Your Wishlist is Empty
      </h2>
      <p className="mt-2.5 text-sm text-stone-500 font-light leading-relaxed">
        Save your favorite styles for later. Browse our collections and tap the heart icon to add items.
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
