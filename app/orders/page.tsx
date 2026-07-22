"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import OrderTimeline from "@/components/ui/OrderTimeline";
import { jsPDF } from "jspdf";
import {
  getOrdersByCustomerEmail,
  cancelCustomerOrder,
  seedMissingHistoricalOrders,
  AdminOrder,
} from "@/services/AdminService";

interface CustomerUser {
  id: string;
  email?: string;
}

/**
 * Redesigned CustomerOrdersPage Component (Amazon/Flipkart Style)
 *
 * Renders an elegant customer order management timeline sheet.
 */
export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
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
          router.push("/signin?next=/orders");
          return;
        }

        setUser(user);
        // Seed mock data for demonstration if they don't have orders yet
        await seedMissingHistoricalOrders(user.email!);
        await loadCustomerOrders(user.email!);
      } catch (err) {
        console.error("[Orders] Auth session verification failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSessionAndLoad();
  }, [router]);

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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = [44, 62, 80]; // dark slate
    const secondaryColor = [189, 195, 199]; // light gray
    
    // Header Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Cloud Certitude Fashion", 14, 20);
    
    doc.setFontSize(13);
    doc.setTextColor(120, 120, 120);
    doc.text("Tax Invoice", 14, 27);
    
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 31, 196, 31);

    // Metadata Left Column
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Order ID: ${order.orderId.toUpperCase()}`, 14, 40);
    doc.text(`Order Date: ${order.orderDate}`, 14, 46);
    doc.text(`Customer Name: ${order.customerName}`, 14, 52);
    doc.text(`Customer Email: ${order.customerEmail}`, 14, 58);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, 64);

    // Shipping Address Right Column
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Address:", 120, 40);
    doc.setFont("helvetica", "normal");
    if (order.address) {
      doc.text(`${order.address.firstName} ${order.address.lastName}`, 120, 46);
      doc.text(`${order.address.addressLine1}`, 120, 52);
      if (order.address.addressLine2) {
        doc.text(`${order.address.addressLine2}`, 120, 58);
        doc.text(`${order.address.city}, ${order.address.state} ${order.address.postalCode}`, 120, 64);
        doc.text(`${order.address.country}`, 120, 70);
      } else {
        doc.text(`${order.address.city}, ${order.address.state} ${order.address.postalCode}`, 120, 58);
        doc.text(`${order.address.country}`, 120, 64);
      }
    } else {
      doc.text("Data unavailable", 120, 46);
    }

    doc.setLineWidth(0.3);
    doc.line(14, 76, 196, 76);

    // Product Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Product Details", 14, 82);
    doc.text("Qty", 100, 82);
    doc.text("Size", 115, 82);
    doc.text("Unit Price", 130, 82);
    doc.text("Discount %", 150, 82);
    doc.text("Line Total", 175, 82);

    doc.line(14, 85, 196, 85);

    // Product Table Rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    let y = 92;
    order.items?.forEach((item) => {
      const splitName = doc.splitTextToSize(item.name, 80);
      doc.text(splitName, 14, y);
      
      const qtyStr = String(item.quantity);
      const sizeStr = item.size || "-";
      const priceStr = `INR ${item.price.toFixed(2)}`;
      const discStr = item.discountPercent ? `${item.discountPercent}%` : "0%";
      
      const unitPriceAfterDisc = item.discountPercent 
        ? item.price * (1 - item.discountPercent / 100) 
        : item.price;
      const lineTotalVal = unitPriceAfterDisc * item.quantity;
      const totalStr = `INR ${lineTotalVal.toFixed(2)}`;

      doc.text(qtyStr, 100, y);
      doc.text(sizeStr, 115, y);
      doc.text(priceStr, 130, y);
      doc.text(discStr, 150, y);
      doc.text(totalStr, 175, y);

      y += (splitName.length * 5) + 3;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Divider
    doc.line(14, y - 2, 196, y - 2);

    // Totals Section
    y += 6;
    const subtotalStr = order.subtotal !== undefined && order.subtotal !== null ? `INR ${order.subtotal.toFixed(2)}` : "Data unavailable";
    const discountStr = order.discount !== undefined && order.discount !== null ? `-INR ${order.discount.toFixed(2)}` : "Data unavailable";
    const taxStr = order.tax !== undefined && order.tax !== null ? `INR ${order.tax.toFixed(2)}` : "Data unavailable";
    const shippingStr = order.shipping !== undefined && order.shipping !== null ? `INR ${order.shipping.toFixed(2)}` : "Data unavailable";
    const grandTotalStr = order.grand_total !== undefined && order.grand_total !== null ? `INR ${order.grand_total.toFixed(2)}` : "Data unavailable";

    doc.setFont("helvetica", "bold");
    doc.text("Pricing Summary", 14, y);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Subtotal:`, 130, y);
    doc.text(subtotalStr, 175, y);
    
    y += 6;
    doc.text(`Discount:`, 130, y);
    doc.text(discountStr, 175, y);

    y += 6;
    doc.text(`Shipping:`, 130, y);
    doc.text(shippingStr, 175, y);

    y += 6;
    doc.text(`GST (8%):`, 130, y);
    doc.text(taxStr, 175, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total:`, 130, y);
    doc.text(grandTotalStr, 175, y);

    // Divider
    y += 10;
    doc.line(14, y, 196, y);

    // Footer note
    y += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for shopping with Cloud Certitude Fashion.", 14, y);

    doc.save(`Invoice-${order.orderId}.pdf`);
  };

  const getStatusColor = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return "text-emerald-600";
      case "Cancelled":
        return "text-rose-600";
      case "Shipped":
      case "Out for Delivery":
        return "text-blue-600";
      default:
        return "text-amber-600";
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800 min-h-[calc(100vh-10rem)]">
      
      {/* Title */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
          Your Orders
        </h1>
        <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
          Track fulfillment status, repeat purchases, or get invoices.
        </p>
      </div>

      {/* Notifications */}
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
        /* Redesigned Amazon/Flipkart Style Order Cards */
        <div className="space-y-6">
          {orders.map((order) => {
            const isTracking = activeTrackingOrderId === order.orderId;
            return (
              <div
                key={order.orderId}
                className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden text-left"
              >
                {/* 1. Header Metadata Panel */}
                <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[10px]">
                      Order Placed
                    </span>
                    <span className="font-bold text-stone-700">{order.orderDate.split(",")[0]}</span>
                  </div>

                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[10px]">
                      Total Paid
                    </span>
                    <span className="font-bold text-stone-850">{formatPrice(order.total)}</span>
                  </div>

                  <div>
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[10px]">
                      Ship To
                    </span>
                    <span className="font-bold text-stone-700 underline decoration-dotted cursor-help relative group">
                      {order.address?.firstName} {order.address?.lastName}
                      {/* Shipping Address Tooltip */}
                      {order.address && (
                        <span className="absolute bottom-full left-0 hidden group-hover:block bg-stone-900 text-white rounded-lg p-3 text-[10px] w-64 shadow-lg z-20 font-light mb-1 border border-stone-700 leading-relaxed">
                          <strong className="block font-semibold mb-1">Shipping Location:</strong>
                          {order.address.addressLine1}, {order.address.addressLine2 ? order.address.addressLine2 + ", " : ""}{order.address.city}, {order.address.state} - {order.address.postalCode}, {order.address.country}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="block text-stone-400 font-light uppercase tracking-wider text-[10px]">
                      Order #
                    </span>
                    <span className="font-mono font-bold text-stone-900 select-all uppercase">
                      {order.orderId}
                    </span>
                  </div>
                </div>

                {/* 2. Order Body Items */}
                <div className="p-6 space-y-6">
                  {order.items?.map((item, idx) => (
                    <div
                      key={`${item.name}-${item.size}-${item.color}-${idx}`}
                      className="flex flex-col md:flex-row gap-6 justify-between items-start border-b border-stone-100 last:border-0 pb-6 last:pb-0"
                    >
                      {/* Left: Product Info */}
                      <div className="flex gap-4 items-start">
                        {item.imageSrc && (
                          <div className="relative h-24 w-18 rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                            <Image
                              src={item.imageSrc}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Link
                            href={`/products/${item.id || 'm1'}`}
                            className="block font-bold text-stone-900 text-sm hover:text-[#E0A99E] transition-colors uppercase tracking-wide"
                          >
                            {item.name}
                          </Link>
                          <span className="block text-[11px] text-stone-400 font-light">
                            Size: <strong className="font-semibold text-stone-700">{item.size}</strong> &middot; Color: <strong className="font-semibold text-stone-700">{item.color}</strong> &middot; Qty: <strong className="font-semibold text-stone-700">{item.quantity}</strong>
                          </span>
                          <span className="block text-xs font-bold text-stone-850">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Delivery Status Timeline */}
                      <div className="w-full md:w-1/3 space-y-1">
                        <span className="text-[11px] text-stone-400 font-light uppercase tracking-wider block">
                          Fulfillment Tracking
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                          <span className={`text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="block text-[10px] text-stone-400 font-light">
                          Estimated delivery within 3-5 business days.
                        </span>
                      </div>

                      {/* Right: Quick Actions */}
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleReorder(order)}
                          className="w-full md:w-36 rounded-full bg-stone-900 hover:bg-stone-850 text-white py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Buy it again
                        </button>
                        <button
                          onClick={() => downloadInvoice(order)}
                          className="w-full md:w-36 rounded-full border border-stone-200 hover:border-stone-450 text-stone-700 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Invoice Receipt
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 3. Action Toolbar Section */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-stone-150 pt-4 mt-6 gap-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/orders/${order.orderId}`}
                        className="text-[#C68B7D] hover:text-[#B87265] text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        View Order Details →
                      </Link>
                      <button
                        onClick={() => setActiveTrackingOrderId((prev) => (prev === order.orderId ? null : order.orderId))}
                        className="text-stone-500 hover:text-stone-900 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {isTracking ? "Hide Tracker ↑" : "Track Shipment ↓"}
                      </button>
                    </div>

                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  {/* 4. Tracking Progress Panel */}
                  {isTracking && (
                    <div className="mt-6 border-t border-stone-100 pt-6 animate-fade-in">
                      <div className="bg-stone-50 rounded-xl p-6 border border-stone-200/50">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#E0A99E] mb-6 text-center">
                          Visual Delivery Timeline Tracker
                        </span>
                        <OrderTimeline status={order.status} />
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
