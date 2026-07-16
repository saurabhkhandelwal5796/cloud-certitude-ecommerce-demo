"use client";

import React from "react";
import { useWishlist } from "@/context/WishlistContext";

/**
 * WishlistBadge Component
 *
 * Renders small notification dots on top of the Wishlist navigation icon.
 * Mirrors the CartBadge pattern exactly.
 */
export default function WishlistBadge() {
  const { wishlistCount } = useWishlist();

  if (wishlistCount === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#E0A99E] px-1 text-[9px] font-black leading-none text-white shadow-sm ring-1 ring-white select-none animate-pulse">
      {wishlistCount}
    </span>
  );
}
