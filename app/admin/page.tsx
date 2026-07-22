"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils";
import DashboardCard from "@/components/ui/DashboardCard";
import {
  getDashboardStats,
  getOrders,
  getCustomers,
  DashboardStats,
  AdminOrder,
  AdminCustomer,
} from "@/services/AdminService";

/**
 * AdminDashboardPage Component
 *
 * Renders the home view of the Admin panel.
 * Contains summary indicator cards, recent orders, and recent customers.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await getDashboardStats();
        const ordersList = await getOrders();
        const customersList = await getCustomers();

        setStats(dashboardStats);
        setRecentOrders(ordersList.slice(0, 5)); // top 5 recent orders
        setRecentCustomers(customersList.slice(0, 5)); // top 5 customers
      } catch (err) {
        console.error("[Dashboard] Error loading data:", err);
        setError("Unable to load data from server.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
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

  const getStatusColor = (status: AdminOrder["status"]) => {
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
          Loading Dashboard details...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Dashboard
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          General business metrics and order analytics summary.
        </p>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon="💰"
            change="14.2%"
            changeType="increase"
          />
          <DashboardCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            change="8.5%"
            changeType="increase"
          />
          <DashboardCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon="👥"
            change="12.1%"
            changeType="increase"
          />
          <DashboardCard
            title="Total Products"
            value={stats.totalProducts}
            icon="👗"
            change="2.4%"
            changeType="increase"
          />
        </div>
      )}

      {/* Order Pipeline Summary Metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300/60 text-left">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">
                Pending Orders
              </span>
              <h4 className="text-lg font-black text-stone-900 mt-1 leading-none">
                {stats.pendingOrdersCount}
              </h4>
            </div>
            <span className="text-xl">⏳</span>
          </div>

          <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300/60 text-left">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">
                Delivered Orders
              </span>
              <h4 className="text-lg font-black text-stone-900 mt-1 leading-none">
                {stats.deliveredOrdersCount}
              </h4>
            </div>
            <span className="text-xl">✓</span>
          </div>

          <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300/60 text-left">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-500">
                Cancelled Orders
              </span>
              <h4 className="text-lg font-black text-stone-900 mt-1 leading-none">
                {stats.cancelledOrdersCount}
              </h4>
            </div>
            <span className="text-xl">✕</span>
          </div>

          <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/30 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300/60 text-left">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">
                Revenue Today
              </span>
              <h4 className="text-lg font-black text-stone-900 mt-1 leading-none">
                {formatPrice(stats.revenueToday)}
              </h4>
            </div>
            <span className="text-xl">📈</span>
          </div>
        </div>
      )}

      {/* Grid: Recent Orders & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List (Takes 2/3 of desktop width) */}
        <div className="lg:col-span-2 rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-[10px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-[10px] uppercase font-bold text-stone-400">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 text-xs">
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-stone-900 select-all uppercase">
                      {order.orderId}
                    </td>
                    <td className="py-3 font-medium text-stone-700">
                      {order.customerName}
                    </td>
                    <td className="py-3 font-bold text-stone-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers List (Takes 1/3 of desktop width) */}
        <div className="rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Customers Overview
            </h3>
            <Link
              href="/admin/customers"
              className="text-[10px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-stone-50 flex-1 overflow-y-auto">
            {recentCustomers.map((cust) => (
              <div key={cust.email} className="py-3 flex items-center justify-between gap-2 hover:bg-stone-50/50 transition-colors px-1 rounded-xl">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-stone-900 truncate">
                    {cust.name}
                  </span>
                  <span className="block text-[9px] text-stone-400 font-light truncate select-all">
                    {cust.email}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block text-xs font-black text-stone-900">
                    {formatPrice(cust.totalSpend)}
                  </span>
                  <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                    {cust.ordersCount} {cust.ordersCount === 1 ? "Order" : "Orders"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
