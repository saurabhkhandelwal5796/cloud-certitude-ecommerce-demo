import React from "react";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  review: string;
  rating: number;
  avatarSrc: string;
  role?: string;
}

/**
 * TestimonialCard Component
 *
 * Renders luxury feedback cards from verified customers.
 * Includes user profile avatars, feedback statements, and star ratings.
 */
export default function TestimonialCard({
  name,
  review,
  rating,
  avatarSrc,
  role = "Verified Purchaser",
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/20 p-6 md:p-8 backdrop-blur-sm relative">
      {/* Decorative quotes */}
      <span className="absolute top-6 right-6 text-slate-800 text-6xl font-serif leading-none select-none">
        “
      </span>

      <div>
        {/* Rating Stars */}
        <div className="flex gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${i < rating ? "fill-current" : "text-slate-600"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Feedback text */}
        <p className="mt-4 text-sm md:text-base text-slate-300 italic leading-relaxed relative z-10">
          &ldquo;{review}&rdquo;
        </p>
      </div>

      {/* User avatar & info */}
      <div className="mt-6 flex items-center gap-4 border-t border-white/5 pt-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800">
          <Image
            src={avatarSrc}
            alt={name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{name}</h4>
          <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1 mt-0.5">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
