"use client";

import React, { useEffect, useState } from "react";
import AIRecommendationCard from "./AIRecommendationCard";
import { getTrendingNow, getPopularInYourArea } from "@/services/RecommendationService";
import { AdminProduct } from "@/services/AdminService";

interface TrendingProductsProps {
  limit?: number;
  mode?: "trending" | "local";
}

export default function TrendingProducts({ limit = 4, mode = "trending" }: TrendingProductsProps) {
  const [list, setList] = useState<AdminProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = mode === "trending" ? await getTrendingNow() : await getPopularInYourArea();
      setList(data.slice(0, limit));
    };
    load();
  }, [limit, mode]);

  if (list.length === 0) return null;

  return (
    <div className="w-full text-left py-10 border-t border-stone-200/50">
      <div className="mb-8">
        <h3 className="text-lg font-black tracking-widest text-stone-900 uppercase">
          {mode === "trending" ? "Trending Now" : "Popular In Your Area"}
        </h3>
        <p className="mt-1 text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest">
          {mode === "trending"
            ? "Picks generating maximum velocity on the platform"
            : "Popular among shoppers in your region"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {list.map((item, idx) => (
          <AIRecommendationCard
            key={item.id}
            product={item}
            reason={mode === "trending" ? "Highly Viewed Recently" : `Top Pick #${idx + 1}`}
            badgeText={mode === "trending" ? "Hot" : "Delhi NCR"}
          />
        ))}
      </div>
    </div>
  );
}
