"use client";

import React, { useEffect, useState } from "react";
import type { CategoryBreakdown } from "@/services/AdminService";
import { formatINR } from "@/utils";

interface CategoryDonutProps {
  data: CategoryBreakdown[];
  title?: string;
}

export default function CategoryDonut({ data, title = "Sales by Category" }: CategoryDonutProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!data.length) return null;

  const R = 70;
  const CX = 100;
  const CY = 100;
  const STROKE = 28;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  const segments = data.map((d, idx) => {
    const startPercent = data.slice(0, idx).reduce((acc, curr) => acc + curr.percentage, 0);
    const dashArray = `${(d.percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const rotation = startPercent * 3.6 - 90;
    return { ...d, dashArray, rotation };
  });

  const total = data.reduce((s, d) => s + d.revenue, 0);
  const fmtRevenue = (v: number) => {
    return formatINR(v);
  };

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">{title}</h3>
        <p className="text-[9px] text-stone-400 font-light uppercase tracking-widest mt-0.5">Revenue by category</p>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        {/* SVG Donut */}
        <div className="relative flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#FAF6F0"
              strokeWidth={STROKE}
            />
            {/* Segments */}
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={animated ? seg.dashArray : `0 ${CIRCUMFERENCE}`}
                strokeDashoffset="0"
                strokeLinecap="butt"
                transform={`rotate(${seg.rotation}, ${CX}, ${CY})`}
                style={{ transition: `stroke-dasharray ${0.6 + i * 0.15}s ease` }}
              />
            ))}
            {/* Center label */}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="9" fill="#A8A29E" fontFamily="sans-serif" fontWeight="600">TOTAL</text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="11" fill="#1C1917" fontFamily="sans-serif" fontWeight="800">
              {fmtRevenue(total)}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 min-w-[120px]">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider truncate">{d.category}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="block text-[10px] font-black text-stone-900">{d.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2 mt-auto">
        {data.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="w-full bg-[#FAF6F0] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: animated ? `${d.percentage}%` : "0%",
                  backgroundColor: d.color,
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
