"use client";

import React, { useEffect, useState } from "react";
import type { ProductAnalytic } from "@/services/AdminService";
import { formatINR } from "@/utils";

interface TopProductsChartProps {
  data: ProductAnalytic[];
  title?: string;
}

function fmt(v: number): string {
  return formatINR(v);
}

export default function TopProductsChart({ data, title = "Top Products by Revenue" }: TopProductsChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!data.length) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const COLORS = [
    "#E0A99E", "#C68B7D", "#D4988D", "#B87265", "#A06055",
    "#E8BFB8", "#CC9E93", "#BA8378", "#A8736A", "#96645D",
  ];

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">{title}</h3>
        <p className="text-[9px] text-stone-400 font-light uppercase tracking-widest mt-0.5">Ranked by total revenue generated</p>
      </div>

      <div className="space-y-3">
        {data.map((product, i) => {
          const pct = (product.revenue / maxRevenue) * 100;
          return (
            <div key={product.id} className="group">
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[9px] font-black text-stone-300 flex-shrink-0 w-5 text-right">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-stone-900 truncate leading-tight">{product.name}</span>
                    <span className="block text-[8px] font-extrabold uppercase tracking-widest" style={{ color: COLORS[i % COLORS.length] }}>
                      {product.brand}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-700">{product.unitsSold} units</span>
                  </div>
                  <div className="min-w-[90px]">
                    <span className="block text-[10px] font-black text-stone-900">{fmt(product.revenue)}</span>
                  </div>
                </div>
              </div>
              {/* Horizontal bar */}
              <div className="w-full bg-[#FAF6F0] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: animated ? `${pct}%` : "0%",
                    backgroundColor: COLORS[i % COLORS.length],
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
