"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils";
import { WishlistItemType, useWishlist } from "@/context/WishlistContext";
import MoveToCartButton from "./MoveToCartButton";
import { isProductPurchasable, getPurchasabilityLabel } from "@/services/PurchasabilityService";

interface WishlistItemProps {
  item: WishlistItemType;
}

/**
 * WishlistItem Component
 *
 * Renders a row of a wishlisted apparel item.
 * Displays image, details, rating, Move to Cart button, and Remove trigger.
 * Mirrors CartItem layout conventions.
 */
export default function WishlistItem({ item }: WishlistItemProps) {
  const { removeFromWishlist } = useWishlist();
  const [currentImage, setCurrentImage] = useState(item.imageSrc);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [unavailableLabel, setUnavailableLabel] = useState("");

  // Check live purchasability on mount
  useEffect(() => {
    isProductPurchasable(item.id)
      .then((result) => {
        if (!result.purchasable) {
          setIsUnavailable(true);
          setUnavailableLabel(getPurchasabilityLabel(result.reason));
        }
      })
      .catch(() => {
        // Silent fail — don’t break wishlist UI
      });
  }, [item.id]);

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentImage(item.imageSrc);
    setHasError(false);
  }, [item.imageSrc]);

  const discountedPrice = item.discountPercent
    ? item.price * (1 - item.discountPercent / 100)
    : item.price;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm text-left transition-colors ${
      isUnavailable ? "border-rose-200 bg-rose-50/30" : "border-stone-200/50 bg-white"
    }`}>
      {/* Unavailability badge */}
      {isUnavailable && (
        <div className="w-full -mb-1 flex items-center gap-2 rounded-xl bg-rose-100 border border-rose-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          {unavailableLabel}
        </div>
      )}
      {/* Left: Product Image & Details Link */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link href={`/products/${item.id}`} className="flex-shrink-0">
          <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
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
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${item.id}`}
            className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide hover:text-[#C68B7D] transition-colors line-clamp-1 block"
          >
            {item.name}
          </Link>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E] block mt-0.5">
            {item.brand || "Atelier"}
          </span>

          {/* Star Rating — only shown when real reviews exist */}
          {item.rating !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(item.rating!) ? "fill-current" : "text-stone-200"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] font-semibold text-stone-400">({item.rating.toFixed(1)})</span>
            </div>
          )}

          {/* Discount badge if applicable */}
          {item.discountPercent !== undefined && item.discountPercent > 0 && (
            <span className="mt-1 inline-block rounded-full bg-[#E0A99E]/10 border border-[#E0A99E]/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#C68B7D]">
              {item.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Right: Pricing & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
        {/* Pricing */}
        <div className="text-left sm:text-right min-w-[80px]">
          <span className="block text-sm font-extrabold text-stone-900">
            {formatPrice(discountedPrice)}
          </span>
          {item.discountPercent !== undefined && item.discountPercent > 0 && (
            <span className="block text-xs text-stone-400 line-through font-light">
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isUnavailable ? (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 cursor-not-allowed">
              Unavailable
            </span>
          ) : (
            <MoveToCartButton item={item} />
          )}

          {/* Remove trigger */}
          <button
            type="button"
            onClick={() => removeFromWishlist(item.id)}
            className="text-stone-400 hover:text-rose-500 transition-colors p-1.5 cursor-pointer flex-shrink-0"
            title="Remove from Wishlist"
            aria-label={`Remove ${item.name} from wishlist`}
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
    </div>
  );
}
