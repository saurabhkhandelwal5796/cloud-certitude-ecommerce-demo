"use client";

import React, { useState, useEffect } from "react";

/**
 * PromotionalBanner
 * Top announcement notification strip with glassmorphic borders.
 */
export function PromotionalBanner() {
  return (
    <div className="w-full bg-stone-900 py-2.5 px-4 text-center border-b border-stone-850 z-50 relative select-none">
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#E0A99E] leading-none flex items-center justify-center gap-1.5 flex-wrap">
        <span>✨ PRIVATE ATELIER SALE: UP TO 25% OFF APPLIED AT CHECKOUT</span>
        <span className="hidden sm:inline text-stone-700">&middot;</span>
        <span className="text-white font-medium">FREE STANDARD SHIPPING ON ORDERS OVER $150</span>
      </p>
    </div>
  );
}

/**
 * ReferralBanner
 * Displays a custom client loyalty referral trigger.
 */
export function ReferralBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [referred, setReferred] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#FAF6F0] via-[#FAF9F6] to-[#FAF6F0] border-y border-stone-200/50 py-4 px-6 shadow-inner text-center relative">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
            Client Loyalty Program
          </span>
          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mt-0.5">
            Share The Atelier Experience: Give $20, Get $20
          </h4>
          <p className="text-[10px] text-stone-400 font-light mt-0.5">
            Introduce friends to Cloud Certitude Fashion and earn credits on their first purchase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {referred ? (
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              Referral Link Copied! ✓
            </span>
          ) : (
            <button
              onClick={() => {
                navigator.clipboard.writeText("https://cloudcertitudefashion.com/refer?code=ATELIER20");
                setReferred(true);
                setTimeout(() => setReferred(false), 2000);
              }}
              className="rounded-full bg-stone-900 px-5 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-stone-850 transition-colors cursor-pointer shadow-sm"
            >
              Get Invite Link
            </button>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-stone-400 hover:text-stone-700 font-bold px-2 cursor-pointer"
            aria-label="Close referral banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * LimitedTimeOfferBanner
 * Urgency/inventory countdown banner for checkout/cart overlays.
 */
export function LimitedTimeOfferBanner() {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 text-left flex items-start gap-3 shadow-sm select-none">
      <span className="text-lg">⏳</span>
      <div>
        <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
          Limited Time Offer Reservation
        </h4>
        <p className="text-[10px] text-stone-600 font-light mt-0.5 leading-relaxed">
          Due to high demand, items in your cart are reserved for only{" "}
          <span className="font-extrabold text-amber-700">{formatTime(timeLeft)} minutes</span>. Complete checkout to secure stock.
        </p>
      </div>
    </div>
  );
}
