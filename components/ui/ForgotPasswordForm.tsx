"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/utils";

/**
 * ForgotPasswordForm Component
 *
 * Facilitates customer account recovery.
 * Captures email address and triggers password recovery email dispatch from Supabase.
 * Styled in warm cream, soft shadows, and rose gold accents.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("If an account exists for this email, you will receive a password reset link.");
      setEmail("");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messaging */}
      {errorMsg && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600 leading-relaxed font-semibold">
          {successMsg}
        </div>
      )}

      {/* Email input */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-stone-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            required
            disabled={isLoading || !!successMsg}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] disabled:opacity-50 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={isLoading || !!successMsg}
          className="flex w-full justify-center rounded-full bg-[#E0A99E] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] shadow-sm hover:shadow-[#E0A99E]/20 transition-all cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending Link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </div>

      <div className="text-center text-xs text-stone-500 mt-4 font-light">
        Remembered your credentials?{" "}
        <Link
          href="/signin"
          className="font-semibold text-[#C68B7D] hover:text-[#B37A6D] transition-colors"
        >
          Sign in instead
        </Link>
      </div>
    </form>
  );
}
