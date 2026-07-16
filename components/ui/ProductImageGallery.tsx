"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
}

/**
 * ProductImageGallery Component
 *
 * Renders the product image gallery layout.
 * Features 4 clickable thumbnails and a main viewport showing the active image.
 * Implements a pure-CSS hover-magnifying glass zoom effect for premium feel.
 */
export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: "center center",
  });

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

  // Safe fallback if images list is empty
  const galleryImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600"];
  // If we have fewer than 4 images, repeat the first one to make 4 thumbnails
  while (galleryImages.length < 4) {
    galleryImages.push(galleryImages[0]);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Primary Main Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-stone-200/50 bg-stone-50 shadow-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={galleryImages[activeIndex]}
          alt="Selected Product Detail"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-150 ease-out hover:scale-[1.75]"
          style={zoomStyle}
        />
      </div>

      {/* 2. Image Thumbnails List (4 items) */}
      <div className="grid grid-cols-4 gap-3">
        {galleryImages.slice(0, 4).map((img, idx) => {
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
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
