/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";
import RatingStars from "@/components/ui/RatingStars";
import { getProducts, getOrders, AdminProduct } from "@/services/AdminService";
import { getBestSellers, getTrendingNow } from "@/services/RecommendationService";

interface TrendingCategory {
  category: string;
  views: number;
  salesCount: number;
  percentage: number;
}

export default function AdminRecommendationsPage() {
  const [bestSellers, setBestSellers] = useState<AdminProduct[]>([]);
  const [trendingNow, setTrendingNow] = useState<AdminProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<TrendingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recommendations stats
  const loadData = useCallback(async () => {
    try {
      const allProducts = await getProducts();
      const best = await getBestSellers();
      const trend = await getTrendingNow();
      const orders = await getOrders();

      setBestSellers(best.slice(0, 5));
      setTrendingNow(trend.slice(0, 5));

      // Calculate Category views and sales percentages
      const categorySales: Record<string, number> = {};
      orders.forEach((o) => {
        if (o.status !== "Cancelled") {
          o.items?.forEach((item) => {
            const p = allProducts.find((prod) => prod.id === item.id);
            if (p) {
              categorySales[p.category] = (categorySales[p.category] || 0) + item.quantity;
            }
          });
        }
      });

      // Tally views (mock views distribution plus active ones)
      const mockViews: Record<string, number> = {
        Women: 540,
        Men: 320,
        Kids: 140,
        Accessories: 90,
      };

      const totalViews = Object.values(mockViews).reduce((s, v) => s + v, 0);

      const computedCategories = Object.entries(mockViews).map(([cat, views]) => {
        const salesCount = categorySales[cat] || 0;
        return {
          category: cat,
          views,
          salesCount,
          percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
        };
      });

      setCategoriesList(computedCategories.sort((a, b) => b.views - a.views));
    } catch (err) {
      console.error("[AdminRecs] Failed loading recommendation stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Recommendation Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          AI Recommendations Engine
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Observe recommendations conversion ratios, trending categories, and views velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
              Total Views Logged
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1 leading-none">1,090</h4>
          </div>
          <span className="text-xl">👁️</span>
        </div>

        <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">
              A/B Conversion Rate
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1 leading-none">14.8%</h4>
          </div>
          <span className="text-xl">🎯</span>
        </div>

        <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">
              Avg CTR (Trench Coat)
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1 leading-none">24.2%</h4>
          </div>
          <span className="text-xl">📈</span>
        </div>

        <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between text-left">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-violet-500">
              Top Recommended Style
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1 leading-none">Winter Knit</h4>
          </div>
          <span className="text-xl">✨</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Viewed Products (Takes 2/3 of desktop width) */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Top Viewed & Recommended Masterpieces
            </h3>
          </div>

          <div className="space-y-4 flex-1">
            {trendingNow.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-b-0 hover:bg-stone-50/30 px-1 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-stone-300">#0{idx + 1}</span>
                  <div className="relative h-12 w-10 overflow-hidden rounded-lg bg-stone-50 border border-stone-100 flex-shrink-0">
                    <Image src={item.imageSrc} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-stone-900 line-clamp-1">{item.name}</span>
                    <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">{item.brand}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-8">
                  <div className="text-xs">
                    <RatingStars rating={item.rating || 4.5} size="xs" />
                    <span className="block text-[9px] text-stone-400 font-light mt-0.5">Rating</span>
                  </div>
                  <div className="text-xs min-w-[70px]">
                    <span className="block font-black text-stone-900">{formatPrice(item.price)}</span>
                    <span className="block text-[9px] text-stone-400 font-light mt-0.5">Price</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Categories (Takes 1/3 of desktop width) */}
        <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm flex flex-col">
          <div className="border-b border-stone-100 pb-4 mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Views by Category
            </h3>
          </div>

          <div className="divide-y divide-stone-50 flex-1 flex flex-col justify-around">
            {categoriesList.map((cat) => (
              <div key={cat.category} className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700 uppercase tracking-wider">{cat.category}</span>
                  <span className="font-black text-stone-900">{cat.views} views ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-[#FAF6F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C68B7D] to-[#E0A99E] rounded-full transition-all duration-1000"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Purchased Products */}
      <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30">
        <div className="border-b border-stone-100 pb-4 mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
            Top Converted Products (Recommendation Click-Throughs)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {bestSellers.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl border border-stone-150 bg-stone-50/30 text-center flex flex-col items-center gap-3">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Top Conversion #{idx + 1}</span>
              <div className="relative h-28 w-20 overflow-hidden rounded-xl bg-stone-100 border border-stone-150 shadow-inner">
                <Image src={item.imageSrc} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 w-full">
                <span className="block text-xs font-bold text-stone-900 truncate leading-tight">{item.name}</span>
                <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">{item.brand}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
