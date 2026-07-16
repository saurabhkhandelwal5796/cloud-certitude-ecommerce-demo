"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/utils";

/**
 * SignUpForm Component
 *
 * Facilitates frictionless new customer account creation.
 * Automatically logs in and redirects to the Homepage.
 * Styled in warm cream, soft shadows, and rose gold accents.
 */
export default function SignUpForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Validations
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
    console.log(`[Auth SignUp] Initiating registration for: ${email}`);

    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error(`[Auth SignUp] Supabase error: ${error.message}`);
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      console.log("[Auth SignUp] Supabase user registration created successfully:", data.user?.id);

      let currentSession = data.session;

      // If session is null (due to Supabase dashboard Confirm Email settings), attempt automatic sign in
      if (!currentSession && data.user) {
        console.log("[Auth SignUp] No active session returned. Attempting automatic sign in...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error(`[Auth SignUp] Automatic sign-in attempt failed: ${signInError.message}`);
          if (signInError.message.toLowerCase().includes("confirm")) {
            setErrorMsg(
              "Account created successfully, but your Supabase configuration requires email verification. " +
                "Please go to your Supabase Dashboard -> Auth -> Providers -> Email and disable 'Confirm email' for a frictionless demo experience."
            );
          } else {
            setErrorMsg(signInError.message);
          }
          setIsLoading(false);
          return;
        }

        currentSession = signInData.session;
      }

      if (currentSession) {
        console.log("[Auth SignUp] Session established and persisted in cookies:", currentSession.user.id);
        setSuccessMsg("Account created! Redirecting to homepage...");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        // Fallback warning if email verification remains active and auto signin failed
        setSuccessMsg("Account created! Please check your email inbox to verify your account.");
        setIsLoading(false);
      }
    } catch {
      console.error("[Auth SignUp] Unexpected exception during user sign up");
      setErrorMsg("An unexpected error occurred during sign up. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Messaging */}
      {errorMsg && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-[#E0A99E]/10 border border-[#E0A99E]/20 p-4 text-sm text-[#C68B7D] leading-relaxed font-semibold">
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
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] disabled:opacity-50 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Password input */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-stone-700">
          Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-stone-200 bg-white pl-3 pr-10 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] disabled:opacity-50 sm:text-sm"
            placeholder="Min. 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password input */}
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-semibold text-stone-700">
          Confirm Password
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            required
            disabled={isLoading}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border border-stone-200 bg-white pl-3 pr-10 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] disabled:opacity-50 sm:text-sm"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
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
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </div>

      <div className="text-center text-xs text-stone-500 mt-4 font-light">
        Already have an account?{" "}
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
