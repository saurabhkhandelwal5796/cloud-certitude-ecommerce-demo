"use client";

import React, { useState, useEffect, useRef } from "react";
import { generateTransactionId, generateOrderId, generatePaymentTimestamp } from "@/services/PaymentService";

interface RazorpayButtonProps {
  amountInRupees: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  disabled?: boolean;
  beforePay?: () => boolean; // Callback to validate form before starting payment
  onSuccess: (paymentDetails: { transactionId: string; orderId: string; timestamp: string }) => void;
  onFailure: (error: string) => void;
}

/**
 * RazorpayButton Component
 *
 * Implements a completely simulated, premium payment gateway modal.
 * When clicked:
 *   1. Runs the optional `beforePay` validation callback.
 *   2. Displays a premium glassmorphic modal overlay.
 *   3. Cycles through four states over 3.5 seconds.
 *   4. Displays animations, progress indicators, and status updates.
 *   5. Generates Transaction ID, Order ID, and Timestamp.
 *   6. Triggers the onSuccess callback with the payment details.
 */
export default function RazorpayButton({
  amountInRupees,
  disabled = false,
  beforePay,
  onSuccess,
  onFailure,
}: RazorpayButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const isMounted = useRef(true);

  // Keep references to intervals/timeouts for cleanup
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cleanUpTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cleanUpTimers();
    };
  }, []);

  const startPaymentSimulation = () => {
    if (disabled) return;

    // Run form validation first
    if (beforePay && !beforePay()) {
      return;
    }

    cleanUpTimers();
    setShowModal(true);
    setCurrentStep(1);
    setProgress(0);

    // Generate credentials at start
    const transactionId = generateTransactionId();
    const orderId = generateOrderId();
    const timestamp = generatePaymentTimestamp();

    // 1. Progress Bar Animation
    progressIntervalRef.current = setInterval(() => {
      if (!isMounted.current) {
        cleanUpTimers();
        return;
      }
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 100;
        }
        return prev + 1;
      });
    }, 35); // 100 * 35ms = ~3.5 seconds total

    // 2. Step Transitions
    // Step 1: Connecting to Payment Gateway... (starts immediately, 0s - 1s)
    
    // Step 2: Verifying Payment Details... (starts at 1s)
    const t2 = setTimeout(() => {
      if (isMounted.current) setCurrentStep(2);
    }, 1000);
    timeoutsRef.current.push(t2);

    // Step 3: Processing Transaction... (starts at 2.0s)
    const t3 = setTimeout(() => {
      if (isMounted.current) setCurrentStep(3);
    }, 2000);
    timeoutsRef.current.push(t3);

    // Step 4: Payment Successful! (starts at 3.0s)
    const t4 = setTimeout(() => {
      if (isMounted.current) setCurrentStep(4);
    }, 3000);
    timeoutsRef.current.push(t4);

    // Complete payment and callback (ends at 4.0s)
    const t5 = setTimeout(() => {
      if (isMounted.current) {
        cleanUpTimers();
        setShowModal(false);
        onSuccess({ transactionId, orderId, timestamp });
      }
    }, 4000);
    timeoutsRef.current.push(t5);
  };

  const handleCancelPayment = () => {
    cleanUpTimers();
    setShowModal(false);
    onFailure("Payment Failed. Please try again.");
  };

  const getStepStatusClass = (stepNum: number) => {
    if (currentStep > stepNum) return "text-emerald-600 font-medium";
    if (currentStep === stepNum) return "text-stone-900 font-bold animate-pulse";
    return "text-stone-400 font-light";
  };

  const renderStepIcon = (stepNum: number) => {
    if (currentStep > stepNum) {
      // Completed - Checkmark
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all duration-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (currentStep === stepNum) {
      // Current - Spinning Loader
      return (
        <div className="flex h-6 w-6 items-center justify-center">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      );
    }
    // Future - Gray Dot
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-300">
        <div className="h-2 w-2 rounded-full bg-current" />
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={startPaymentSimulation}
        disabled={disabled}
        className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 transition-colors shadow-md h-12 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed gap-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Pay Now
      </button>

      {/* Premium Glassmorphic Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white/90 border border-white/50 shadow-2xl rounded-3xl p-8 max-w-md w-full backdrop-blur-xl flex flex-col items-center space-y-6 text-center transform scale-100 transition-transform duration-300 animate-zoom-in">
            {/* Header / Brand */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E0A99E]">
                Secured Payment Gateway
              </span>
              <h3 className="mt-1 text-base font-extrabold uppercase tracking-wide text-stone-900">
                Cloud Certitude Fashion
              </h3>
            </div>

            {/* Simulated Processing Ring / Big Icon */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              {currentStep < 4 ? (
                <>
                  {/* Rotating Glass Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#E0A99E] border-t-transparent animate-spin" />
                  <span className="text-2xl">💳</span>
                </>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 scale-110 animate-bounce">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Display Amount */}
            <div className="bg-stone-50 border border-stone-100 rounded-2xl py-3 px-6 w-full">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Amount to Pay
              </span>
              <span className="text-xl font-extrabold text-stone-850">
                ₹{amountInRupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#E0A99E] h-full transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status Steps stack */}
            <div className="w-full space-y-3.5 text-left border-t border-stone-100 pt-5">
              <div className="flex items-center gap-3">
                {renderStepIcon(1)}
                <span className={`text-xs uppercase tracking-wide ${getStepStatusClass(1)}`}>
                  Connecting to Payment Gateway...
                </span>
              </div>

              <div className="flex items-center gap-3">
                {renderStepIcon(2)}
                <span className={`text-xs uppercase tracking-wide ${getStepStatusClass(2)}`}>
                  Verifying Payment Details...
                </span>
              </div>

              <div className="flex items-center gap-3">
                {renderStepIcon(3)}
                <span className={`text-xs uppercase tracking-wide ${getStepStatusClass(3)}`}>
                  Processing Transaction...
                </span>
              </div>

              <div className="flex items-center gap-3">
                {renderStepIcon(4)}
                <span className={`text-xs uppercase tracking-wide ${getStepStatusClass(4)}`}>
                  Payment Successful!
                </span>
              </div>
            </div>

            {/* Cancel Action */}
            {currentStep < 4 && (
              <button
                type="button"
                onClick={handleCancelPayment}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Cancel Payment
              </button>
            )}

            {/* Footer note */}
            <p className="text-[10px] text-stone-400 font-light">
              🔒 Safe & Secure 128-bit SSL encrypted connection.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
