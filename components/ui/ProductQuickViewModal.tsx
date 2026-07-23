"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice, getCategoryFallbackImage } from "@/utils";
import { useCart } from "@/context/CartContext";

interface ProductType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  category: string;
  brand?: string;
  description?: string;
}

interface ProductQuickViewModalProps {
  product: ProductType | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProductQuickViewModal Component
 *
 * Glassmorphic overlay dialog rendering micro-details for a specific fashion item.
 * Includes size/color configurations and dummy cart actions.
 */
export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
}: ProductQuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Beige");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState(product?.imageSrc || "");

  useEffect(() => {
    if (product) {
      setCurrentImage(product.imageSrc);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const discountedPrice = product.discountPercent
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageSrc: product.imageSrc,
          discountPercent: product.discountPercent,
          brand: product.brand,
        },
        quantity,
        selectedSize,
        selectedColor
      );
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-stone-200/50 bg-white/95 shadow-2xl backdrop-blur-md flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          title="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Image */}
        <div className="relative w-full md:w-1/2 aspect-[4/5] bg-stone-50">
          <Image
            src={currentImage || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => {
              setCurrentImage(getCategoryFallbackImage(product.category));
            }}
          />
          {product.discountPercent && (
            <span className="absolute top-4 left-4 rounded-full bg-[#E0A99E] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Right: Product Details Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between text-left">
          <div>
            {/* Category / Brand */}
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
              {product.category} &middot; {product.brand || "Atelier"}
            </span>

            {/* Title */}
            <h2 className="mt-2 text-xl md:text-2xl font-black text-stone-900 tracking-wide uppercase leading-tight">
              {product.name}
            </h2>

            {/* Star Reviews */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.rating) ? "fill-current" : "text-stone-200"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-500">
                {product.rating.toFixed(1)} verified client rating
              </span>
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl font-extrabold text-stone-900">
                {formatPrice(discountedPrice)}
              </span>
              {product.discountPercent !== undefined && product.discountPercent > 0 && (
                <span className="text-sm font-semibold text-stone-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-xs text-stone-500 leading-relaxed font-light">
              {product.description ||
                "A premium staple crafted from organic sustainable fabrics. Built with exact fits and tailored details to ensure effortless prestige."}
            </p>

            {/* Size Selector */}
            <div className="mt-6 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Size
              </h4>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-9 w-9 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      selectedSize === sz
                        ? "bg-[#E0A99E] text-white border-transparent"
                        : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mt-6 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Color: <span className="text-stone-700 font-semibold">{selectedColor}</span>
              </h4>
              <div className="flex gap-2.5">
                {["Beige", "Blush", "Olive", "Charcoal"].map((cl) => {
                  const bgClass =
                    cl === "Beige"
                      ? "bg-[#F5F5DC]"
                      : cl === "Blush"
                      ? "bg-[#FFD1DC]"
                      : cl === "Olive"
                      ? "bg-[#808000]"
                      : "bg-[#36454F]";
                  return (
                    <button
                      key={cl}
                      onClick={() => setSelectedColor(cl)}
                      className={`h-7 w-7 rounded-full hover:scale-110 transition-transform relative cursor-pointer ${bgClass} ${
                        selectedColor === cl ? "ring-2 ring-stone-450 ring-offset-2" : ""
                      }`}
                      title={cl}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center rounded-full border border-stone-250 bg-stone-50 h-11 px-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-stone-500 hover:text-stone-800 font-bold px-1.5 cursor-pointer"
              >
                &minus;
              </button>
              <span className="text-sm font-bold text-stone-850 w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="text-stone-500 hover:text-stone-800 font-bold px-1.5 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 rounded-full bg-[#E0A99E] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md disabled:opacity-50 h-11 flex items-center justify-center cursor-pointer"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
