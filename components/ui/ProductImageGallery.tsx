"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";


interface ProductImageGalleryProps {
  images: string[];
  category?: string;
}

const MAX_IMAGES = 5;

/**
 * ProductImageGallery Component
 *
 * Renders the product image gallery layout dynamically based on the number of
 * images stored in the database:
 *  - 1 image  → only the primary image, no thumbnails.
 *  - 2+ images → primary image + thumbnails (one per additional image, up to 5 total).
 *
 * No padding, no duplication, no placeholder images.
 * Implements a pure-CSS hover-magnifying glass zoom effect for premium feel.
 */
export default function ProductImageGallery({ images, category }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: "center center",
  });

  useEffect(() => {
    // Reset active index when images change
    setActiveIndex(0);

    if (!images || images.length === 0) {
      setCurrentImages([]);
    } else {
      // Clamp to MAX_IMAGES; never pad/duplicate
      setCurrentImages(images.slice(0, MAX_IMAGES));
    }
  }, [images, category]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: "center center" });
  };

  const handleImageError = (index: number) => {
    // Optionally remove the broken image from the list
    setCurrentImages(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  if (currentImages.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-stone-200/50 bg-stone-100 flex items-center justify-center shadow-sm">
        <span className="text-sm font-bold uppercase tracking-widest text-stone-400">No Image</span>
      </div>
    );
  }

  const showThumbnails = currentImages.length > 1;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Main Image */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-stone-200/50 bg-stone-50 shadow-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={currentImages[activeIndex]}
          alt="Selected Product Detail"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-150 ease-out hover:scale-[1.75]"
          style={zoomStyle}
          onError={() => handleImageError(activeIndex)}
        />
      </div>

      {/* Thumbnails — rendered only when there are 2+ images */}
      {showThumbnails && (
        <div
          className={`grid gap-3 ${
            currentImages.length === 2
              ? "grid-cols-2"
              : currentImages.length === 3
              ? "grid-cols-3"
              : "grid-cols-4"
          }`}
        >
          {currentImages.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 bg-stone-50 transition-all cursor-pointer ${
                  active
                    ? "border-[#E0A99E] shadow-md shadow-[#E0A99E]/10"
                    : "border-stone-200/60 hover:border-stone-400"
                }`}
              >
                <Image
                  src={img}
                  alt={`Product View ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => handleImageError(idx)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
