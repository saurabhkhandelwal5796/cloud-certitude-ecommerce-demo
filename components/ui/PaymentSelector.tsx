"use client";

import React from "react";

export interface PaymentOptionType {
  id: string;
  name: string;
  comingSoon?: boolean;
  isFeatured?: boolean;
  icon: string;
}

export const PAYMENT_OPTIONS: PaymentOptionType[] = [
  { id: "credit", name: "Credit Card", icon: "💳" },
  { id: "debit", name: "Debit Card", icon: "🪪" },
  { id: "upi", name: "UPI (GPay / PhonePe)", icon: "📱" },
  { id: "netbanking", name: "Net Banking", icon: "🏦" },
  { id: "cod", name: "Cash on Delivery", icon: "💵" },
];

interface PaymentSelectorProps {
  selectedPayment: string;
  setSelectedPayment: (id: string) => void;
}

/**
 * PaymentSelector Component
 *
 * Renders selectors for payment modes (Credit Card, UPI, Net Banking, COD).
 * Persists selected values to localStorage.
 */
export default function PaymentSelector({ selectedPayment, setSelectedPayment }: PaymentSelectorProps) {
  const handleSelect = (id: string) => {
    setSelectedPayment(id);
    localStorage.setItem("certitude_payment_selection", id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3 text-left">
        Payment Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {PAYMENT_OPTIONS.map((pay) => {
          const active = pay.id === selectedPayment;
          const disabled = pay.comingSoon;

          return (
            <button
              key={pay.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(pay.id)}
              className={`rounded-2xl p-4 border flex items-center justify-between text-left transition-all ${
                disabled
                  ? "bg-stone-50/50 border-stone-150 opacity-55 cursor-not-allowed"
                  : active
                  ? "bg-[#E0A99E]/5 border-[#E0A99E] shadow-sm shadow-[#E0A99E]/10 cursor-pointer"
                  : "bg-white border-stone-200 hover:border-stone-400 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{pay.icon}</span>
                <div>
                  <span className="block text-xs font-bold text-stone-900 uppercase tracking-wide">
                    {pay.name}
                  </span>
                  {disabled && (
                    <span className="block text-[8px] font-extrabold text-[#E0A99E] uppercase tracking-widest mt-0.5">
                      Coming Soon
                    </span>
                  )}
                  {pay.isFeatured && (
                    <span className="block text-[8px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                      ✓ Secure · Test Mode
                    </span>
                  )}
                </div>
              </div>

              {!disabled && (
                <div
                  className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                    active ? "border-[#E0A99E] bg-[#E0A99E]" : "border-stone-300"
                  }`}
                >
                  {active && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
