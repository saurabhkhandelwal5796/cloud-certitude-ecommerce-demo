import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
}

/**
 * DashboardCard Component
 *
 * Renders stats summaries inside a premium, soft shadowed card container.
 */
export default function DashboardCard({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300/60">
      <div className="space-y-2 text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
          {title}
        </span>
        <h4 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
          {value}
        </h4>
        {change && (
          <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span
              className={
                changeType === "increase"
                  ? "text-emerald-600"
                  : changeType === "decrease"
                  ? "text-rose-500"
                  : "text-stone-400"
              }
            >
              {changeType === "increase" ? "↑" : changeType === "decrease" ? "↓" : "•"} {change}
            </span>
            <span className="text-stone-400 font-light text-[9px]">vs last month</span>
          </p>
        )}
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF6F0] text-xl text-[#E0A99E] shadow-sm">
        {icon}
      </div>
    </div>
  );
}
