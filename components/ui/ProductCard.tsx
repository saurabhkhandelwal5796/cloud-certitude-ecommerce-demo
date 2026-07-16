"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  category: string;
}

/**
 * ProductCard Component
 *
 * Renders individual apparel items.
 * Displays image overlay buttons, discount tags, dynamic star rating reviews,
 * and quick-add actions.
 */
export default function ProductCard({
  name,
  price,
  imageSrc,
  discountPercent,
  rating,
  category,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const discountedPrice = discountPercent
    ? price * (1 - discountPercent / 100)
    : price;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      alert(`"${name}" added to cart!`);
    }, 600);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-lg">
      {/* Product Image and Overlay triggers */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-3 left-3 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-slate-300 backdrop-blur-sm transition-all hover:bg-slate-950 hover:text-white cursor-pointer"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg
            className={`h-4.5 w-4.5 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "currentColor"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Quick Add Overlay on hover (desktop only) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 hidden md:block">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex w-full justify-center rounded-md bg-emerald-500 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isAdding ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Info & pricing */}
      <div className="flex flex-1 flex-col p-4 text-left">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {category}
        </span>
        <h4 className="mt-1 text-sm font-bold text-white tracking-wide truncate">
          {name}
        </h4>

        {/* Star Rating Reviews */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating) ? "fill-current" : "text-slate-600"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-slate-400">({rating.toFixed(1)})</span>
        </div>

        {/* Pricing tag */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold text-white">
            {formatPrice(discountedPrice)}
          </span>
          {discountPercent && (
            <span className="text-xs font-semibold text-slate-500 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Mobile quick add button (always visible on small screens) */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="mt-4 flex w-full justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 py-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-50 transition-all md:hidden cursor-pointer"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
