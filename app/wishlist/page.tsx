"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import WishlistItem from "@/components/ui/WishlistItem";
import EmptyWishlist from "@/components/ui/EmptyWishlist";

/**
 * WishlistPage Component
 *
 * Renders the wishlist view route.
 * Shows saved items, move-to-cart actions, and a clear trigger.
 * Mirrors the CartPage structure and conventions.
 */
export default function WishlistPage() {
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();

  // If wishlist is empty, render the EmptyWishlist splash
  if (wishlistItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <EmptyWishlist />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800">
      {/* Page Title */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
            My Wishlist
          </h1>
          <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
            Your saved styles ({wishlistCount} {wishlistCount === 1 ? "Item" : "Items"})
          </p>
        </div>

        {/* Continue Shopping */}
        <Link
          href="/"
          className="hidden sm:inline-flex rounded-full border border-stone-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Wishlist items list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Saved items
          </h2>
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear your entire wishlist?")) {
                clearWishlist();
              }
            }}
            className="text-xs font-semibold text-rose-400 hover:text-rose-600 uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {wishlistItems.map((item) => (
          <WishlistItem key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile continue shopping */}
      <div className="mt-8 text-center sm:hidden">
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
