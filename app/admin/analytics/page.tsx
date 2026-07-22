/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatINR } from "@/utils";
import MetricCard from "@/components/ui/analytics/MetricCard";
import DateFilter from "@/components/ui/analytics/DateFilter";
import RevenueChart from "@/components/ui/analytics/RevenueChart";
import OrdersChart from "@/components/ui/analytics/OrdersChart";
import CategoryDonut from "@/components/ui/analytics/CategoryDonut";
import TopProductsChart from "@/components/ui/analytics/TopProductsChart";
import CustomerGrowthChart from "@/components/ui/analytics/CustomerGrowthChart";
import {
  getAnalyticsSummary,
  getMonthlyRevenueData,
  getOrdersPerMonthData,
  getCategoryBreakdown,
  getTopProducts,
  getCustomerGrowthData,
  getOrders,
  AnalyticsSummary,
  MonthlyDataPoint,
  CategoryBreakdown,
  ProductAnalytic,
  DateRangeFilter,
  AdminOrder,
} from "@/services/AdminService";

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

function Spinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
        <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading Analytics...
      </div>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-stone-100" />
      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-stone-400">{label}</span>
      <div className="h-px flex-1 bg-stone-100" />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<MonthlyDataPoint[]>([]);
  const [ordersData, setOrdersData] = useState<MonthlyDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<ProductAnalytic[]>([]);
  const [growthData, setGrowthData] = useState<MonthlyDataPoint[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const [s, rev, ord, cat, prod, growth, orders] = await Promise.all([
        getAnalyticsSummary(),
        getMonthlyRevenueData(),
        getOrdersPerMonthData(),
        getCategoryBreakdown(),
        getTopProducts(),
        getCustomerGrowthData(),
        getOrders(),
      ]);
      setSummary(s);
      setRevenueData(rev);
      setOrdersData(ord);
      setCategoryData(cat);
      setTopProducts(prod);
      setGrowthData(growth);
      setAllOrders(orders);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("[Analytics] Error loading data:", err);
    }
  }, []);

  useEffect(() => {
    loadAll().finally(() => setIsLoading(false));
  }, [loadAll]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows: string[][] = [
      ["Order ID", "Customer", "Email", "Date", "Status", "Payment", "Total"],
      ...allOrders.map((o) => [
        o.orderId,
        o.customerName,
        o.customerEmail,
        o.orderDate,
        o.status,
        o.paymentMethod,
        formatINR(o.total),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certitude-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF Export placeholder ─────────────────────────────────────────────────
  const handleExportPDF = () => {
    window.print();
  };

  if (isLoading) return <Spinner />;
  if (!summary) return null;

  const revenueTrend = pctChange(summary.revenueThisMonth, summary.revenuePrevMonth);
  const ordersTrend = pctChange(summary.ordersThisMonth, summary.ordersPrevMonth);
  const customersTrend = pctChange(summary.newCustomersThisMonth, summary.newCustomersPrevMonth);

  return (
    <div className="space-y-8 text-left" id="analytics-dashboard">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
            Analytics & Performance
          </h1>
          <p className="mt-1 text-[10px] text-stone-400 font-light uppercase tracking-widest">
            Last refreshed: {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter value={dateRange} onChange={setDateRange} />

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200/60 text-[10px] font-extrabold uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className={isRefreshing ? "animate-spin inline-block" : "inline-block"}>↻</span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200/60 text-[10px] font-extrabold uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-all shadow-sm cursor-pointer"
          >
            ↓ CSV
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-[10px] font-extrabold uppercase tracking-wider text-white hover:bg-stone-800 transition-all shadow-sm cursor-pointer"
          >
            ↓ PDF
          </button>
        </div>
      </div>

      {/* ── Revenue Metrics ──────────────────────────────────────────────────── */}
      <SectionTitle label="Revenue" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue Today"
          value={summary.revenueToday}
          icon="💰"
          accentColor="text-emerald-500"
          isCurrency
        />
        <MetricCard
          title="Revenue This Week"
          value={summary.revenueThisWeek}
          icon="📅"
          accentColor="text-blue-500"
          isCurrency
        />
        <MetricCard
          title="Revenue This Month"
          value={summary.revenueThisMonth}
          icon="📈"
          trend={revenueTrend}
          trendLabel="vs last month"
          accentColor="text-[#E0A99E]"
          isCurrency
        />
        <MetricCard
          title="Revenue This Year"
          value={summary.revenueThisYear}
          trend={pctChange(summary.revenueThisYear, summary.revenuePrevYear)}
          trendLabel="vs last year"
          accentColor="text-amber-500"
          isCurrency
        />
      </div>

      {/* ── Order Metrics ────────────────────────────────────────────────────── */}
      <SectionTitle label="Orders" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={summary.totalOrders}
          icon="📦"
          trend={ordersTrend}
          trendLabel="vs last month"
          accentColor="text-stone-500"
        />
        <MetricCard
          title="Pending Orders"
          value={summary.pendingOrders}
          icon="⏳"
          accentColor="text-amber-500"
        />
        <MetricCard
          title="Delivered Orders"
          value={summary.deliveredOrders}
          icon="✅"
          accentColor="text-emerald-500"
        />
        <MetricCard
          title="Cancelled Orders"
          value={summary.cancelledOrders}
          icon="✕"
          accentColor="text-rose-400"
        />
      </div>

      {/* ── Customer Metrics ─────────────────────────────────────────────────── */}
      <SectionTitle label="Customers" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={summary.totalCustomers}
          icon="👥"
          accentColor="text-blue-500"
        />
        <MetricCard
          title="New This Month"
          value={summary.newCustomersThisMonth}
          icon="✨"
          trend={customersTrend}
          trendLabel="vs last month"
          accentColor="text-[#E0A99E]"
        />
        <MetricCard
          title="Returning Customers"
          value={summary.returningCustomers}
          icon="🔄"
          accentColor="text-violet-500"
        />
        <MetricCard
          title="Avg Customer Spend"
          value={summary.avgCustomerSpend}
          icon="💳"
          accentColor="text-amber-500"
          isCurrency
        />
      </div>

      {/* ── Product Metrics ──────────────────────────────────────────────────── */}
      <SectionTitle label="Products" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={summary.totalProducts}
          icon="👗"
          accentColor="text-stone-500"
        />
        <MetricCard
          title="Out of Stock"
          value={summary.outOfStockCount}
          icon="⚠️"
          accentColor="text-rose-400"
        />
        <div className="rounded-3xl border border-stone-200/50 bg-white/80 backdrop-blur-sm p-5 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF6F0] text-lg shadow-sm">🥇</div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Best Seller</span>
            <h4 className="mt-1 text-sm font-black text-stone-900 leading-snug line-clamp-2">{summary.bestSellingProduct}</h4>
          </div>
        </div>
        <div className="rounded-3xl border border-stone-200/50 bg-white/80 backdrop-blur-sm p-5 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF6F0] text-lg shadow-sm">📉</div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Lowest Selling</span>
            <h4 className="mt-1 text-sm font-black text-stone-900 leading-snug line-clamp-2">{summary.lowestSellingProduct}</h4>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart (Full Width) ───────────────────────────────────────── */}
      <SectionTitle label="Charts" />
      <RevenueChart data={revenueData} title="Monthly Revenue Growth" />

      {/* ── Orders + Category (2-col) ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <OrdersChart data={ordersData} title="Orders Per Month" />
        </div>
        <div className="lg:col-span-2">
          <CategoryDonut data={categoryData} title="Sales by Category" />
        </div>
      </div>

      {/* ── Top Products + Customer Growth (2-col) ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProducts} title="Top 10 Products" />
        <CustomerGrowthChart data={growthData} title="Customer Growth" />
      </div>

      {/* ── Quick Summary Stats Row ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-stone-200/50 bg-gradient-to-br from-white to-[#FAF9F6] p-6 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 mb-5">
          Business Intelligence Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Conversion Rate", value: `${allOrders.length > 0 ? ((summary.deliveredOrders / summary.totalOrders) * 100).toFixed(1) : "0"}%`, icon: "🎯" },
            { label: "Avg Order Value", value: summary.totalOrders > 0 ? formatINR(summary.revenueThisYear / Math.max(summary.totalOrders, 1)) : "INR 0.00", icon: "🛒" },
            { label: "Cancellation Rate", value: `${summary.totalOrders > 0 ? ((summary.cancelledOrders / summary.totalOrders) * 100).toFixed(1) : "0"}%`, icon: "❌" },
            { label: "Fulfillment Rate", value: `${summary.totalOrders > 0 ? (((summary.totalOrders - summary.cancelledOrders) / summary.totalOrders) * 100).toFixed(1) : "100"}%`, icon: "📊" },
            { label: "Total Revenue", value: formatINR(summary.revenueThisYear), icon: "💰" },
            { label: "Active Products", value: `${summary.totalProducts - summary.outOfStockCount}`, icon: "✅" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-2xl bg-white/70 border border-stone-100/80 hover:border-stone-200/80 transition-colors">
              <div className="text-xl mb-2">{stat.icon}</div>
              <div className="text-base font-black text-stone-900">{stat.value}</div>
              <div className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[9px] text-stone-300 font-light uppercase tracking-widest pb-4">
        Cloud Certitude Analytics · Data sourced from local store · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
