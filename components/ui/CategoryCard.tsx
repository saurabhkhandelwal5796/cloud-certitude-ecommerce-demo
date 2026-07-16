import React from "react";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  title: string;
  href: string;
  imageSrc: string;
}

/**
 * CategoryCard Component
 *
 * Visual landing banner card for ecommerce catalog categories.
 * Features an Unsplash image cover, parallax-style zoom animations on hover,
 * and high-contrast typography with warm cream rose-gold highlights.
 */
export default function CategoryCard({ title, href, imageSrc }: CategoryCardProps) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-stone-100 border border-stone-200/50 hover:shadow-xl shadow-stone-200/20 transition-all duration-500">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={`${title} Category`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
      />

      {/* Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-900/10 to-transparent transition-opacity duration-300" />

      {/* Label and CTA */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
        <h3 className="text-xl font-bold tracking-wider text-white uppercase sm:text-2xl">
          {title}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E0A99E] group-hover:text-[#D4988D] transition-colors">
          Explore Collection
          <svg className="h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
