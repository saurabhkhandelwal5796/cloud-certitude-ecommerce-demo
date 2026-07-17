import React from "react";

interface PaymentFailureProps {
  message?: string;
  onDismiss: () => void;
}

/**
 * PaymentFailure Component
 *
 * Dismissible inline error banner displayed when a Razorpay payment fails
 * or is cancelled. Styled in rose/red tones consistent with the design system.
 */
export default function PaymentFailure({
  message = "Payment Failed. Please try again.",
  onDismiss,
}: PaymentFailureProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-left shadow-sm"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-xs font-bold text-rose-700 uppercase tracking-wide">
          Payment Failed
        </p>
        <p className="mt-0.5 text-xs text-rose-600 font-light leading-relaxed">
          {message}
        </p>
        <p className="mt-1 text-[10px] text-rose-500/70 font-light">
          No amount has been charged. You may try again or select a different payment method.
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
        aria-label="Dismiss error"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
