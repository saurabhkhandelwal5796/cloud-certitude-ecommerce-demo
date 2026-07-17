"use client";

import React, { useState } from "react";

/**
 * AdminSettingsPage Component
 *
 * Provides simulated store configuration options.
 */
export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Cloud Certitude Fashion");
  const [contactEmail, setContactEmail] = useState("admin@cloudcertitude.com");
  const [currency, setCurrency] = useState("INR");
  const [simulationDelay, setSimulationDelay] = useState("3.5");
  const [sandboxMode, setSandboxMode] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Settings successfully saved and synchronized.");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Admin Settings
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Configure business details, notification preferences, and gateway behaviors.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 transition-all duration-300">
          ✓ {notification}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Card 1: Store profile */}
        <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
            Business Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-stone-500">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-stone-500">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-bold select-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-stone-500">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-bold"
              >
                <option value="INR">Rupees (INR)</option>
                <option value="USD">Dollars (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Simulated Gateway parameters */}
        <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
            Simulated Gateway Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-stone-500">
                Simulation Delay (seconds)
              </label>
              <select
                value={simulationDelay}
                onChange={(e) => setSimulationDelay(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-stone-850 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-bold"
              >
                <option value="2.0">2.0 seconds</option>
                <option value="3.5">3.5 seconds (Standard)</option>
                <option value="5.0">5.0 seconds</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="sandbox"
                checked={sandboxMode}
                onChange={(e) => setSandboxMode(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E]/50"
              />
              <label htmlFor="sandbox" className="font-bold uppercase tracking-wider text-stone-550 select-none">
                Enable Payment Sandbox Mode
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-8 py-3 text-xs font-bold text-white hover:bg-stone-850 transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            Save configurations
          </button>
        </div>
      </form>
    </div>
  );
}
