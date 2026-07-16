"use client";

import React, { useState } from "react";
import { formatPrice } from "@/utils";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  sku: string;
  description: string;
  material?: string;
  careInstructions?: string;
  shippingInfo?: string;
  returnPolicy?: string;
}

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { name: "Black", hex: "bg-black" },
  { name: "White", hex: "bg-white border border-stone-300" },
  { name: "Blue", hex: "bg-[#4B9CD3]" },
  { name: "Beige", hex: "bg-[#F5F5DC]" },
];

/**
 * ProductInfo Component
 *
 * Renders the descriptive and transactional sections of the product view.
 * Handles pricing badges, size/color selectors, wishlist triggers,
 * and collapsible care/shipping details.
 */
export default function ProductInfo({
  id,
  name,
  brand,
  price,
  imageSrc,
  discountPercent,
  rating,
  reviewCount,
  sku,
  description,
  material = "100% Organic Egyptian Cotton",
  careInstructions = "Machine wash cold with like colors. Dry flat in shade. Iron on low heat.",
  shippingInfo = "Free standard shipping on orders over $150. Delivery within 3-5 business days.",
  returnPolicy = "Hassle-free 30-day returns. Items must be unworn and contain original tags intact.",
}: ProductInfoProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Beige");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const discountedPrice = discountPercent
    ? price * (1 - discountPercent / 100)
    : price;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      addToCart({ id, name, price, imageSrc, discountPercent, brand }, 1, selectedSize, selectedColor);
    }, 600);
  };

  const handleBuyNow = () => {
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      alert(`Proceeding to checkout for "${name}" (Size: ${selectedSize}, Color: ${selectedColor})!`);
    }, 800);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      {/* 1. Header segment */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E0A99E]">
          {brand}
        </span>
        <h1 className="mt-1 text-2xl md:text-3xl font-black text-stone-900 tracking-wide uppercase leading-tight">
          {name}
        </h1>
        <div className="mt-3 flex items-center gap-4 text-xs">
          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(rating) ? "fill-current" : "text-stone-200"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-stone-700">{rating.toFixed(1)}</span>
          </div>
          <span className="text-stone-400 font-light border-l border-stone-200 pl-4">
            {reviewCount} Verified Purchaser Reviews
          </span>
          <span className="text-stone-400 font-light border-l border-stone-200 pl-4 select-all">
            SKU: {sku}
          </span>
        </div>
      </div>

      <hr className="border-stone-200/60" />

      {/* 2. Pricing details */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-extrabold text-stone-900">
            {formatPrice(discountedPrice)}
          </span>
          {discountPercent && (
            <>
              <span className="text-sm font-semibold text-stone-400 line-through">
                {formatPrice(price)}
              </span>
              <span className="text-xs font-extrabold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        {discountPercent && (
          <div className="inline-flex items-center gap-1 bg-[#E0A99E]/10 border border-[#E0A99E]/20 text-[#C68B7D] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
            <svg className="h-3 w-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Limited Time Offer
          </div>
        )}
      </div>

      {/* 3. Selections (Size and Color) */}
      <div className="space-y-4">
        {/* Size Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-stone-500">Select Size</span>
            <button className="text-stone-400 hover:text-stone-850 hover:underline font-semibold cursor-pointer">
              Size Guide
            </button>
          </div>
          <div className="flex gap-2">
            {SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`h-10 w-10 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  selectedSize === sz
                    ? "bg-[#E0A99E] text-white border-transparent shadow-sm shadow-[#E0A99E]/20"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Selected Color: <span className="text-stone-900 font-semibold">{selectedColor}</span>
          </h4>
          <div className="flex gap-3">
            {COLORS.map((color) => {
              const active = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-8 w-8 rounded-full transition-transform relative flex items-center justify-center cursor-pointer hover:scale-105 ${
                    color.hex
                  } ${active ? "ring-2 ring-stone-450 ring-offset-2" : ""}`}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 rounded-full bg-white border border-stone-250 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm disabled:opacity-50 h-12 flex items-center justify-center cursor-pointer"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>

          {/* Add to Wishlist */}
          <button
            onClick={toggleWishlist}
            className="flex-shrink-0 h-12 w-12 rounded-full border border-stone-250 bg-white text-stone-500 hover:text-rose-500 hover:border-stone-400 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg
              className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "currentColor"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={isBuying}
          className="w-full rounded-full bg-[#E0A99E] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 h-12 flex items-center justify-center cursor-pointer"
        >
          {isBuying ? "Processing..." : "Buy Now"}
        </button>
      </div>

      <hr className="border-stone-200/60" />

      {/* 5. Product Information Details Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-stone-200">
          {[
            { id: "description", label: "Details" },
            { id: "shipping", label: "Shipping" },
            { id: "returns", label: "Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#E0A99E] text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[80px]">
          {activeTab === "description" && (
            <div className="space-y-3 text-xs text-stone-600 leading-relaxed font-light">
              <p>{description}</p>
              <p>
                <strong className="font-bold text-stone-700 uppercase tracking-wide text-[9px] block mb-1">
                  Material composition
                </strong>
                {material}
              </p>
              <p>
                <strong className="font-bold text-stone-700 uppercase tracking-wide text-[9px] block mb-1">
                  Care instructions
                </strong>
                {careInstructions}
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="text-xs text-stone-600 leading-relaxed font-light">
              <p>{shippingInfo}</p>
              <p className="mt-2">
                All garments are packed in signature recyclable dust sleeves to maintain premium protection.
              </p>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="text-xs text-stone-600 leading-relaxed font-light">
              <p>{returnPolicy}</p>
              <p className="mt-2">
                Simply initiate the return from your profile order records to obtain a pre-paid courier drop-off slip.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
