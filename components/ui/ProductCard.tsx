"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, getCategoryFallbackImage } from "@/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  reviewCount?: number;
  category: string;
  brand?: string;
  description?: string;
  onQuickView?: (product: {
    id: string;
    name: string;
    price: number;
    imageSrc: string;
    discountPercent?: number;
    rating: number;
    reviewCount?: number;
    category: string;
    brand?: string;
    description?: string;
  }) => void;
}

/**
 * ProductCard Component
 *
 * Renders individual apparel items in a bright, warm luxury aesthetic.
 * Clicking the card routes to the product details page.
 * Buttons are isolated using higher z-indices on top of a full-card link.
 */
export default function ProductCard({
  id,
  name,
  price,
  imageSrc,
  discountPercent,
  rating,
  reviewCount,
  category,
  brand = "Atelier",
  description,
  onQuickView,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageSrc);

  useEffect(() => {
    setCurrentImage(imageSrc);
  }, [imageSrc]);

  const isWishlisted = isInWishlist(id);

  const discountedPrice = discountPercent
    ? price * (1 - discountPercent / 100)
    : price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      addToCart({ id, name, price, imageSrc, discountPercent, brand }, 1, "M", "Beige");
    }, 600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ id, name, price, imageSrc, discountPercent, rating, reviewCount, category, brand, description });
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({ id, name, price, imageSrc, discountPercent, rating, reviewCount, category, brand, description });
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/50 bg-white shadow-sm shadow-stone-200/40 hover:shadow-xl hover:border-stone-300/60 transition-all duration-500">
      {/* Absolute Full Card Link */}
      <Link href={`/products/${id}`} className="absolute inset-0 z-0" aria-label={`View details of ${name}`} />

      {/* Product Image and Overlay triggers */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-50 z-0">
        <Link href={`/products/${id}`} className="absolute inset-0 z-0 block">
          <Image
            src={currentImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => {
              setCurrentImage(getCategoryFallbackImage(category));
            }}
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-3 left-3 rounded-full bg-[#E0A99E] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm z-10">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-500 hover:text-rose-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white cursor-pointer"
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
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 hidden md:flex flex-col gap-2 z-10">
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="flex w-full justify-center rounded-full bg-white py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 shadow-sm transition-colors cursor-pointer border border-stone-200"
            >
              Quick View
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex w-full justify-center rounded-full bg-[#E0A99E] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] shadow-md transition-colors cursor-pointer"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info & pricing */}
      <div className="flex flex-1 flex-col p-4 text-left z-0 pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#E0A99E]">
          {category}
        </span>
        <h4 className="mt-1 text-sm font-bold text-stone-800 tracking-wide truncate">
          {name}
        </h4>

        {/* Star Rating Reviews */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating) ? "fill-current" : "text-stone-200"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-stone-400">
            ({rating.toFixed(1)})
            {reviewCount !== undefined && (
              <span className="text-[#E0A99E] ml-1 font-bold">
                &middot; {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            )}
          </span>
        </div>

        {/* Pricing tag */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold text-stone-900">
            {formatPrice(discountedPrice)}
          </span>
          {discountPercent !== undefined && discountPercent > 0 && (
            <span className="text-xs font-semibold text-stone-400 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>

      {/* Mobile quick add/view buttons */}
      <div className="mt-auto p-4 pt-0 flex flex-col gap-2 md:hidden z-10">
        {onQuickView && (
          <button
            onClick={handleQuickViewClick}
            className="flex w-full justify-center rounded-full bg-white border border-stone-200 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            Quick View
          </button>
        )}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex w-full justify-center rounded-full bg-stone-50 border border-stone-200 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-[#E0A99E] hover:text-white disabled:opacity-50 transition-all cursor-pointer"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
