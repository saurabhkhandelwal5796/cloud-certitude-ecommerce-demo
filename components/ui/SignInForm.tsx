"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/utils";

/**
 * SignInForm Component
 *
 * Handles customer authentication using Supabase.
 * Redirects to the Homepage on success and features a password visibility toggle.
 * Styled in warm cream, soft shadows, and rose gold accents.
 */
export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(searchParams.get("error"));
  const [successMsg, setSuccessMsg] = useState<string | null>(
    searchParams.get("message")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !password) {
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

    setIsLoading(true);
    console.log(`[Auth SignIn] Attempting login for: ${email}`);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(`[Auth SignIn] Login failed: ${error.message}`);
        // Friendly errors
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMsg("Invalid email or password. Please try again.");
        } else if (error.message.toLowerCase().includes("confirm")) {
          setErrorMsg(
            "Your email has not been confirmed yet. " +
              "If email verification is active, please check your inbox. " +
              "Otherwise, disable 'Confirm email' in the Supabase Dashboard -> Auth -> Providers -> Email."
          );
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      console.log("[Auth SignIn] Login successful. Session user ID:", data.user?.id);
      setSuccessMsg("Logged in successfully! Redirecting...");

      // Role-based redirect
      setTimeout(async () => {
        try {
          const supabase = getSupabaseClient();
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user!.id)
            .single();
          if (profile?.role === "admin" || data.user!.email === "admin@cloudcertitude.com") {
            router.push("/admin");
          } else {
            router.push("/");
          }
          router.refresh();
        } catch {
          router.push("/");
          router.refresh();
        }
      }, 800);
    } catch {
      console.error("[Auth SignIn] Unexpected error during login process");
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600">
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
            name="email"
            type="email"
            autoComplete="email"
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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-stone-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-stone-400 hover:text-[#C68B7D] transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border border-stone-200 bg-white pl-3 pr-10 py-2 text-stone-900 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] disabled:opacity-50 sm:text-sm"
            placeholder="••••••••"
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
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </div>

      <div className="text-center text-xs text-stone-500 mt-4 font-light">
        New to Certitude Atelier?{" "}
        <Link
          href={`/signup${nextRoute !== "/" ? "?next=" + encodeURIComponent(nextRoute) : ""}`}
          className="font-semibold text-[#C68B7D] hover:text-[#B37A6D] transition-colors"
        >
          Create an account
        </Link>
      </div>
    </form>
  );
}
