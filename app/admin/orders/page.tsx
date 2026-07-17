"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";
import OrderTimeline from "@/components/ui/OrderTimeline";
import {
  getOrders,
  updateOrderStatus,
  getDashboardStats,
  AdminOrder,
  DashboardStats,
} from "@/services/AdminService";

const STATUSES: AdminOrder["status"][] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

/**
 * AdminOrdersPage Component
 *
 * Implements a high-end order administration workspace.
 * Features:
 *   - Search by ID/Name/Email
 *   - Filter by Fulfillment Status
 *   - Sort by Date (Newest/Oldest)
 *   - Metrics indicators (Pending, Delivered, Cancelled, Today's Revenue)
 *   - Toggleable purchase details (Address, Items list, Visual Timeline tracker)
 *   - Fulfillment state actions (dropdown dispatchers)
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortByDate, setSortByDate] = useState("newest"); // newest | oldest

  const loadData = () => {
    Promise.all([getOrders(), getDashboardStats()])
      .then(([ordersList, summaryStats]) => {
        setOrders(ordersList);
        setStats(summaryStats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[Admin Orders] Error loading page stats:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: AdminOrder["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );

      // Re-trigger stats calculations
      const updatedStats = await getDashboardStats();
      setStats(updatedStats);

      setNotification(`Fulfillment status for order ${orderId} successfully set to ${newStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert("Failed to update status.");
    }
  };

  const getStatusStyle = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Shipped":
      case "Out for Delivery":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const toggleDetails = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // ─── Filter, Search, Sort computations ───────────────────────────────────
  const processedOrders = orders
    .filter((order) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesId = order.orderId.toLowerCase().includes(query);
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesEmail = order.customerEmail.toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesEmail) return false;
      }
      // 2. Status Filter
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Sort by Date
      const dateA = new Date(a.orderDate).getTime() || 0;
      const dateB = new Date(b.orderDate).getTime() || 0;
      return sortByDate === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading workspace orders...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Orders Administration
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Verify payments, edit shipping, adjust timelines, or cancel purchases.
        </p>
      </div>

      {/* Metrics Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Pending Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.pendingOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
              Delivered Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.deliveredOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-450">
              Cancelled Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.cancelledOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">
              Revenue Today
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{formatPrice(stats.revenueToday)}</h4>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          ✓ {notification}
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, Name, or Email..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-4 pr-10 py-2 text-xs text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Sort:
            </span>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 font-semibold">Order ID</th>
                <th className="py-4 px-6 font-semibold">Customer Details</th>
                <th className="py-4 px-6 font-semibold">Order Date</th>
                <th className="py-4 px-6 font-semibold">Method</th>
                <th className="py-4 px-6 font-semibold">Total Price</th>
                <th className="py-4 px-6 font-semibold text-center">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {processedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 font-light">
                    No orders matches your search criteria.
                  </td>
                </tr>
              ) : (
                processedOrders.map((o) => {
                  const isExpanded = expandedOrderId === o.orderId;
                  return (
                    <React.Fragment key={o.orderId}>
                      <tr className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleDetails(o.orderId)}
                            className="font-mono font-bold text-stone-900 uppercase hover:text-[#C68B7D] text-left block focus:outline-none"
                          >
                            {o.orderId} {isExpanded ? "▲" : "▼"}
                          </button>
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

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-stone-50/50 p-6 border-b border-stone-100">
                            <div className="space-y-6">
                              {/* Visual Tracker */}
                              <div className="bg-white rounded-2xl p-4 border border-stone-200/50 shadow-sm max-w-3xl mx-auto">
                                <span className="block text-[9px] font-black uppercase tracking-widest text-[#E0A99E] mb-4 text-center">
                                  Order Timeline Status
                                </span>
                                <OrderTimeline status={o.status} />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs max-w-4xl mx-auto">
                                {/* Shipping details */}
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-stone-900 uppercase tracking-widest text-[9px] border-b border-stone-200 pb-1.5 text-left">
                                    Delivery Address
                                  </h4>
                                  {o.address ? (
                                    <div className="text-stone-600 font-light leading-relaxed space-y-0.5 pt-1 text-left">
                                      <p className="font-semibold text-stone-850">
                                        {o.address.firstName} {o.address.lastName}
                                      </p>
                                      <p>{o.address.addressLine1}</p>
                                      {o.address.addressLine2 && <p>{o.address.addressLine2}</p>}
                                      <p>
                                        {o.address.city}, {o.address.state} {o.address.postalCode}
                                      </p>
                                      <p>{o.address.country}</p>
                                      <p className="mt-1">📞 {o.address.phone}</p>
                                    </div>
                                  ) : (
                                    <p className="text-stone-400 font-light text-left">No address details available.</p>
                                  )}
                                </div>

                                {/* Items list */}
                                <div className="space-y-2">
                                  <h4 className="font-extrabold text-stone-900 uppercase tracking-widest text-[9px] border-b border-stone-200 pb-1.5 text-left">
                                    Items Purchased
                                  </h4>
                                  <div className="space-y-2 pt-1 text-left">
                                    {o.items?.map((item) => (
                                      <div key={`${item.name}-${item.size}-${item.color}`} className="flex items-center gap-3">
                                        {item.imageSrc && (
                                          <div className="relative h-10 w-8 border border-stone-100 rounded bg-stone-50 overflow-hidden flex-shrink-0">
                                            <Image
                                              src={item.imageSrc}
                                              alt={item.name}
                                              fill
                                              sizes="32px"
                                              className="object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="font-bold text-stone-900 truncate uppercase tracking-wider text-[10px]">
                                            {item.name}
                                          </p>
                                          <p className="text-[9px] text-stone-400 font-light mt-0.5">
                                            Size: {item.size} &middot; Color: {item.color} &middot; Qty: {item.quantity}
                                          </p>
                                        </div>
                                        <div className="text-right font-bold text-stone-850">
                                          {formatPrice(item.price * item.quantity)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
