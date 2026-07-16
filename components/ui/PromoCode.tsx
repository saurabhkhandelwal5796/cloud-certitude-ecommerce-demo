"use client";

import React, { useState, useEffect } from "react";

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
 * Fixed: Removed nested form element, set explicit button types, and handled event propagation.
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
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if already applied on mount
  useEffect(() => {
    if (promoApplied && appliedCode) {
      setPromoInput(appliedCode);
      setSuccessMsg("Promo code applied successfully.");
    }
  }, [promoApplied, appliedCode]);

  const handleApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg("");
    setSuccessMsg("");

    const code = promoInput.trim().toUpperCase();
    let discount = 0;

    if (code === "WELCOME10") {
      discount = 10;
    } else if (code === "SUMMER20") {
      discount = 20;
    } else if (code === "CLOUD15") {
      discount = 15;
    }

    if (discount > 0) {
      setDiscountPercent(discount);
      setAppliedCode(code);
      setPromoApplied(true);
      setSuccessMsg("Promo code applied successfully.");
      
      // Persist to localStorage
      localStorage.setItem(
        "certitude_applied_promo",
        JSON.stringify({ discountPercent: discount, appliedCode: code })
      );
    } else {
      setErrorMsg("Invalid promo code.");
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDiscountPercent(0);
    setPromoApplied(false);
    setAppliedCode("");
    setPromoInput("");
    setErrorMsg("");
    setSuccessMsg("");
    localStorage.removeItem("certitude_applied_promo");
  };

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
        Promo Code
      </h4>

      {!promoApplied ? (
        <div className="space-y-2 text-left">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
            />
            <button
              type="button"
              onClick={handleApply}
              className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 cursor-pointer"
            >
              Apply
            </button>
          </div>
          {errorMsg && (
            <p className="text-[10px] text-rose-500 font-semibold text-left">{errorMsg}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-left">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 flex justify-between items-center">
            <div>
              <p className="font-bold">Code Applied: {appliedCode}</p>
              <p className="text-[10px] text-emerald-600 font-light">
                Redeemed a {discountPercent}% discount on subtotal!
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[10px] underline hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Remove
            </button>
          </div>
          {successMsg && (
            <p className="text-[10px] text-emerald-600 font-semibold">{successMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
