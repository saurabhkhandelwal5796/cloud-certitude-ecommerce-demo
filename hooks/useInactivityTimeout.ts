"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

const CUSTOMER_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ADMIN_TIMEOUT_MS = 15 * 60 * 1000;    // 15 minutes
const THROTTLE_MS = 2000;                   // 2 seconds throttle for activity events

/**
 * Reusable Inactivity Timeout Hook
 *
 * Automatically signs out inactive users and redirects them to sign-in.
 * - Customer users: 30 minutes timeout
 * - Admin users: 15 minutes timeout
 * - Activity monitored: mousemove, keydown, scroll, click, touchstart
 */
export function useInactivityTimeout() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastResetRef = useRef<number>(0);

  useEffect(() => {
    // Skip on authentication routes
    if (["/signin", "/signup", "/forgot-password", "/reset-password"].includes(pathname)) {
      return;
    }

    let isMounted = true;

    const setupInactivityTimer = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        // If no authenticated session exists, no timeout is needed
        if (!user || !isMounted) return;

        // Fetch role from profiles table to determine appropriate timeout
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const isAdmin = profile?.role === "admin";
        const timeoutMs = isAdmin ? ADMIN_TIMEOUT_MS : CUSTOMER_TIMEOUT_MS;

        const handleTimeout = async () => {
          console.log(`[InactivityTimeout] ${isAdmin ? "Admin" : "Customer"} session expired after inactivity.`);
          try {
            await supabase.auth.signOut();
          } catch (err) {
            console.error("[InactivityTimeout] Error signing out on timeout:", err);
          }
          router.push("/signin?message=SessionExpired");
          router.refresh();
        };

        const resetTimer = () => {
          const now = Date.now();
          // Throttle timer resets to prevent high CPU usage on continuous events
          if (now - lastResetRef.current < THROTTLE_MS) {
            return;
          }
          lastResetRef.current = now;

          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(handleTimeout, timeoutMs);
        };

        // Initialize timer start
        resetTimer();

        // Listen to specified user activity events
        const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
        events.forEach((event) => {
          window.addEventListener(event, resetTimer, { passive: true });
        });

        // Cleanup listener function
        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          events.forEach((event) => {
            window.removeEventListener(event, resetTimer);
          });
        };
      } catch (err) {
        console.error("[InactivityTimeout] Initialization error:", err);
      }
    };

    const cleanupPromise = setupInactivityTimer();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
    };
  }, [pathname, router]);
}
