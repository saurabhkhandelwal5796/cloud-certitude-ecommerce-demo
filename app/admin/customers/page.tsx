"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/utils";
import { getCustomers, AdminCustomer } from "@/services/AdminService";

/**
 * AdminCustomersPage Component
 *
 * Renders the customers database with order frequency and total spends.
 */
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const list = await getCustomers();
        setCustomers(list);
      } catch (err) {
        console.error("[Customers] Error loading customer registry:", err);
        setError("Unable to load data from server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, []);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-rose-500 font-bold uppercase tracking-wider text-sm border border-rose-200 bg-rose-50/50 px-6 py-4 rounded-3xl">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading customer registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Customers Registry
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Observe customer purchase frequencies, spends, and account identifiers.
        </p>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 font-semibold">Customer Name</th>
                <th className="py-4 px-6 font-semibold">Email ID</th>
                <th className="py-4 px-6 font-semibold text-center">Orders Placed</th>
                <th className="py-4 px-6 font-semibold text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {customers.map((cust) => (
                <tr key={cust.email} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-stone-900">
                    {cust.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-stone-500 select-all">
                    {cust.email}
                  </td>
                  <td className="py-4 px-6 text-center font-extrabold text-stone-700">
                    {cust.ordersCount}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-stone-900">
                    {formatPrice(cust.totalSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
