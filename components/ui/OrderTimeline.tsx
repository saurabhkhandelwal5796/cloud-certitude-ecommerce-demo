import React from "react";

interface OrderTimelineProps {
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
}

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

/**
 * OrderTimeline Component
 *
 * Renders an interactive, beautiful visual timeline representing the shipping lifecycle.
 * Mirrors the luxury pastel aesthetic and handles Cancelled states gracefully.
 */
export default function OrderTimeline({ status }: OrderTimelineProps) {
  // If order is cancelled, render a specialized cancelled timeline
  if (status === "Cancelled") {
    return (
      <div className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
            ✕
          </div>
          <div className="text-left">
            <span className="block text-xs font-extrabold text-rose-600 uppercase tracking-widest leading-none">
              Order Cancelled
            </span>
            <span className="text-[10px] text-stone-400 font-light mt-0.5 block leading-tight">
              This transaction was voided and is no longer processing.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Find the index of the current status in the standard progression
  const currentStepIndex = STEPS.indexOf(status);

  return (
    <div className="w-full py-6">
      {/* Visual Timeline Nodes */}
      <div className="relative flex items-center justify-between">
        
        {/* Background Track Line */}
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-stone-100 rounded-full -z-10" />
        
        {/* Progress Line */}
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#E0A99E] rounded-full -z-10 transition-all duration-500 ease-out"
          style={{
            width: `${
              currentStepIndex <= 0
                ? 0
                : (currentStepIndex / (STEPS.length - 1)) * 100
            }%`,
          }}
        />

        {/* Nodes */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div key={step} className="flex flex-col items-center relative">
              {/* Node Dot */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
                  isCompleted
                    ? "bg-[#E0A99E] border-[#E0A99E] text-white"
                    : isActive
                    ? "bg-white border-[#E0A99E] text-[#E0A99E] ring-4 ring-[#E0A99E]/10 animate-pulse"
                    : "bg-white border-stone-200 text-stone-300"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[8px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Node Text Label (Visible on small screens and up, with truncation) */}
              <span
                className={`absolute top-8 text-center text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold whitespace-nowrap ${
                  isActive
                    ? "text-[#C68B7D]"
                    : isCompleted
                    ? "text-stone-850"
                    : "text-stone-400 font-normal"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spacer for label padding */}
      <div className="h-6" />
    </div>
  );
}
