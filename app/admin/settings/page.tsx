"use client";

import React from "react";

/**
 * AdminSettingsPage Component
 *
 * Renders read-only active business profile settings for the Atelier.
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Admin Settings
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Active system parameters and business profile metadata.
        </p>
      </div>

      {/* Store Profile Display Card */}
      <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
          Business Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-600">
          <div className="space-y-1">
            <span className="block font-bold uppercase tracking-wider text-stone-400">
              Store Name
            </span>
            <span className="text-sm font-semibold text-stone-850">
              Cloud Certitude Fashion
            </span>
          </div>

          <div className="space-y-1">
            <span className="block font-bold uppercase tracking-wider text-stone-400">
              Contact Email
            </span>
            <span className="text-sm font-semibold text-stone-850">
              admin@cloudcertitude.com
            </span>
          </div>

          <div className="space-y-1">
            <span className="block font-bold uppercase tracking-wider text-stone-400">
              Primary Currency
            </span>
            <span className="text-sm font-semibold text-stone-850">
              INR (Indian Rupee)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
