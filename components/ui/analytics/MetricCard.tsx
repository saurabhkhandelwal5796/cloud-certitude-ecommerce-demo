"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatINR } from "@/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon: string;
  trend?: number;
  trendLabel?: string;
  accentColor?: string;
  isCurrency?: boolean;
  animate?: boolean;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export default function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  icon,
  trend,
  trendLabel = "vs last month",
  accentColor = "text-[#E0A99E]",
  isCurrency = false,
  animate = true,
}: MetricCardProps) {
  const isNumeric = typeof value === "number";
  const [displayed, setDisplayed] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || !isNumeric) return;
    const target = value as number;
    const duration = 1000;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(target * eased);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [value, animate, isNumeric]);

  const trendUp = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;

  const displayValue = isNumeric
    ? (isCurrency ? formatINR(displayed) : `${prefix}${formatCompact(displayed)}${suffix}`)
    : String(value);

  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white/80 backdrop-blur-sm p-5 shadow-sm shadow-stone-200/30 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-stone-200/40 hover:-translate-y-0.5 hover:border-stone-300/50">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF6F0] text-lg shadow-sm">{icon}</div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${trendUp ? "bg-emerald-50 text-emerald-600" : trendDown ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-400"}`}>
            {trendUp ? "↑" : trendDown ? "↓" : "•"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${accentColor}`}>{title}</span>
        <h4 className="mt-1 text-2xl font-black text-stone-900 leading-none tracking-tight truncate" title={isNumeric ? String(value) : undefined}>
          {displayValue}
        </h4>
      </div>
      {trend !== undefined && (
        <p className="text-[9px] text-stone-400 font-light uppercase tracking-wider -mt-1">{trendLabel}</p>
      )}
    </div>
  );
}
