import React from "react";

interface PaymentSuccessProps {
  orderId: string;
}

/**
 * PaymentSuccess Component
 *
 * Full-screen overlay displayed immediately after a successful Razorpay payment,
 * while the app saves the order and navigates to /order-confirmation.
 * Mirrors the existing success overlay in checkout/page.tsx exactly.
 */
export default function PaymentSuccess({ orderId }: PaymentSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-300">
      {/* Checkmark circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6 scale-110 animate-bounce">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-black text-stone-900 uppercase tracking-wide">
        Payment Successful!
      </h2>
      <p className="mt-2 text-xs text-stone-500 font-light leading-relaxed text-center max-w-xs">
        Order <span className="font-bold text-stone-700 select-all">{orderId}</span> confirmed.
        <br />
        Redirecting to your order summary...
      </p>

      {/* Spinner */}
      <div className="mt-6 flex items-center gap-2 text-xs text-stone-400 font-light">
        <svg
          className="h-4 w-4 animate-spin text-[#E0A99E]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Processing order...
      </div>
    </div>
  );
}
