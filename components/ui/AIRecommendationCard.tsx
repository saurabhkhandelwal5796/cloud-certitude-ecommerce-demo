"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { AdminProduct } from "@/services/AdminService";
import RatingStars from "./RatingStars";

interface AIRecommendationCardProps {
  product: AdminProduct;
  reason?: string; // e.g. "Based on your interest in Men's Wear"
  badgeText?: string; // e.g. "AI Pick" or "Trending in Delhi"
}

export default function AIRecommendationCard({
  product,
  reason = "Recommended for you",
  badgeText = "AI Pick",
}: AIRecommendationCardProps) {
  const discountedPrice = product.discountPercent
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  return (
    <div className="relative group rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Clickable Area link */}
      <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" />

      {/* Product Image */}
      <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 30vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* AI Pick Premium overlay glassmorphic badge */}
        <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-stone-900/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-[#E0A99E] border border-stone-850 shadow-md">
          ✨ {badgeText}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-grow flex flex-col text-left justify-between gap-3">
        <div className="space-y-1">
          {/* Reason Badge */}
          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-[#E0A99E] leading-none mb-1">
            {reason}
          </span>
          <h4 className="text-xs font-black text-stone-900 leading-snug line-clamp-2 uppercase tracking-wide">
            {product.name}
          </h4>
          <div className="flex items-center gap-1.5 pt-1">
            <RatingStars rating={product.rating || 4.5} size="xs" />
            <span className="text-[9px] font-bold text-stone-400">
              ({product.rating?.toFixed(1) || "4.5"})
            </span>
          </div>
        </div>

        {/* Pricing Segment */}
        <div className="flex items-baseline justify-between gap-2 border-t border-stone-50 pt-3 mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-black text-stone-900">
              {formatPrice(discountedPrice)}
            </span>
            {product.discountPercent && (
              <span className="text-[10px] font-bold text-stone-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 hover:text-stone-850">
            View &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
