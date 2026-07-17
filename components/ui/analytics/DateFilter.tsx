"use client";

import React from "react";
import type { DateRangeFilter } from "@/services/AdminService";

interface DateFilterProps {
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
}

const OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

export default function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-[#FAF9F6] border border-stone-200/60 rounded-2xl p-1 shadow-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
            value === opt.value
              ? "bg-white text-stone-900 shadow-sm shadow-stone-200/60 border border-stone-200/50"
              : "text-stone-400 hover:text-stone-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
