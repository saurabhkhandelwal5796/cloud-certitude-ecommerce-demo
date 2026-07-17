"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/utils";
import { getOrders, updateOrderStatus, AdminOrder } from "@/services/AdminService";

const STATUSES: AdminOrder["status"][] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

/**
 * AdminOrdersPage Component
 *
 * Facilitates tracking and updating customer purchase orders.
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then((list) => {
        setOrders(list);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[Orders] Error loading orders:", err);
        setIsLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: AdminOrder["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state directly to be responsive
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );

      setNotification(`Order ${orderId} successfully set to ${newStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert("Failed to update order status. Please try again.");
    }
  };

  const getStatusStyle = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Processing":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-stone-50 text-stone-600 border-stone-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading customer orders...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Orders Management
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Track customer payments, dispatch details, and order fullfilment status.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 transition-all duration-300 animate-pulse">
          ✓ {notification}
        </div>
      )}

      {/* Table container */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 font-semibold">Order ID</th>
                <th className="py-4 px-6 font-semibold">Customer Details</th>
                <th className="py-4 px-6 font-semibold">Order Date</th>
                <th className="py-4 px-6 font-semibold">Method</th>
                <th className="py-4 px-6 font-semibold">Total Price</th>
                <th className="py-4 px-6 font-semibold text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {orders.map((o) => (
                <tr key={o.orderId} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-stone-900 uppercase select-all">
                    {o.orderId}
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="block font-bold text-stone-850 text-sm">
                        {o.customerName}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-light mt-0.5 select-all">
                        {o.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-stone-500 font-light">
                    {o.orderDate}
                  </td>
                  <td className="py-4 px-6 text-stone-650 font-medium">
                    {o.paymentMethod}
                  </td>
                  <td className="py-4 px-6 font-bold text-stone-900">
                    {formatPrice(o.total)}
                    <span className="block text-[9px] text-stone-400 font-light mt-0.5">
                      {o.itemsCount} {o.itemsCount === 1 ? "Item" : "Items"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.orderId, e.target.value as AdminOrder["status"])}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 ${getStatusStyle(o.status)}`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-stone-800">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
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
