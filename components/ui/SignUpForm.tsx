"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/utils";

/**
 * SignUpForm Component
 *
 * Facilitates new customer account creation.
 * Checks password parameters, verification equality, and email structures before
 * invoking Supabase authentication services.
 */
export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Valdations
    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      // Configure sign up redirect to process the PKCE flow correctly
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Check if user is created but needs email confirmation
      if (data?.user && data.session === null) {
        setSuccessMsg(
          "Registration successful! Please check your email inbox to verify your account."
        );
        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setSuccessMsg("Account created and signed in successfully!");
      }
    } catch {
      setErrorMsg("An unexpected error occurred during sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Messaging */}
      {errorMsg && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 leading-relaxed">
          {successMsg}
        </div>
      )}

      {/* Email input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Password input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 sm:text-sm"
            placeholder="Min. 8 characters"
          />
        </div>
      </div>

      {/* Confirm Password input */}
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirm-password"
            type="password"
            required
            disabled={isLoading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-slate-950"
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
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-4">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Sign in instead
        </Link>
      </div>
    </form>
  );
}
