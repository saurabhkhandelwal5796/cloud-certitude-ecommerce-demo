"use client";

import React, { useState } from "react";

/**
 * DeliveryChecker Component
 *
 * Simulates shipping estimates based on client-side pincode testing.
 * Styled in warm cream glassmorphic outline cards.
 */
export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 5) {
      alert("Please enter a valid 5 or 6 digit pincode.");
      return;
    }

    setIsLoading(true);
    setIsChecked(false);

    // Simulate server side lookup
    setTimeout(() => {
      setIsLoading(false);
      setIsChecked(true);
      // Generate estimated delivery date (current date + 3 days)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      const formattedDate = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      setDeliveryDate(formattedDate);
    }, 850);
  };

  return (
    <div className="rounded-2xl border border-stone-200/50 bg-[#FAF6F0]/40 p-5 text-left shadow-sm mt-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-750 flex items-center gap-1.5">
        <svg className="h-4.5 w-4.5 text-[#E0A99E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16h6m-6 0H7m12 0v-5a1 1 0 00-1-1h-5" />
        </svg>
        Check Delivery & Shipping
      </h3>
      <p className="mt-1 text-[11px] text-stone-400 font-light leading-relaxed">
        Verify express courier routes and estimated delivery timeframes.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={pincode}
          maxLength={6}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter Pincode (e.g. 90210)"
          className="flex-1 rounded-full border border-stone-250 bg-white px-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-stone-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? "Checking..." : "Check"}
        </button>
      </form>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
          <svg className="animate-spin h-4 w-4 text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Determining courier availability...
        </div>
      )}

      {/* Success estimate output */}
      {isChecked && !isLoading && (
        <div className="mt-4 rounded-xl bg-white border border-stone-100 p-3 flex items-start gap-2.5 shadow-sm">
          <svg className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="text-xs">
            <p className="font-bold text-stone-800">Delivery is Available for Pincode {pincode}</p>
            <p className="mt-0.5 text-stone-600 font-light">
              Expected Delivery: <strong className="font-bold text-stone-850">{deliveryDate}</strong> via Express Post.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
