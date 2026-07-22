"use client";

import React, { useEffect, useRef, useState } from "react";
import type { MonthlyDataPoint } from "@/services/AdminService";
import { formatINR } from "@/utils";

interface RevenueChartProps {
  data: MonthlyDataPoint[];
  title?: string;
}

function fmt(v: number): string {
  return formatINR(v);
}

export default function RevenueChart({ data, title = "Monthly Revenue" }: RevenueChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 600;
  const H = 220;
  const PAD_L = 80;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: PAD_T + chartH - (d.value / max) * chartH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PAD_T + chartH} L ${pts[0].x} ${PAD_T + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD_T + chartH - f * chartH,
    label: fmt(f * max),
  }));

  return (
    <div ref={ref} className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">{title}</h3>
          <p className="text-[9px] text-stone-400 font-light uppercase tracking-widest mt-0.5">Current year · Jan – Dec</p>
        </div>
        {hovered !== null && (
          <div className="text-right">
            <span className="block text-xs font-black text-stone-900">{fmt(data[hovered].value)}</span>
            <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest">{data[hovered].month}</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "200px" }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0A99E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E0A99E" stopOpacity="0" />
            </linearGradient>
            <clipPath id="revClip">
              <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} />
            </clipPath>
          </defs>

          {/* Y-axis grid lines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#F5F0EA" strokeWidth="1" />
              <text x={PAD_L - 6} y={t.y + 4} textAnchor="end" fontSize="8" fill="#A8A29E" fontFamily="sans-serif">
                {t.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#revGrad)" clipPath="url(#revClip)"
            style={{ opacity: animated ? 1 : 0, transition: "opacity 0.8s ease" }} />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#E0A99E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            clipPath="url(#revClip)"
            style={{
              strokeDasharray: animated ? "none" : "2000",
              strokeDashoffset: animated ? 0 : 2000,
              transition: "stroke-dashoffset 1.2s ease",
            }} />

          {/* Data points + hover zones */}
          {pts.map((p, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              <rect x={p.x - 20} y={PAD_T} width={40} height={chartH} fill="transparent" />
              <circle
                cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? "#C68B7D" : "#E0A99E"}
                stroke="white" strokeWidth="2"
                style={{ transition: "r 0.15s, fill 0.15s" }}
              />
              {/* X-axis label */}
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#A8A29E" fontFamily="sans-serif">
                {p.month}
              </text>
              {/* Hover tooltip */}
              {hovered === i && (
                <g>
                  <rect x={p.x - 45} y={p.y - 26} width={90} height={18} rx="4" fill="#1C1917" />
                  <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">
                    {fmt(p.value)}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
