"use client";

import React from "react";

interface ChartBarProps {
  label: string;
  value: string;
  heightClass: string;
}

function RevenueBar({ label, value, heightClass }: ChartBarProps) {
  return (
    <div className="flex flex-col items-center gap-2 group flex-1">
      <div className="w-full bg-[#FAF6F0] rounded-xl flex items-end h-48 relative overflow-hidden">
        {/* Animated Bar */}
        <div
          className={`w-full bg-gradient-to-t from-[#C68B7D] to-[#E0A99E] rounded-b-xl group-hover:opacity-90 transition-all duration-550 ${heightClass}`}
        />
        {/* Hover label */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] font-bold py-1 px-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
          {value}
        </div>
      </div>
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

interface CategoryRowProps {
  category: string;
  percentage: number;
  colorClass: string;
}

function CategoryRow({ category, percentage, colorClass }: CategoryRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-stone-700 uppercase tracking-wider">{category}</span>
        <span className="font-black text-stone-900">{percentage}%</span>
      </div>
      <div className="w-full bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * AdminAnalyticsPage Component
 *
 * Renders high-fidelity, custom CSS-based visual placeholders for analytics metrics.
 * Eliminates large external chart dependencies to ensure fast build compilation.
 */
export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Analytics & Performance
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Observe sales metrics, product performances, and categories popularity.
        </p>
      </div>

      {/* Grid: Revenue & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Revenue Bar Chart (2/3 width) */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Monthly Revenue Growth
            </h3>
          </div>

          <div className="flex items-end justify-between gap-3 pt-4 px-2">
            <RevenueBar label="Jan" value="₹1,24,000" heightClass="h-[30%]" />
            <RevenueBar label="Feb" value="₹1,85,000" heightClass="h-[45%]" />
            <RevenueBar label="Mar" value="₹2,10,000" heightClass="h-[55%]" />
            <RevenueBar label="Apr" value="₹3,40,000" heightClass="h-[75%]" />
            <RevenueBar label="May" value="₹2,80,000" heightClass="h-[65%]" />
            <RevenueBar label="Jun" value="₹4,12,000" heightClass="h-[95%]" />
            <RevenueBar label="Jul" value="₹4,90,000" heightClass="h-[100%]" fill-current />
          </div>
        </div>

        {/* Categories Distribution (1/3 width) */}
        <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Sales by Category
            </h3>
          </div>

          <div className="space-y-5 flex-1 justify-center flex flex-col">
            <CategoryRow category="Women's Apparel" percentage={54} colorClass="bg-[#E0A99E]" />
            <CategoryRow category="Men's Apparel" percentage={32} colorClass="bg-[#C68B7D]" />
            <CategoryRow category="Kid's Apparel" percentage={14} colorClass="bg-[#D4988D]" />
          </div>
        </div>

      </div>

      {/* Top Selling Products list */}
      <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30">
        <div className="border-b border-stone-100 pb-4 mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
            Top Selling Products
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { name: "Classic Cashmere Trench Coat", brand: "Certitude", sales: 124, revenue: "₹61,876.00" },
            { name: "Silk Cocktail Evening Gown", brand: "Certitude", sales: 98, revenue: "₹57,330.00" },
            { name: "Oversized Merino Wool Sweater", brand: "EcoKnit", sales: 86, revenue: "₹16,770.00" },
            { name: "Minimalist Linen Utility Shirt", brand: "Atelier", sales: 74, revenue: "₹8,880.00" },
          ].map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-b-0 hover:bg-stone-50/30 px-1 rounded-xl">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-stone-300">#0{idx + 1}</span>
                <div className="text-left">
                  <span className="block text-xs font-bold text-stone-900">{item.name}</span>
                  <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">{item.brand}</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-8">
                <div className="text-xs">
                  <span className="block font-bold text-stone-850">{item.sales} Units</span>
                  <span className="block text-[9px] text-stone-400 font-light mt-0.5">Quantity sold</span>
                </div>
                <div className="text-xs min-w-[80px]">
                  <span className="block font-black text-stone-900">{item.revenue}</span>
                  <span className="block text-[9px] text-stone-400 font-light mt-0.5">Total Revenue</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
