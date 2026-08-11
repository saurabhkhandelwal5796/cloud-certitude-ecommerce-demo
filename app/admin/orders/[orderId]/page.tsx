"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice, getGstLabel } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import OrderAuditTimeline from "@/components/ui/OrderAuditTimeline";
import { getOrders, AdminOrder } from "@/services/AdminService";
import { getVariantById } from "@/services/VariantService";
import { isFullSnapshot, coerceLegacyItem } from "@/services/SnapshotService";
import { OrderItemSnapshot } from "@/types/OrderItemSnapshot";

interface DivergenceAnalysis {
  itemSnapshot: OrderItemSnapshot;
  liveVariant: unknown | null;
  status: "IDENTICAL" | "DIVERGED" | "MISSING_IN_CATALOG" | "LEGACY_ITEM";
  differences: string[];
}

export default function AdminOrderAuditPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = Array.isArray(params?.orderId) ? params?.orderId[0] : params?.orderId;
  const orderId = orderIdParam || "";

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [analyses, setAnalyses] = useState<DivergenceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderAndAnalyze = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/signin?next=/admin/orders/${orderId}`);
          return;
        }

        const list = await getOrders();
        const matched = list.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());

        if (!matched) {
          setErrorMsg("Order not found in administrative ledger.");
          setIsLoading(false);
          return;
        }

        setOrder(matched);

        // Perform real-time catalog divergence analysis
        const itemAnalyses: DivergenceAnalysis[] = [];
        for (const rawItem of matched.items || []) {
          const snapshot = isFullSnapshot(rawItem)
            ? rawItem
            : coerceLegacyItem(rawItem as {
                id?: string;
                name: string;
                quantity: number;
                size?: string;
                color?: string;
                price: number;
                imageSrc?: string;
                brand?: string;
                discountPercent?: number;
                variantId?: string;
                variantSignature?: string;
              });

          if (!snapshot.variantId || !isFullSnapshot(rawItem)) {
            itemAnalyses.push({
              itemSnapshot: snapshot,
              liveVariant: null,
              status: "LEGACY_ITEM",
              differences: ["Legacy order item (recorded before immutable snapshot audit architecture)."],
            });
            continue;
          }

          let liveVariant: Record<string, unknown> | null = null;
          try {
            const fetched = await getVariantById(snapshot.variantId);
            liveVariant = (fetched as unknown as Record<string, unknown>) || null;
          } catch {
            liveVariant = null;
          }

          if (!liveVariant) {
            itemAnalyses.push({
              itemSnapshot: snapshot,
              liveVariant: null,
              status: "MISSING_IN_CATALOG",
              differences: ["Variant or product has been deleted or inactivated in live catalog since purchase."],
            });
            continue;
          }

          // Compare snapshot values vs live catalog values
          const diffs: string[] = [];
          const livePrice = Number(liveVariant.discountedPrice ?? liveVariant.price);
          if (Math.abs(livePrice - snapshot.pricing.originalPrice) > 0.01) {
            diffs.push(`Price modified: snapshot recorded ${formatPrice(snapshot.pricing.originalPrice)}, live catalog now lists ${formatPrice(livePrice)}.`);
          }

          if (liveVariant.sku && liveVariant.sku !== snapshot.sku) {
            diffs.push(`SKU modified: snapshot recorded '${snapshot.sku || "N/A"}', live catalog now lists '${liveVariant.sku}'.`);
          }

          if (liveVariant.variant_signature && liveVariant.variant_signature !== snapshot.variantSignature) {
            diffs.push(`Variant Signature modified: snapshot recorded '${snapshot.variantSignature}', live catalog now lists '${liveVariant.variant_signature}'.`);
          }

          if (liveVariant.is_active === false || liveVariant.isActive === false) {
            diffs.push("Variant has been set to INACTIVE in live catalog (currently not purchasable by new customers).");
          }

          itemAnalyses.push({
            itemSnapshot: snapshot,
            liveVariant,
            status: diffs.length > 0 ? "DIVERGED" : "IDENTICAL",
            differences: diffs,
          });
        }

        setAnalyses(itemAnalyses);
      } catch (err) {
        console.error("[AdminOrderAudit] Error running audit:", err);
        setErrorMsg("Failed executing audit and divergence analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndAnalyze();
    }
  }, [orderId, router]);

  const getBadgeStyle = (status: DivergenceAnalysis["status"]) => {
    switch (status) {
      case "IDENTICAL":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "DIVERGED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "MISSING_IN_CATALOG":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "LEGACY_ITEM":
        return "bg-stone-100 text-stone-600 border-stone-300";
    }
  };

  const getStatusLabel = (status: DivergenceAnalysis["status"]) => {
    switch (status) {
      case "IDENTICAL":
        return "Verified & Consistent";
      case "DIVERGED":
        return "Catalog Diverged";
      case "MISSING_IN_CATALOG":
        return "Deleted from Catalog";
      case "LEGACY_ITEM":
        return "Legacy Format";
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-600 font-medium text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Running forensic order snapshot & catalog divergence inspection...
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-8 rounded-2xl bg-white border border-stone-200/60 shadow-sm max-w-lg">
          <span className="text-3xl block mb-3">🛡️</span>
          <h2 className="text-lg font-bold text-stone-900 mb-2">Audit Report Notice</h2>
          <p className="text-stone-500 text-xs mb-6 leading-relaxed">
            {errorMsg || "We couldn't locate the requested order in the database."}
          </p>
          <Link
            href="/admin/orders"
            className="rounded-full bg-stone-900 hover:bg-stone-850 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors inline-block"
          >
            ← Back to Admin Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800 min-h-[calc(100vh-10rem)]">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors uppercase tracking-wider"
        >
          <span>←</span> Return to Admin Ledger
        </Link>
        <span className="px-3 py-1 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
          Support Staff Audit Dashboard
        </span>
      </div>

      {/* Main Order Header Box */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden mb-8">
        <div className="bg-stone-900 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#E0A99E] tracking-widest block">
                Forensic Order Record
              </span>
              <span className="text-[10px] text-stone-400 font-mono font-light">
                · {order.orderDate}
              </span>
            </div>
            <h1 className="text-2xl font-black font-mono tracking-wide uppercase mt-1">
              Order #{order.orderId}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-[#E0A99E]/20 text-[#E0A99E] border border-[#E0A99E]/30 text-xs font-extrabold uppercase tracking-wide rounded-full">
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Customer & Transaction Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-stone-50/70 border-b border-stone-200/60 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
              Customer Profile
            </span>
            <span className="font-bold text-stone-900 block text-sm">{order.customerName}</span>
            <span className="text-stone-500 font-light block mt-0.5 select-all">{order.customerEmail}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
              Payment & Tx Hash
            </span>
            <span className="font-semibold text-stone-800 block">{order.paymentMethod}</span>
            <span className="font-mono text-stone-500 text-[11px] block mt-0.5 truncate select-all" title={order.transactionId || "N/A"}>
              Tx: {order.transactionId || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
              Shipping Destination
            </span>
            <span className="font-medium text-stone-800 block truncate">
              {order.address ? `${order.address.city}, ${order.address.state} — ${order.address.country}` : "Address details archived"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
              Ledger Grand Total
            </span>
            <span className="font-black text-[#C68B7D] text-lg block">
              {formatPrice(order.grand_total !== undefined ? order.grand_total : order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* FORENSIC DIVERGENCE REPORT */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-stone-900">
              Immutable Snapshot vs. Live Catalog Inspection
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Protects customer dispute resolutions by verifying exactly what attributes and pricing were presented at checkout.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500">
            Reviewed Items: {analyses.length}
          </span>
        </div>

        <div className="space-y-6">
          {analyses.map((analysis, idx) => {
            const item = analysis.itemSnapshot;
            const statusStyle = getBadgeStyle(analysis.status);
            const statusLabel = getStatusLabel(analysis.status);

            return (
              <div
                key={`audit-item-${idx}`}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden"
              >
                {/* Item Header */}
                <div className="px-6 py-4 bg-stone-50 border-b border-stone-150 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                      Item #{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 text-sm">
                    {formatPrice(item.pricing.subtotal)} ({item.pricing.quantity} &times; {formatPrice(item.pricing.unitPrice)})
                  </span>
                </div>

                {/* Item Core Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left image & basics (4 cols) */}
                  <div className="lg:col-span-4 flex items-start gap-4 border-b lg:border-b-0 lg:border-r border-stone-150 pb-6 lg:pb-0 lg:pr-6">
                    <div className="relative h-28 w-22 rounded-xl border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-light">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-extrabold text-[#C68B7D] tracking-wider block">
                        {item.brand || "Atelier"} {item.category ? `· ${item.category}` : ""}
                      </span>
                      <h4 className="font-black text-stone-900 uppercase tracking-wide text-sm mt-0.5 truncate">
                        {item.productName}
                      </h4>
                      <p className="font-mono text-[11px] text-stone-500 mt-1">
                        SKU: <strong className="text-stone-700">{item.sku || "N/A"}</strong>
                      </p>
                      <p className="font-mono text-[10px] text-stone-400 mt-0.5 truncate" title={item.variantId || "N/A"}>
                        VarID: {item.variantId || "Legacy"}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Immutable Recorded Attributes (4 cols) */}
                  <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-150 pb-6 lg:pb-0 lg:pr-6">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Recorded Attributes at Purchase
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(item.attributes).map(([k, v]) => (
                        <div
                          key={k}
                          className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg text-xs"
                        >
                          <span className="text-stone-400 font-light mr-1">{k}:</span>
                          <strong className="text-stone-800 font-bold">{v}</strong>
                        </div>
                      ))}
                    </div>
                    {item.variantSignature && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <span className="block text-[9px] uppercase font-bold text-stone-400">Signature Hash</span>
                        <span className="font-mono text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded block mt-0.5 truncate">
                          {item.variantSignature}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Divergence & Audit Diagnosis (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        Catalog Consistency Check
                      </span>
                      {analysis.differences.length === 0 ? (
                        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                          <span className="text-sm font-bold">✓</span>
                          <span>Live product and variant parameters exactly match this order snapshot. No tampering or post-purchase edits detected.</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {analysis.differences.map((diff, dIdx) => (
                            <div
                              key={dIdx}
                              className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                                analysis.status === "MISSING_IN_CATALOG"
                                  ? "bg-rose-50 border-rose-200 text-rose-900"
                                  : analysis.status === "LEGACY_ITEM"
                                  ? "bg-stone-50 border-stone-200 text-stone-600"
                                  : "bg-amber-50 border-amber-200 text-amber-900"
                              }`}
                            >
                              <span className="font-bold text-sm">
                                {analysis.status === "MISSING_IN_CATALOG" ? "✕" : "⚠"}
                              </span>
                              <span>{diff}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Audit History Log Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-6 border-b border-stone-150 pb-3">
          Forensic Status Modification Ledger
        </h3>
        <OrderAuditTimeline orderId={orderId} isCustomerView={false} />
      </div>
    </div>
  );
}
