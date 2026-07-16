"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/ui/CartItem";
import CartSummary from "@/components/ui/CartSummary";
import EmptyCart from "@/components/ui/EmptyCart";

/**
 * CartPage Component
 *
 * Renders the checkout checkout bag view route.
 * Shows detailed item sheets, totals breakdown, promo calculations, and clear triggers.
 */
export default function CartPage() {
  const { cartItems, cartCount, clearCart } = useCart();

  // If bag contains no items, render the elegant EmptyCart splash screen
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800">
      {/* Page Title */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
          Shopping Bag
        </h1>
        <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
          Review your selected items ({cartCount} {cartCount === 1 ? "Item" : "Items"}) before checking out.
        </p>
      </div>

      {/* Cart Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Cart items list stack */}
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Apparel bag listings
            </h2>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to empty your shopping cart?")) {
                  clearCart();
                }
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear Bag
            </button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                item={item}
              />
            ))}
          </div>

          {/* Bottom helper info */}
          <div className="rounded-2xl border border-stone-200/40 bg-stone-50/50 p-4 text-left text-[11px] text-stone-500 leading-relaxed font-light mt-6">
            💡 <strong>Styling advice:</strong> Need matching accessories? Explore our{" "}
            <Link href="/new-arrivals" className="text-[#C68B7D] font-semibold hover:underline">
              New Arrivals
            </Link>{" "}
            collections for premium leather belts, designer watches, and Italian scarves.
          </div>
        </div>

        {/* Right Column: Calculations Checkout summary card */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
