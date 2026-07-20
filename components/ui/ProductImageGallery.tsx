"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getCategoryFallbackImage } from "@/utils";

interface ProductImageGalleryProps {
  images: string[];
  category?: string;
}

/**
 * ProductImageGallery Component
 *
 * Renders the product image gallery layout.
 * Features 4 clickable thumbnails and a main viewport showing the active image.
 * Implements a pure-CSS hover-magnifying glass zoom effect for premium feel.
 */
export default function ProductImageGallery({ images, category }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: "center center",
  });

  useEffect(() => {
    let list = [...images];
    if (list.length === 0) {
      list = [getCategoryFallbackImage(category)];
    }
    while (list.length < 4) {
      list.push(list[0]);
    }
    setCurrentImages(list);
  }, [images, category]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
    });
  };

  const handleImageError = (index: number) => {
    setCurrentImages(prev => {
      const copy = [...prev];
      copy[index] = getCategoryFallbackImage(category);
      return copy;
    });
  };

  if (currentImages.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Primary Main Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-stone-200/50 bg-stone-50 shadow-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={currentImages[activeIndex] || getCategoryFallbackImage(category)}
          alt="Selected Product Detail"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-150 ease-out hover:scale-[1.75]"
          style={zoomStyle}
          onError={() => handleImageError(activeIndex)}
        />
      </div>

      {/* 2. Image Thumbnails List (4 items) */}
      <div className="grid grid-cols-4 gap-3">
        {currentImages.slice(0, 4).map((img, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 bg-stone-50 transition-all cursor-pointer ${
                active ? "border-[#E0A99E] shadow-md shadow-[#E0A99E]/10" : "border-stone-200/60 hover:border-stone-400"
              }`}
            >
              <Image
                src={img || getCategoryFallbackImage(category)}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
