import React from "react";
import Image from "next/image";

interface HeroBannerProps {
  title: string;
  description: string;
  imageSrc: string;
}

/**
 * HeroBanner Component
 *
 * Renders collection-specific header banners (e.g. /men, /women).
 * Styled with warm linen backgrounds, Unsplash image covers, and clean typography.
 */
export default function HeroBanner({ title, description, imageSrc }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/50 aspect-[21/9] sm:aspect-[21/7] w-full shadow-sm shadow-stone-200/20">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-85 select-none"
      />
      {/* Warm Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-900/20 to-transparent" />

      {/* Texts */}
      <div className="absolute inset-y-0 left-0 pl-6 pr-6 sm:pl-12 flex flex-col justify-center max-w-lg text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-white uppercase">
          {title}
        </h1>
        <p className="mt-3 text-xs sm:text-sm md:text-base text-stone-200 font-light leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
