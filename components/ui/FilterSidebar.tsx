"use client";

import React from "react";

interface FilterSidebarProps {
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: number;
  setPriceRange: React.Dispatch<React.SetStateAction<number>>;
  onClear: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Beige", hex: "bg-[#F5F5DC]" },
  { name: "Cream", hex: "bg-[#FFFDD0]" },
  { name: "Blush", hex: "bg-[#FFD1DC]" },
  { name: "Olive", hex: "bg-[#808000]" },
  { name: "Charcoal", hex: "bg-[#36454F]" },
  { name: "White", hex: "bg-white border border-stone-300" },
];
const BRANDS = ["Atelier", "Certitude", "Modern Classic", "EcoKnit"];

/**
 * FilterSidebar Component
 *
 * Renders the vertical panel on search collections pages.
 * Supports filters for Size, Color, Price, and Brand, and triggers state updates.
 */
export default function FilterSidebar({
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  onClear,
}: FilterSidebarProps) {
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <aside className="w-full flex flex-col gap-8 rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/20">
      {/* Header and Clear trigger */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
          Filters
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-[#C68B7D] hover:text-[#B37A6D] hover:underline cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* 1. Size Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Select Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`h-9 w-9 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  active
                    ? "bg-[#E0A99E] text-white border-transparent"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Select Color
        </h4>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                className={`h-7 w-7 rounded-full transition-all relative flex items-center justify-center cursor-pointer hover:scale-110 ${color.hex}`}
                title={color.name}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className={`h-4 w-4 ${
                        color.name === "White" || color.name === "Cream" || color.name === "Beige"
                          ? "text-stone-850"
                          : "text-white"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Price Range
          </h4>
          <span className="text-xs font-bold text-stone-700">Up to ₹{priceRange}</span>
        </div>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#E0A99E]"
        />
        <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase">
          <span>₹500</span>
          <span>₹10000</span>
        </div>
      </div>

      {/* 4. Brand Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Brands
        </h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => {
            const active = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center gap-3 text-sm text-stone-700 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E] h-4 w-4 cursor-pointer"
                />
                <span className="font-light">{brand}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
