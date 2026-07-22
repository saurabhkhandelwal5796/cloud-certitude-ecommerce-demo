"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ShippingForm, { AddressType } from "@/components/ui/ShippingForm";
import DeliveryOptions, { DELIVERY_OPTIONS } from "@/components/ui/DeliveryOptions";
import PaymentSelector from "@/components/ui/PaymentSelector";
import OrderSummary from "@/components/ui/OrderSummary";
import RazorpayButton from "@/components/ui/RazorpayButton";
import PaymentFailure from "@/components/ui/PaymentFailure";
import PaymentSuccess from "@/components/ui/PaymentSuccess";
import { isValidEmail } from "@/utils";
import {
  generateOrderId,
  buildOrderPayload,
} from "@/services/PaymentService";
import { registerNewCheckoutOrder } from "@/services/AdminService";
import { getSupabaseClient } from "@/lib/supabase/client";
import { calculateOrderTotals } from "@/services/PricingService";

const DEFAULT_ADDRESS: AddressType = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

/**
 * CheckoutPage Component
 *
 * Coordinates shipping forms, delivery selections, payment methods, and promo calculations.
 * Validates fields on submit, then:
 *   - For online payments (Credit, Debit, UPI, Net Banking), triggers the simulated premium payment gateway modal.
 *   - For Cash on Delivery (COD), skips processing and places the order immediately.
 * Stores the order in localStorage and redirects to /order-confirmation on success.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  // ─── Promo values passed from Cart (read-only) ────────────────────────────
  const discountPercent = Number(searchParams.get("dp") ?? 0);
  const promoApplied = discountPercent > 0;

  // ─── State ────────────────────────────────────────────────────────────────
  const [address, setAddress] = useState<AddressType>(DEFAULT_ADDRESS);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [errors, setErrors] = useState<Partial<Record<keyof AddressType, string>>>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Canonical authenticated user email — used as the order owner identifier
  const [authUserEmail, setAuthUserEmail] = useState<string>("");
  const [authUserName, setAuthUserName] = useState<string>("");

  // ─── Load persisted checkout settings + authenticated user ───────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 1. Fetch authenticated user from Supabase — email is the canonical order owner
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.email) {
          setAuthUserEmail(user.email);
          console.log("[Checkout] Authenticated user email:", user.email);

          // Derive display name from user metadata or email
          const rawMeta = user.user_metadata as Record<string, string> | undefined;
          const displayName =
            rawMeta?.full_name ||
            rawMeta?.name ||
            user.email.split("@")[0];
          setAuthUserName(displayName);

          // Pre-fill shipping form email with the auth user email if not already set
          const storedAddr = localStorage.getItem("certitude_shipping_address");
          if (storedAddr) {
            const parsed = JSON.parse(storedAddr) as AddressType;
            // Always overwrite the email field with the auth email
            setAddress((prev) => ({ ...parsed, email: user.email ?? prev.email }));
          } else {
            setAddress((prev) => ({ ...prev, email: user.email ?? prev.email }));
          }
        } else {
          // Guest — load shipping address as-is
          const storedAddr = localStorage.getItem("certitude_shipping_address");
          if (storedAddr) setAddress(JSON.parse(storedAddr));
        }

        const storedDel = localStorage.getItem("certitude_delivery_option");
        if (storedDel) setSelectedDelivery(storedDel);

        const storedPay = localStorage.getItem("certitude_payment_selection");
        if (storedPay) {
          const parsedPay = storedPay;
          // Ensure we don't restore deprecated "razorpay" payment method
          if (parsedPay === "razorpay") {
            setSelectedPayment("credit");
          } else {
            setSelectedPayment(parsedPay);
          }
        }
        // Note: promo is read from URL params (passed by Cart), not localStorage
      } catch (err) {
        console.error("[Checkout] Failed loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const deliveryFee = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery)?.price || 0;
  const discountAmount = cartSubtotal * (discountPercent / 100);

  const {
    subtotal,
    shipping,
    tax,
    grandTotal
  } = calculateOrderTotals(
    cartSubtotal,
    deliveryFee,
    discountAmount
  );

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof AddressType, string>> = {};

    if (!address.firstName.trim()) errs.firstName = "First name is required.";
    if (!address.lastName.trim()) errs.lastName = "Last name is required.";

    if (!address.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!isValidEmail(address.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (!address.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (address.phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Please enter a valid 10-digit phone number.";
    }

    if (!address.addressLine1.trim()) errs.addressLine1 = "Address Line 1 is required.";
    if (!address.city.trim()) errs.city = "City is required.";
    if (!address.state.trim()) errs.state = "State is required.";
    if (!address.country.trim()) errs.country = "Country is required.";

    if (!address.postalCode.trim()) {
      errs.postalCode = "Postal code is required.";
    } else if (address.postalCode.trim().length < 5) {
      errs.postalCode = "Please enter a valid postal code.";
    }

    setErrors(errs);
    const isValid = Object.keys(errs).length === 0;
    if (!isValid) {
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
    return isValid;
  };

  /**
   * Finalises the order: saves to localStorage, clears cart, redirects.
   * Called by both the payment success handler and the simulated COD path.
   */
  const finaliseOrder = (orderId: string, transactionId?: string, paymentTimestamp?: string) => {
    const payload = buildOrderPayload({
      orderId,
      transactionId,
      paymentTimestamp,
      cartItems,
      address,
      deliveryOption: selectedDelivery,
      deliveryFee,
      selectedPayment,
      discountPercent,
    });

    localStorage.setItem("certitude_last_order", JSON.stringify(payload));

    // ─── CRITICAL: Use the authenticated user's email as the canonical order owner.
    // The address.email (shipping form) can be any email; only authUserEmail matches
    // what the /orders page queries by (user.email from Supabase session).
    const canonicalEmail = authUserEmail || address.email;
    const canonicalName =
      `${address.firstName} ${address.lastName}`.trim() || authUserName || canonicalEmail.split("@")[0];

    console.log("[Checkout] Persisting order:", {
      orderId,
      canonicalEmail,
      canonicalName,
      grandTotal: payload.totals.grandTotal,
      itemsCount: cartItems.length,
      paymentMethod: selectedPayment,
    });

    // Sync with Admin Dashboard + customer order history
    registerNewCheckoutOrder({
      orderId,
      customerName: canonicalName,
      customerEmail: canonicalEmail,
      total: payload.totals.grandTotal,
      itemsCount: cartItems.length,
      paymentMethod: selectedPayment,
      address,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        price: item.price,
        imageSrc: item.imageSrc,
        brand: item.brand,
        discountPercent: item.discountPercent,
      })),
      subtotal: payload.totals.subtotal,
      tax: payload.totals.tax,
      shipping: payload.totals.shipping,
      discount: payload.totals.discount,
      grand_total: payload.totals.grandTotal,
    });

    console.log("[Checkout] Order registered. Clearing cart and redirecting...");

    clearCart();

    setSuccessOrderId(orderId);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/order-confirmation");
    }, 1500);
  };

  // ─── Payment success / failure callbacks ─────────────────────────────────
  const handlePaymentSuccess = (details: { transactionId: string; orderId: string; timestamp: string }) => {
    setPaymentError(null);
    finaliseOrder(details.orderId, details.transactionId, details.timestamp);
  };

  const handlePaymentFailure = (error: string) => {
    setPaymentError(error);
  };

  // ─── Primary COD "Place Order" handler ───────────────────────────────────
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPaymentError(null);

    // Cash on Delivery - Skip payment processing and place order immediately
    setIsPlacing(true);

    setTimeout(() => {
      setIsPlacing(false);
      const orderId = generateOrderId();
      finaliseOrder(orderId);
    }, 1200);
  };

  // ─── Empty cart guard ─────────────────────────────────────────────────────
  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center">
        <h2 className="text-xl font-bold text-stone-850">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
          Please add items to your cart before proceeding to the checkout lanes.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#E0A99E] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800 relative">

      {/* ── Payment Success Overlay ────────────────────────────────────────── */}
      {isSuccess && <PaymentSuccess orderId={successOrderId} />}

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
          Checkout
        </h1>
        <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
          Provide your shipping details and select payment method to place order.
        </p>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left Column: Form Sections */}
        <div className="w-full lg:w-2/3 space-y-10">

          {/* Section 1: Shipping Address */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <ShippingForm address={address} setAddress={setAddress} errors={errors} />
          </div>

          {/* Section 2: Delivery Options */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <DeliveryOptions selectedOption={selectedDelivery} setSelectedOption={setSelectedDelivery} />
          </div>

          {/* Section 3: Payment Method Selector */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <PaymentSelector selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} />
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">

          {/* Summary (Read-Only) – values passed from Cart */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <OrderSummary
              deliveryFee={deliveryFee}
              discountPercent={discountPercent}
              promoApplied={promoApplied}
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Payment failure banner */}
            {paymentError && (
              <PaymentFailure
                message={paymentError}
                onDismiss={() => setPaymentError(null)}
              />
            )}

            {/* Simulated Payment Gateway Button for all online methods */}
            {selectedPayment !== "cod" ? (
              <RazorpayButton
                amountInRupees={grandTotal}
                customerName={`${address.firstName} ${address.lastName}`.trim()}
                customerEmail={address.email}
                customerPhone={address.phone}
                beforePay={validateForm}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                disabled={isPlacing || isSuccess}
              />
            ) : (
              /* Place Order button (Cash on Delivery path) */
              <button
                type="submit"
                disabled={isPlacing || isSuccess}
                className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 transition-colors shadow-md h-12 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isPlacing ? "Processing Order..." : "Place Order"}
              </button>
            )}

            <Link
              href="/cart"
              className="flex w-full items-center justify-center rounded-full border border-stone-250 bg-white py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm h-12"
            >
              Back to Cart
            </Link>

            {/* Test mode notice */}
            {selectedPayment !== "cod" && (
              <p className="text-center text-[10px] text-stone-400 font-light leading-relaxed pt-1">
                🔒 Secured Simulated payment gateway · No real money charged
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
