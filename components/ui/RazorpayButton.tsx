"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadRazorpayScript, openRazorpayCheckout } from "@/services/PaymentService";

interface RazorpayButtonProps {
  /** Grand total in INR */
  amountInRupees: number;
  /** Customer pre-fill details */
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Pre-created Razorpay order ID from backend (optional) */
  razorpayOrderId?: string;
  /** Whether parent has completed validation */
  disabled?: boolean;
  /** Called with Razorpay payment ID on success */
  onSuccess: (paymentId: string) => void;
  /** Called with error message on failure or dismissal */
  onFailure: (error: string) => void;
}

/**
 * RazorpayButton Component
 *
 * Self-contained payment trigger for Razorpay TEST MODE.
 * - Loads the Razorpay SDK script on mount
 * - Opens the Razorpay checkout modal on click
 * - Delegates success/failure to parent via callbacks
 * - Styled to match the checkout page's primary action button
 */
export default function RazorpayButton({
  amountInRupees,
  customerName,
  customerEmail,
  customerPhone,
  razorpayOrderId,
  disabled = false,
  onSuccess,
  onFailure,
}: RazorpayButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMounted = useRef(true);

  // Load the Razorpay script when this component mounts
  useEffect(() => {
    isMounted.current = true;
    loadRazorpayScript().then((loaded) => {
      if (isMounted.current) {
        setScriptLoaded(loaded);
        if (!loaded) {
          console.error("[RazorpayButton] Failed to load Razorpay checkout script.");
        }
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = async () => {
    if (disabled || isProcessing || !scriptLoaded) return;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      onFailure(
        "Razorpay Key ID is not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to your .env.local file."
      );
      return;
    }

    setIsProcessing(true);

    try {
      const result = await openRazorpayCheckout({
        keyId,
        amountInRupees,
        customerName,
        customerEmail,
        customerPhone,
        razorpayOrderId,
      });

      if (!isMounted.current) return;

      if (result.success) {
        onSuccess(result.paymentId);
      } else {
        onFailure(result.error);
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  };

  const isDisabled = disabled || isProcessing || !scriptLoaded;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 transition-colors shadow-md h-12 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed gap-2"
      aria-label="Pay securely with Razorpay"
    >
      {isProcessing ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Opening Payment Gateway...
        </>
      ) : !scriptLoaded ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Payment Gateway...
        </>
      ) : (
        <>
          {/* Razorpay lock icon */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pay Securely with Razorpay
        </>
      )}
    </button>
  );
}
