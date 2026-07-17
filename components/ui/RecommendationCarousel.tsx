"use client";

import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import { AdminProduct } from "@/services/AdminService";

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  products: AdminProduct[];
}

export default function RecommendationCarousel({
  title,
  subtitle,
  products,
}: RecommendationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full space-y-6 text-left py-10 border-t border-stone-200/50">
      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className="text-lg font-black tracking-widest text-stone-900 uppercase">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Navigation arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-sm cursor-pointer text-xs"
            aria-label="Previous page"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-colors shadow-sm cursor-pointer text-xs"
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>

      {/* Scroller container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[260px] sm:w-[280px] flex-shrink-0 transition-all duration-350 hover:-translate-y-1">
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.price}
              imageSrc={p.imageSrc}
              discountPercent={p.discountPercent}
              rating={p.rating || 0}
              reviewCount={p.reviewCount || 0}
              category={p.category}
              brand={p.brand}
              description={p.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
