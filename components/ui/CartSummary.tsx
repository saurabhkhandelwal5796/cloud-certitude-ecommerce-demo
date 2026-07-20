"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils";
import { useCart } from "@/context/CartContext";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * CartSummary Component
 *
 * Renders the checkout calculation card for the Shopping Cart page.
 * Displays tax (8%), shipping fees, and grand totals with a Checkout CTA button.
 * Enforces guest sign-in checks and warnings.
 */
export default function CartSummary() {
  const router = useRouter();
  const { cartSubtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Est Tax is 8% of subtotal
  const tax = cartSubtotal * 0.08;
  
  // Shipping is free if subtotal is over $150, else $15 flat rate
  const shipping = cartSubtotal > 150 ? 0 : 15;

  // Promo code discounts
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();
    if (code === "ATELIER20" || code === "CERTITUDE20") {
      setDiscountPercent(20);
      setPromoApplied(true);
    } else {
      setPromoError("Invalid promo code. Try 'ATELIER20'!");
    }
  };

  const discountAmount = cartSubtotal * (discountPercent / 100);
  const grandTotal = cartSubtotal + tax + shipping - discountAmount;

  const handleCheckout = () => {
    if (isAuthenticated === false) {
      router.push("/signin?next=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/50 bg-white p-6 shadow-sm text-left space-y-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 border-b border-stone-105 pb-3">
        Order Summary
      </h3>

      {/* Pricing breakdown */}
      <div className="space-y-3.5 text-xs text-stone-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900">{formatPrice(cartSubtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Discount (Promo)</span>
            <span className="font-semibold">- {formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Estimated Tax (8%)</span>
          <span className="font-semibold text-stone-900">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping Cost</span>
          <span className="font-semibold text-stone-900">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-[10px] text-stone-400 font-light mt-0.5 leading-relaxed">
            Spend {formatPrice(150 - cartSubtotal)} more for free express shipping.
          </p>
        )}
      </div>

      <hr className="border-stone-105" />

      {/* Promocode form */}
      {!promoApplied ? (
        <form onSubmit={handleApplyPromo} className="space-y-2">
          <label htmlFor="promo" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Promo Code
          </label>
          <div className="flex gap-2">
            <input
              id="promo"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="e.g. ATELIER20"
              className="flex-1 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-850 cursor-pointer"
            >
              Apply
            </button>
          </div>
          {promoError && <p className="text-[10px] text-rose-500 font-medium">{promoError}</p>}
        </form>
      ) : (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 flex justify-between items-center">
          <div>
            <p className="font-bold">Promo Applied successfully</p>
            <p className="text-[10px] text-emerald-600 font-light">20% discount on order subtotal.</p>
          </div>
          <button
            onClick={() => {
              setPromoApplied(false);
              setDiscountPercent(0);
              setPromoCode("");
            }}
            className="text-[10px] underline hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      <hr className="border-stone-105" />

      {/* Grand Total */}
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-bold text-stone-800 uppercase tracking-wider">Grand Total</span>
        <span className="text-xl font-extrabold text-stone-900">{formatPrice(grandTotal)}</span>
      </div>

      {/* Checkout button */}
      <div className="space-y-3 pt-2">
        {isAuthenticated === false && (
          <div className="rounded-xl border border-amber-250 bg-amber-50 p-4 text-xs space-y-3">
            <p className="text-amber-800 font-medium leading-relaxed">
              Please sign in to continue with checkout.
            </p>
            <div className="flex gap-2">
              <Link
                href="/signin?next=/checkout"
                className="flex-grow rounded-full bg-stone-900 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white hover:bg-stone-850 transition-all cursor-pointer shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup?next=/checkout"
                className="flex-grow rounded-full border border-stone-250 bg-white py-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition-all cursor-pointer shadow-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={handleCheckout}
          className="w-full rounded-full bg-[#E0A99E] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 h-12 flex items-center justify-center cursor-pointer"
        >
          Proceed to Checkout
        </button>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-full border border-stone-250 bg-white py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm h-12"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
