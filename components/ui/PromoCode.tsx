"use client";

import React, { useState } from "react";

interface PromoCodeProps {
  discountPercent: number;
  setDiscountPercent: (val: number) => void;
  promoApplied: boolean;
  setPromoApplied: (val: boolean) => void;
  appliedCode: string;
  setAppliedCode: (val: string) => void;
}

/**
 * PromoCode Component
 *
 * Renders checkout promo selectors.
 * Supports WELCOME10, SUMMER20, and CLOUD15.
 */
export default function PromoCode({
  discountPercent,
  setDiscountPercent,
  promoApplied,
  setPromoApplied,
  appliedCode,
  setAppliedCode,
}: PromoCodeProps) {
  const [promoInput, setPromoInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const code = promoInput.trim().toUpperCase();
    if (code === "WELCOME10") {
      setDiscountPercent(10);
      setAppliedCode(code);
      setPromoApplied(true);
    } else if (code === "SUMMER20") {
      setDiscountPercent(20);
      setAppliedCode(code);
      setPromoApplied(true);
    } else if (code === "CLOUD15") {
      setDiscountPercent(15);
      setAppliedCode(code);
      setPromoApplied(true);
    } else {
      setErrorMsg("Invalid Promo Code. Try 'WELCOME10', 'SUMMER20', or 'CLOUD15'!");
    }
  };

  const handleRemove = () => {
    setDiscountPercent(0);
    setPromoApplied(false);
    setAppliedCode("");
    setPromoInput("");
    setErrorMsg("");
  };

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
        Promo Code
      </h4>

      {!promoApplied ? (
        <form onSubmit={handleApply} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 cursor-pointer"
            >
              Apply
            </button>
          </div>
          {errorMsg && (
            <p className="text-[10px] text-rose-500 font-semibold text-left">{errorMsg}</p>
          )}
        </form>
      ) : (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 flex justify-between items-center text-left">
          <div>
            <p className="font-bold">Code Applied: {appliedCode}</p>
            <p className="text-[10px] text-emerald-600 font-light">
              Redeemed a {discountPercent}% discount on subtotal!
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-[10px] underline hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
