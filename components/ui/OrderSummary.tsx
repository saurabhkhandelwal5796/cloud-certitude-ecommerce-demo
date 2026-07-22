"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice, getCategoryFallbackImage, getCategoryFromProductId } from "@/utils";
import { CartItemType } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import { calculateOrderTotals } from "@/services/PricingService";

interface OrderSummaryProps {
  deliveryFee: number;
  discountPercent: number;
  promoApplied: boolean;
}

/**
 * OrderSummary Component (Checkout Version)
 *
 * Displays pricing calculations and lists preview details of active shopping items.
 */
function SummaryItemImage({ item }: { item: CartItemType }) {
  const [src, setSrc] = useState(item.imageSrc);
  useEffect(() => {
    setSrc(item.imageSrc);
  }, [item.imageSrc]);

  return (
    <Image
      src={src}
      alt={item.name}
      fill
      sizes="40px"
      className="object-cover"
      onError={() => {
        setSrc(getCategoryFallbackImage(getCategoryFromProductId(item.id)));
      }}
    />
  );
}

export default function OrderSummary({
  deliveryFee,
  discountPercent,
  promoApplied,
}: OrderSummaryProps) {
  const { cartItems, cartCount, cartSubtotal } = useCart();

  const discountAmount = cartSubtotal * (discountPercent / 100);
  const {
    subtotal,
    shipping,
    tax,
    grandTotal
  } = calculateOrderTotals(
    cartSubtotal,
    deliveryFee,
    discountAmount
  );

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3 text-left">
        Items Summary
      </h3>

      {/* Line Items List preview */}
      <div className="max-h-56 overflow-y-auto space-y-3.5 text-left pr-1 scrollbar-thin">
        {cartItems.map((item) => {
          const itemPrice = item.discountPercent
            ? item.price * (1 - item.discountPercent / 100)
            : item.price;
          return (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center gap-3">
              <div className="relative h-11 w-9 overflow-hidden rounded-lg bg-stone-50 border border-stone-100 flex-shrink-0">
                <SummaryItemImage item={item} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-stone-800 truncate uppercase tracking-wide">
                  {item.name}
                </h4>
                <p className="text-[10px] text-stone-400 font-light mt-0.5">
                  Size: {item.selectedSize} &middot; Qty: {item.quantity}
                </p>
              </div>
              <span className="text-xs font-bold text-stone-850">
                {formatPrice(itemPrice * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <hr className="border-stone-105" />

      {/* Calculations Breakdown */}
      <div className="space-y-3 text-xs text-stone-600 text-left">
        <div className="flex justify-between">
          <span>Total Items</span>
          <span className="font-semibold text-stone-900">{cartCount}</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900">{formatPrice(cartSubtotal)}</span>
        </div>

        {promoApplied && discountAmount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Discount (Promo)</span>
            <span className="font-semibold">- {formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Estimated Tax (8%)</span>
          <span className="font-semibold text-stone-900">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-semibold text-stone-900">
            {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
          </span>
        </div>
      </div>

      <hr className="border-stone-105" />

      {/* Grand Total */}
      <div className="flex justify-between items-baseline text-left">
        <span className="text-sm font-bold text-stone-805 uppercase tracking-wider">Grand Total</span>
        <span className="text-xl font-extrabold text-stone-900">
          {/* Note: Standard totals formatPrice, but shipping is added in Rupees as requested */}
          {formatPrice(grandTotal)}
        </span>
      </div>
    </div>
  );
}
