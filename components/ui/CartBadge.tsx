"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

/**
 * CartBadge Component
 *
 * Renders small notification dots on top of the Cart navigation icon.
 * Displays total count of items stored in client memory.
 */
export default function CartBadge() {
  const { cartCount } = useCart();

  if (cartCount === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#E0A99E] px-1 text-[9px] font-black leading-none text-white shadow-sm ring-1 ring-white select-none animate-pulse">
      {cartCount}
    </span>
  );
}
