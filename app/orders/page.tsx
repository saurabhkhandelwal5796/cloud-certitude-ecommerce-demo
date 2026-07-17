"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import OrderTimeline from "@/components/ui/OrderTimeline";
import {
  getOrdersByCustomerEmail,
  cancelCustomerOrder,
  AdminOrder,
} from "@/services/AdminService";

interface CustomerUser {
  id: string;
  email?: string;
}

/**
 * CustomerOrdersPage Component
 *
 * Renders the customer order tracking, cancellation, and reordering history sheet.
 * Protected route: checks user authentication status on mount.
 */
export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCustomerOrders = async (email: string) => {
    console.log("[Orders] Loading orders for email:", email);
    try {
      const list = await getOrdersByCustomerEmail(email);
      console.log("[Orders] Retrieved orders:", list.length, list.map(o => o.orderId));
      setOrders(list);
    } catch (err) {
      console.error("[Orders] Error fetching details:", err);
    }
  };

  useEffect(() => {
    const checkSessionAndLoad = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("[Orders] Auth user:", user?.email ?? "not authenticated");

        if (!user) {
          // Redirect to sign in page if guest
          router.push("/signin?next=/orders");
          return;
        }

        setUser(user);
        await loadCustomerOrders(user.email!);
      } catch (err) {
        console.error("[Orders] Auth session verification failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSessionAndLoad();
  }, [router]);

  const toggleDetails = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setErrorMsg(null);
    setMessage(null);

    try {
      await cancelCustomerOrder(orderId);
      setMessage(`Order ${orderId} cancelled successfully.`);
      if (user) {
        await loadCustomerOrders(user.email!);
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to cancel order.");
    }
  };

  const handleReorder = (order: AdminOrder) => {
    if (!order.items) return;

    order.items.forEach((item) => {
      addToCart(
        {
          id: item.id || `product_${Date.now()}`,
          name: item.name,
          price: item.price,
          imageSrc: item.imageSrc || "",
          brand: item.brand || "Certitude Atelier",
          discountPercent: item.discountPercent,
        },
        item.quantity,
        item.size,
        item.color
      );
    });

    setMessage("Items successfully added to your cart!");
    setTimeout(() => {
      router.push("/cart");
    }, 1500);
  };

  const downloadInvoice = (order: AdminOrder) => {
    const subtotal = order.total;
    
    const invoiceText = `
=============================================
         CLOUD CERTITUDE FASHION
             INVOICE RECEIPT
=============================================
Order ID:      ${order.orderId}
Order Date:    ${order.orderDate}
Payment:       ${order.paymentMethod}
Status:        ${order.status}
Customer Name: ${order.customerName}
Email:         ${order.customerEmail}

Shipping Address:
---------------------------------------------
${order.address?.firstName} ${order.address?.lastName}
${order.address?.addressLine1}
${order.address?.addressLine2 ? order.address?.addressLine2 + "\n" : ""}${order.address?.city}, ${order.address?.state} ${order.address?.postalCode}
${order.address?.country}
Phone: ${order.address?.phone}

Items Purchased:
---------------------------------------------
${order.items
  ?.map(
    (item) =>
      `- ${item.name} (${item.size} / ${item.color}) x ${item.quantity} @ ₹${item.price.toFixed(
        2
      )}`
  )
  .join("\n")}

Order Calculation Breakdown:
---------------------------------------------
Subtotal:      ₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Shipping:      Free
Grand Total:   ₹${order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}

=============================================
      Discover timeless fashion curated.
         Thank you for shopping with us!
=============================================
`;

    const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${order.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status: AdminOrder["status"]) => {
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center">
        <div className="flex items-center justify-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your order history...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800 min-h-[calc(100vh-10rem)]">
      
      {/* Title */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
          Your Purchases
        </h1>
        <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
          Track shipment history, access invoices, or repeat purchases.
        </p>
      </div>

      {/* Notifications / Feedback toasts */}
      {message && (
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 mb-6 text-left">
          ✓ {message}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-250 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 mb-6 text-left">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200/50 rounded-3xl p-8 shadow-sm">
          <span className="text-4xl">🛍️</span>
          <h2 className="mt-4 text-lg font-bold text-stone-850">No Orders Found</h2>
          <p className="mt-2 text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
            You haven&apos;t placed any orders yet. Visit our seasonal collections to find your fit.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#E0A99E] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            return (
              <div
                key={order.orderId}
                className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden text-left transition-all duration-300"
              >
                {/* Order Summary Row (Header) */}
                <div className="bg-stone-50/50 border-b border-stone-100 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center text-xs">
                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[9px]">
                      Order Date
                    </span>
                    <span className="font-bold text-stone-800">{order.orderDate.split(",")[0]}</span>
                  </div>

                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[9px]">
                      Total Paid
                    </span>
                    <span className="font-extrabold text-stone-900">{formatPrice(order.total)}</span>
                  </div>

                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[9px]">
                      Fulfillment
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider mt-0.5 ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[9px]">
                      Order ID
                    </span>
                    <span className="font-mono font-bold text-stone-900 select-all uppercase block truncate">
                      {order.orderId}
                    </span>
                  </div>
                </div>

                {/* Body: Product Previews */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={`${item.name}-${item.size}-${item.color}`}
                      className="flex gap-4 items-start pb-4 border-b border-stone-50 last:border-0 last:pb-0"
                    >
                      {item.imageSrc && (
                        <div className="relative h-16 w-12 rounded-lg border border-stone-100 overflow-hidden bg-stone-50 flex-shrink-0">
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-stone-900 text-sm truncate uppercase tracking-wide">
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-light mt-0.5">
                          Size: {item.size} &middot; Color: {item.color} &middot; Qty: {item.quantity}
                        </span>
                        <span className="block text-xs font-bold text-stone-850 mt-1">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Accordion Actions Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 pt-4 gap-3">
                    <button
                      onClick={() => toggleDetails(order.orderId)}
                      className="text-stone-500 hover:text-stone-900 text-xs font-bold uppercase tracking-wider cursor-pointer py-1"
                    >
                      {isExpanded ? "Hide Tracking Details ↑" : "View Tracking Details ↓"}
                    </button>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 sm:flex-initial rounded-full bg-[#E0A99E] hover:bg-[#D4988D] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="flex-1 sm:flex-initial rounded-full border border-stone-200 hover:border-stone-400 text-stone-700 px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>

                  {/* Expanded details (Timeline + Address) */}
                  {isExpanded && (
                    <div className="mt-6 border-t border-stone-100 pt-6 space-y-6 animate-fade-in">
                      
                      {/* Timeline */}
                      <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#E0A99E] mb-4 text-center">
                          Delivery Progress Tracker
                        </span>
                        <OrderTimeline status={order.status} />
                      </div>

                      {/* Info blocks grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                        {/* Address */}
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-stone-900 uppercase tracking-widest text-[9px] border-b border-stone-100 pb-1.5">
                            Shipping Location
                          </h4>
                          {order.address ? (
                            <div className="text-stone-600 font-light leading-relaxed space-y-0.5 pt-1">
                              <p className="font-semibold text-stone-850">
                                {order.address.firstName} {order.address.lastName}
                              </p>
                              <p>{order.address.addressLine1}</p>
                              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                              <p>
                                {order.address.city}, {order.address.state} {order.address.postalCode}
                              </p>
                              <p>{order.address.country}</p>
                              <p className="mt-1">📞 {order.address.phone}</p>
                            </div>
                          ) : (
                            <p className="text-stone-400 font-light">No address details available.</p>
                          )}
                        </div>

                        {/* Order Summary breakdown */}
                        <div className="space-y-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-stone-900 uppercase tracking-widest text-[9px] border-b border-stone-100 pb-1.5">
                              Summary Invoice
                            </h4>
                            <div className="space-y-1.5 pt-2 text-stone-600 font-light">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping Mode</span>
                                <span className="font-semibold text-stone-850">{order.paymentMethod === "Cash on Delivery" ? "COD Standard" : "Prepaid Express"}</span>
                              </div>
                              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-1.5">
                                <span>Grand Total</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cancellation Button if Pending */}
                          {order.status === "Pending" && (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="mt-4 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
