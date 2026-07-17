"use client";

import React, { useEffect, useState } from "react";
import type { MonthlyDataPoint } from "@/services/AdminService";

interface CustomerGrowthChartProps {
  data: MonthlyDataPoint[];
  title?: string;
}

export default function CustomerGrowthChart({ data, title = "Customer Growth" }: CustomerGrowthChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  if (!data.length) return null;

  const W = 500;
  const H = 200;
  const PAD_L = 36;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const max = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: PAD_T + chartH - (d.value / max) * chartH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PAD_T + chartH} L ${pts[0].x} ${PAD_T + chartH} Z`;

  const yTicks = [0, 0.5, 1].map((f) => ({
    y: PAD_T + chartH - f * chartH,
    label: Math.round(f * max).toString(),
  }));

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">{title}</h3>
          <p className="text-[9px] text-stone-400 font-light uppercase tracking-widest mt-0.5">New customers per month</p>
        </div>
        {hovered !== null && (
          <div className="text-right">
            <span className="block text-xs font-black text-stone-900">{data[hovered].value} new</span>
            <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest">{data[hovered].month}</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "160px" }} onMouseLeave={() => setHovered(null)}>
          <defs>
            <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C68B7D" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C68B7D" stopOpacity="0" />
            </linearGradient>
            <clipPath id="custClip">
              <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} />
            </clipPath>
          </defs>

          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#F5F0EA" strokeWidth="1" />
              <text x={PAD_L - 5} y={t.y + 4} textAnchor="end" fontSize="7" fill="#A8A29E" fontFamily="sans-serif">{t.label}</text>
            </g>
          ))}

          <path d={areaPath} fill="url(#custGrad)" clipPath="url(#custClip)"
            style={{ opacity: animated ? 1 : 0, transition: "opacity 0.8s ease" }} />

          <path d={linePath} fill="none" stroke="#C68B7D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            clipPath="url(#custClip)"
            style={{
              strokeDasharray: animated ? "none" : "2000",
              strokeDashoffset: animated ? 0 : 2000,
              transition: "stroke-dashoffset 1.2s ease",
            }} />

          {pts.map((p, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              <rect x={p.x - 18} y={PAD_T} width={36} height={chartH} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3}
                fill={hovered === i ? "#C68B7D" : "#E0A99E"}
                stroke="white" strokeWidth="2"
                style={{ transition: "r 0.15s, fill 0.15s" }} />
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="7" fill="#A8A29E" fontFamily="sans-serif">{p.month}</text>
              {hovered === i && (
                <g>
                  <rect x={p.x - 16} y={p.y - 24} width={32} height={16} rx="4" fill="#1C1917" />
                  <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">+{p.value}</text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
