// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { getOrderHistory, OrderHistoryEntry } from "@/services/AdminService";

interface OrderAuditTimelineProps {
  orderId: string;
  title?: string;
  isCustomerView?: boolean;
}

function formatHistoryDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * OrderAuditTimeline Component
 *
 * Renders an append-only audit trail timeline showing status transitions,
 * actor details, timestamps, and remarks for an order.
 */
export default function OrderAuditTimeline({
  orderId,
  title,
  isCustomerView = false,
}: OrderAuditTimelineProps) {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getOrderHistory(orderId);
        if (isSubscribed) {
          // Filter internal notes if in customer view
          const filtered = isCustomerView
            ? data.filter(
                (item) =>
                  !item.remarks ||
                  !item.remarks.toLowerCase().startsWith("[internal]")
              )
            : data;

          // Sort reverse-chronologically (most recent event at top)
          const sorted = [...filtered].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setHistory(sorted);
        }
      } catch (err) {
        console.error("[OrderAuditTimeline] Failed to load history:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isSubscribed = false;
    };
  }, [orderId, isCustomerView]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm text-left">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-stone-850 hover:text-stone-950 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📜</span>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-900">
            {title || (isCustomerView ? "Order Journey & Activity Log" : "Order Audit History Timeline")} ({history.length})
          </h4>
        </div>
        <span className="text-xs font-bold text-stone-400">
          {isExpanded ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-stone-150 space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-3 font-light">
              <svg className="h-4 w-4 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading audit logs...
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-stone-400 font-light py-2">
              No historical log entries recorded yet for this order.
            </p>
          ) : (
            <div className="relative pl-4 border-l-2 border-stone-200 space-y-4">
              {history.map((item, idx) => {
                const isCancelled = item.newStatus === "Cancelled";
                const isInitial = !item.previousStatus;

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-white transition-colors ${
                        isCancelled
                          ? "border-rose-500 bg-rose-50"
                          : isInitial
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-[#E0A99E] bg-[#FAF9F6]"
                      }`}
                    />

                    <div className="space-y-1">
                      {/* Timestamp & Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          {formatHistoryDate(item.createdAt)}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isCancelled
                              ? "bg-rose-50 text-rose-600 border border-rose-200/50"
                              : isInitial
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                              : "bg-[#FAF9F6] text-[#C68B7D] border border-[#E0A99E]/30"
                          }`}
                        >
                          {isInitial
                            ? "Order Created"
                            : `${item.previousStatus} → ${item.newStatus}`}
                        </span>
                      </div>

                      {/* Actor & Remarks */}
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-stone-850">
                          By: <span className="font-normal text-stone-600">{item.changedByName || "System"}</span>
                        </p>
                        {item.remarks && (
                          <p className="text-[11px] text-stone-500 font-light italic">
                            &ldquo;{item.remarks}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
