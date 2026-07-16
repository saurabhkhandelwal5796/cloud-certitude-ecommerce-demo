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
import { isValidEmail } from "@/utils";

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
 * Validates fields on submit, clears the cart, and redirects to the confirmation view.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();

  // State
  const [address, setAddress] = useState<AddressType>(DEFAULT_ADDRESS);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof AddressType, string>>>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Safe hydration mount loader from localStorage
  useEffect(() => {
    try {
      const storedAddr = localStorage.getItem("certitude_shipping_address");
      if (storedAddr) {
        setAddress(JSON.parse(storedAddr));
      }
      const storedDel = localStorage.getItem("certitude_delivery_option");
      if (storedDel) {
        setSelectedDelivery(storedDel);
      }
      const storedPay = localStorage.getItem("certitude_payment_selection");
      if (storedPay) {
        setSelectedPayment(storedPay);
      }
    } catch (err) {
      console.error("[Checkout] Failed loading settings from localStorage:", err);
    }
  }, []);

  // Compute active delivery fee
  const deliveryFee = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery)?.price || 0;

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to errors
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setIsPlacing(true);

    // Simulate order placement
    setTimeout(() => {
      setIsPlacing(false);
      setIsSuccess(true);

      // Generate order detail payload
      const orderId = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Calculate timeframe
      const deliveryOpt = DELIVERY_OPTIONS.find((o) => o.id === selectedDelivery);
      const deliveryDate = new Date();
      if (selectedDelivery === "sameday") {
        // Today
      } else if (selectedDelivery === "express") {
        deliveryDate.setDate(deliveryDate.getDate() + 2);
      } else {
        deliveryDate.setDate(deliveryDate.getDate() + 5);
      }

      const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      const orderPayload = {
        orderId,
        deliveryDate: selectedDelivery === "sameday" ? "Today by 9 PM" : formattedDeliveryDate,
        address,
        paymentMethod: selectedPayment,
        itemsCount: cartItems.length,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
        })),
        totals: {
          subtotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
          shipping: deliveryFee,
          discountPercent,
          grandTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.08) + deliveryFee - (cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) * (discountPercent / 100)),
        }
      };

      // Save order to localStorage so the confirmation page can display it
      localStorage.setItem("certitude_last_order", JSON.stringify(orderPayload));

      // Clear the global shopping bag
      clearCart();

      // Route to confirmation sheet
      setTimeout(() => {
        router.push("/order-confirmation");
      }, 1500);
    }, 1200);
  };

  // If cart is empty, redirect back to cart
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
      {/* Success Loading Screen */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6 scale-110 animate-bounce">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-stone-900 uppercase tracking-wide">
            Order Placed Successfully!
          </h2>
          <p className="mt-2 text-xs text-stone-500 font-light leading-relaxed">
            Redirecting to order confirmation page...
          </p>
        </div>
      )}

      {/* Title */}
      <div className="border-b border-stone-200/50 pb-6 mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-wider uppercase">
          Checkout
        </h1>
        <p className="mt-1.5 text-xs text-stone-400 font-light uppercase tracking-widest">
          Provide your shipping details and select payment method to place order.
        </p>
      </div>

      {/* Main Grid: Form Sections + Sidebar */}
      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Form Sheets (takes 2/3 of desktop width) */}
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

        {/* Right Column: Order Summary Sidebar (takes 1/3 of desktop width) */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">
          {/* Summary Details */}
          <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm">
            <OrderSummary
              deliveryFee={deliveryFee}
              discountPercent={discountPercent}
              promoApplied={promoApplied}
            />

            <hr className="border-stone-105 my-6" />

            {/* Promo Code section */}
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
            <button
              type="submit"
              disabled={isPlacing || isSuccess}
              className="w-full rounded-full bg-stone-900 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 transition-colors shadow-md h-12 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isPlacing ? "Processing..." : "Place Order"}
            </button>

            <Link
              href="/cart"
              className="flex w-full items-center justify-center rounded-full border border-stone-250 bg-white py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm h-12"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
