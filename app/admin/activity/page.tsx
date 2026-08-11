// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { getAdminActivityLogs, AdminActivityLog } from "@/services/AdminService";

type DateFilter = "All" | "Today" | "Last 7 Days" | "Last 30 Days";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminActivityLogs(200);
      setLogs(data);
    } catch (err) {
      console.error("[AdminActivityPage] Exception loading logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute unique activity types for filter dropdown
  const activityTypes = ["All", ...Array.from(new Set(logs.map((l) => l.activity_type)))];

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesSearch =
        log.admin_name.toLowerCase().includes(q) ||
        log.activity_type.toLowerCase().includes(q) ||
        log.entity_id.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // 2. Activity Type Filter
    if (selectedActivityType !== "All" && log.activity_type !== selectedActivityType) {
      return false;
    }

    // 3. Date Filter
    if (dateFilter !== "All") {
      const logDate = new Date(log.created_at).getTime();
      const now = Date.now();
      if (dateFilter === "Today") {
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        if (logDate < startOfToday) return false;
      } else if (dateFilter === "Last 7 Days") {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (logDate < sevenDaysAgo) return false;
      } else if (dateFilter === "Last 30 Days") {
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (logDate < thirtyDaysAgo) return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const getActivityBadgeStyle = (type: string) => {
    if (type.includes("APPROVE") || type.includes("COMPLETE") || type.includes("CREATE")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (type.includes("REJECT") || type.includes("FAIL") || type.includes("DELETE") || type.includes("DEACTIVATE")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (type.includes("INITIATE") || type.includes("RECEIVE") || type.includes("UPDATE")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-stone-900">
            Admin Activity Audit Log
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Immutable, append-only system audit logs tracking all administrative actions and security events.
          </p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Admin, Type, Entity ID, or Description..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-4 pr-10 py-2 text-xs text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end text-xs">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Timeframe:
            </span>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as DateFilter);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Activity Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Activity Type:
            </span>
            <select
              value={selectedActivityType}
              onChange={(e) => {
                setSelectedActivityType(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium cursor-pointer"
            >
              {activityTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 font-light text-xs flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading admin activity logs...
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-light text-xs space-y-2">
            <span className="text-3xl block">🔒</span>
            <p>No activity logs match your search and filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-stone-150 bg-stone-50/80 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Admin Name</th>
                  <th className="py-4 px-6">Activity Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Entity Type</th>
                  <th className="py-4 px-6">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-6 text-stone-500 font-light text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Admin Name */}
                    <td className="py-4 px-6 font-bold text-stone-900">
                      {log.admin_name}
                    </td>

                    {/* Activity Type */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${getActivityBadgeStyle(
                          log.activity_type
                        )}`}
                      >
                        {log.activity_type}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6 max-w-sm text-stone-700 font-light">
                      {log.description}
                    </td>

                    {/* Entity Type */}
                    <td className="py-4 px-6 font-semibold text-stone-800 uppercase text-[10px] tracking-wider">
                      {log.entity_type}
                    </td>

                    {/* Entity ID */}
                    <td className="py-4 px-6 font-mono text-stone-600 font-medium select-all text-[11px]">
                      {log.entity_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredLogs.length > itemsPerPage && (
          <div className="flex items-center justify-between border-t border-stone-150 px-6 py-4 bg-stone-50/50 text-xs">
            <span className="text-stone-500 font-light text-[11px]">
              Showing <span className="font-bold text-stone-800">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-stone-800">
                {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
              </span>{" "}
              of <span className="font-bold text-stone-800">{filteredLogs.length}</span> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="text-stone-600 font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 disabled:opacity-40 hover:bg-stone-100 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
