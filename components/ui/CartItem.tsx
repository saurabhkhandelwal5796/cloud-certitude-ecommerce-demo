"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils";
import { CartItemType, useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

/**
 * CartItem Component
 *
 * Renders a row of a selected apparel item inside the cart list.
 * Displays details, size/color tags, quantity controls, line item total price,
 * and a deletion trigger.
 */
export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, staleVariantIds } = useCart();
  const [currentImage, setCurrentImage] = useState(item.imageSrc);
  const isStale = item.variantId ? staleVariantIds.has(item.variantId) : false;

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentImage(item.imageSrc);
    setHasError(false);
  }, [item.imageSrc]);

  const discountedPrice = item.discountPercent
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;

  const totalLinePrice = discountedPrice * item.quantity;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm text-left transition-colors ${
      isStale
        ? "border-rose-300 bg-rose-50/50"
        : "border-stone-200/50 bg-white"
    }`}>
      {/* Staleness warning banner */}
      {isStale && (
        <div className="w-full -mb-1 flex items-center gap-2 rounded-xl bg-rose-100 border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          No longer available — please remove this item before checking out
        </div>
      )}
      {/* Left: Product Image & Details Link */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
          {currentImage && !hasError ? (
            <Image
              src={currentImage}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => {
                setHasError(true);
              }}
            />
          ) : (
            <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400 text-center">No<br/>Image</span>
          )}
        </div>

        <div>
          <Link
            href={`/products/${item.id}`}
            className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide hover:text-[#C68B7D] transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E] block mt-0.5">
            {item.brand || "Atelier"}
          </span>
          
          {/* Attributes tags */}
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-stone-500 uppercase">
            <span className="bg-stone-50 border border-stone-100 px-2 py-0.5 rounded">
              Size: {item.selectedSize}
            </span>
            <span className="bg-stone-50 border border-stone-100 px-2 py-0.5 rounded">
              Color: {item.selectedColor}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quantity Selector & Pricing */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
        
        {/* Quantity Controls */}
        <div className="flex items-center rounded-full border border-stone-250 bg-stone-50 h-9 px-2.5">
          <button
            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
            className="text-stone-500 hover:text-stone-850 font-bold px-1 text-sm cursor-pointer"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="text-xs font-bold text-stone-850 w-7 text-center select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
            className="text-stone-500 hover:text-stone-850 font-bold px-1 text-sm cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Pricing */}
        <div className="text-right min-w-[80px]">
          <span className="block text-xs text-stone-400 font-light">Total</span>
          <span className="text-sm font-extrabold text-stone-900">
            {formatPrice(totalLinePrice)}
          </span>
        </div>

        {/* Delete Trigger */}
        <button
          onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
          className="text-stone-400 hover:text-rose-500 transition-colors p-1.5 cursor-pointer"
          title="Remove from Cart"
          aria-label={`Remove ${item.name} from cart`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

      </div>
    </div>
  );
}
