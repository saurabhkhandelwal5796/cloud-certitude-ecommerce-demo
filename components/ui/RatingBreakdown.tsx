"use client";

import React from "react";
import RatingStars from "./RatingStars";

interface RatingBreakdownProps {
  rating: number;
  totalReviews: number;
  distribution: { [key: number]: number }; // star rating to count mapping
}

export default function RatingBreakdown({
  rating,
  totalReviews,
  distribution,
}: RatingBreakdownProps) {
  const starsList = [5, 4, 3, 2, 1];

  return (
    <div className="w-full flex flex-col gap-6 text-left p-6 rounded-3xl border border-stone-250 bg-white shadow-sm">
      <div>
        <h3 className="text-xs font-extrabold text-stone-750 uppercase tracking-widest">
          Rating Overview
        </h3>
        <div className="flex items-baseline gap-2.5 mt-2">
          <span className="text-5xl font-black text-stone-900 tracking-tight">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-stone-400 font-light uppercase tracking-wider">
            out of 5.0
          </span>
        </div>
        <div className="mt-2.5">
          <RatingStars rating={rating} size="md" />
        </div>
        <p className="mt-2 text-[10px] text-stone-450 font-bold uppercase tracking-wider">
          Based on {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}
        </p>
      </div>

      <div className="space-y-3.5 border-t border-stone-100 pt-5">
        {starsList.map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-4 text-xs">
              <span className="w-12 text-stone-500 font-extrabold uppercase tracking-wider text-[10px] whitespace-nowrap">
                {stars} Star
              </span>
              {/* Bar */}
              <div className="flex-grow h-2 bg-stone-100/80 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#C68B7D] to-[#E0A99E] rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-stone-400 font-bold text-[10px] whitespace-nowrap">
                {count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
