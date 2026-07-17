"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ShippingForm, { AddressType } from "@/components/ui/ShippingForm";
import DeliveryOptions, { DELIVERY_OPTIONS } from "@/components/ui/DeliveryOptions";
import PaymentSelector from "@/components/ui/PaymentSelector";
import PromoCode from "@/components/ui/PromoCode";
import OrderSummary from "@/components/ui/OrderSummary";
import RazorpayButton from "@/components/ui/RazorpayButton";
import PaymentFailure from "@/components/ui/PaymentFailure";
import PaymentSuccess from "@/components/ui/PaymentSuccess";
import { isValidEmail } from "@/utils";
import {
  generateOrderId,
  buildOrderPayload,
} from "@/services/PaymentService";

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
 * Validates fields on submit, then either:
 *   - Opens the Razorpay modal (if Razorpay is selected)
 *   - Simulates payment (for all other payment methods — existing behaviour preserved)
 * Stores the order in localStorage and redirects to /order-confirmation on success.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, clearCart } = useCart();

  // ─── State ────────────────────────────────────────────────────────────────
  const [address, setAddress] = useState<AddressType>(DEFAULT_ADDRESS);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof AddressType, string>>>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");

  // Razorpay-specific state
  const [showRazorpayButton, setShowRazorpayButton] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ─── Load persisted checkout settings ────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedAddr = localStorage.getItem("certitude_shipping_address");
        if (storedAddr) setAddress(JSON.parse(storedAddr));

        const storedDel = localStorage.getItem("certitude_delivery_option");
        if (storedDel) setSelectedDelivery(storedDel);

        const storedPay = localStorage.getItem("certitude_payment_selection");
        if (storedPay) setSelectedPayment(storedPay);

        const storedPromo = localStorage.getItem("certitude_applied_promo");
        if (storedPromo) {
          const parsed = JSON.parse(storedPromo);
          setDiscountPercent(parsed.discountPercent);
          setPromoApplied(true);
          setAppliedCode(parsed.appliedCode);
        }
      } catch (err) {
        console.error("[Checkout] Failed loading settings from localStorage:", err);
      }
    };
    loadSettings();
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const deliveryFee = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery)?.price || 0;
  const tax = cartSubtotal * 0.08;
  const discountAmount = cartSubtotal * (discountPercent / 100);
  const grandTotal = cartSubtotal + tax + deliveryFee - discountAmount;

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
    return Object.keys(errs).length === 0;
  };

  /**
   * Finalises the order: saves to localStorage, clears cart, redirects.
   * Called by both the Razorpay success handler and the simulated payment path.
   */
  const finaliseOrder = (orderId: string, razorpayPaymentId?: string) => {
    const payload = buildOrderPayload({
      orderId,
      cartItems,
      address,
      deliveryOption: selectedDelivery,
      deliveryFee,
      selectedPayment,
      discountPercent,
      razorpayPaymentId,
    });

    localStorage.setItem("certitude_last_order", JSON.stringify(payload));
    clearCart();

    setSuccessOrderId(orderId);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/order-confirmation");
    }, 1500);
  };

  // ─── Razorpay success / failure callbacks ─────────────────────────────────
  const handleRazorpaySuccess = (paymentId: string) => {
    setShowRazorpayButton(false);
    setPaymentError(null);
    const orderId = generateOrderId();
    finaliseOrder(orderId, paymentId);
  };

  const handleRazorpayFailure = (error: string) => {
    setShowRazorpayButton(false);
    setPaymentError(error);
  };

  // ─── Primary "Place Order" handler ───────────────────────────────────────
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setPaymentError(null);

    // ── Razorpay path ──────────────────────────────────────────────────────
    if (selectedPayment === "razorpay") {
      // Show the RazorpayButton and trigger it programmatically via state
      setShowRazorpayButton(true);
      return;
    }

    // ── Legacy simulation path (all other payment methods) ─────────────────
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

          {/* Summary + Promo */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <OrderSummary
              deliveryFee={deliveryFee}
              discountPercent={discountPercent}
              promoApplied={promoApplied}
            />

            <hr className="border-stone-105 my-6" />

            <PromoCode
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
              promoApplied={promoApplied}
              setPromoApplied={setPromoApplied}
              appliedCode={appliedCode}
              setAppliedCode={setAppliedCode}
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

            {/* Razorpay payment button — shown after form validation passes */}
            {showRazorpayButton && selectedPayment === "razorpay" ? (
              <RazorpayButton
                amountInRupees={grandTotal}
                customerName={`${address.firstName} ${address.lastName}`.trim()}
                customerEmail={address.email}
                customerPhone={address.phone}
                onSuccess={handleRazorpaySuccess}
                onFailure={handleRazorpayFailure}
              />
            ) : (
              /* Standard Place Order button (all non-Razorpay methods + pre-validation) */
              <button
                type="submit"
                disabled={isPlacing || isSuccess}
                className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 transition-colors shadow-md h-12 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isPlacing
                  ? "Processing..."
                  : selectedPayment === "razorpay"
                  ? "Continue to Payment"
                  : "Place Order"}
              </button>
            )}

            <Link
              href="/cart"
              className="flex w-full items-center justify-center rounded-full border border-stone-250 bg-white py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm h-12"
            >
              Back to Cart
            </Link>

            {/* Razorpay test mode notice */}
            {selectedPayment === "razorpay" && (
              <p className="text-center text-[10px] text-stone-400 font-light leading-relaxed pt-1">
                🔒 Secured by Razorpay · TEST MODE · No real money charged
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
