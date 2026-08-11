"use client";

import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

/**
 * Global Inactivity Listener Component
 *
 * Renders null and invokes useInactivityTimeout hook globally.
 */
export default function InactivityListener() {
  useInactivityTimeout();
  return null;
}
