"use client";

import React from "react";

export interface DeliveryOptionType {
  id: string;
  name: string;
  price: number;
  label: string;
  timeframe: string;
}

export const DELIVERY_OPTIONS: DeliveryOptionType[] = [
  { id: "standard", name: "Standard Delivery", price: 0, label: "Free", timeframe: "3-5 business days" },
  { id: "express", name: "Express Delivery", price: 99, label: "+₹99", timeframe: "1-2 business days" },
  { id: "sameday", name: "Same Day Delivery", price: 299, label: "+₹299", timeframe: "Delivered today by 9 PM" },
];

interface DeliveryOptionsProps {
  selectedOption: string;
  setSelectedOption: (id: string) => void;
}

/**
 * DeliveryOptions Component
 *
 * Renders delivery option cards (Standard, Express, Same Day).
 * Updates checkout delivery fees.
 */
export default function DeliveryOptions({ selectedOption, setSelectedOption }: DeliveryOptionsProps) {
  const handleSelect = (id: string) => {
    setSelectedOption(id);
    localStorage.setItem("certitude_delivery_option", id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3 text-left">
        Delivery Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        {DELIVERY_OPTIONS.map((opt) => {
          const active = opt.id === selectedOption;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`rounded-2xl p-4 border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                active
                  ? "bg-[#E0A99E]/5 border-[#E0A99E] shadow-sm shadow-[#E0A99E]/10"
                  : "bg-white border-stone-200 hover:border-stone-400"
              }`}
            >
              <div>
                <span className="block text-xs font-bold text-stone-900 uppercase tracking-wide">
                  {opt.name}
                </span>
                <span className="block text-[10px] text-stone-400 font-light mt-1">
                  {opt.timeframe}
                </span>
              </div>
              <span className={`text-xs font-extrabold mt-2 block ${opt.price === 0 ? "text-emerald-600" : "text-stone-700"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
