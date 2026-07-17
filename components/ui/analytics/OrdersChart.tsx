"use client";

import React, { useEffect, useState } from "react";
import type { MonthlyDataPoint } from "@/services/AdminService";

interface OrdersChartProps {
  data: MonthlyDataPoint[];
  title?: string;
}

export default function OrdersChart({ data, title = "Orders Per Month" }: OrdersChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">{title}</h3>
        <p className="text-[9px] text-stone-400 font-light uppercase tracking-widest mt-0.5">Orders count per month</p>
      </div>

      <div className="flex-1 flex items-end justify-between gap-1.5 pt-2 pb-1" style={{ minHeight: "160px" }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isHov = hovered === i;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              <div className={`text-[8px] font-black text-stone-900 transition-opacity duration-200 ${isHov ? "opacity-100" : "opacity-0"}`}>
                {d.value}
              </div>

              {/* Bar container */}
              <div className="w-full rounded-t-lg relative overflow-hidden bg-[#FAF6F0]" style={{ height: "140px" }}>
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ease-out ${isHov ? "bg-gradient-to-t from-[#C68B7D] to-[#E0A99E]" : "bg-gradient-to-t from-[#D4988D]/70 to-[#E0A99E]/50"}`}
                  style={{ height: animated ? `${pct}%` : "0%" }}
                />
              </div>

              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
