"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  discountPercent?: number;
  brand?: string;
}

export interface ToastType {
  id: string;
  message: string;
}

interface CartContextType {
  cartItems: CartItemType[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Omit<CartItemType, "quantity" | "selectedSize" | "selectedColor">, quantity: number, size: string, color: string) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider Component
 *
 * Global React context coordinator maintaining shopping cart payloads in client memory.
 * Syncs details dynamically to localStorage and manages global visual toast notifications.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const toastIdRef = useRef(0);

  // 1. Safe hydration mount loader from localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = localStorage.getItem("certitude_cart");
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      } catch (err) {
        console.error("[CartContext] Failed loading cart from localStorage:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadCart();
  }, []);

  // 2. Persist state edits to storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("certitude_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("[CartContext] Failed syncing cart to localStorage:", err);
    }
  }, [cartItems, isInitialized]);

  // Toast Manager helpers
  const addToast = (message: string) => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 2500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart actions
  const addToCart = (
    product: Omit<CartItemType, "quantity" | "selectedSize" | "selectedColor">,
    quantity: number,
    size: string,
    color: string
  ) => {
    setCartItems((prev) => {
      // Find matching item by ID, selected size, AND selected color
      const existingIdx = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          selectedSize: size,
          selectedColor: color,
        },
      ];
    });

    addToast(`"${product.name}" added to cart.`);
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Computed metrics
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const discounted = item.discountPercent
      ? item.price * (1 - item.discountPercent / 100)
      : item.price;
    return acc + discounted * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toasts,
        removeToast,
      }}
    >
      {children}

      {/* Floating Success Toasts stack */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur-md animate-slide-in pointer-events-auto text-left"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-xs font-semibold text-stone-850">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer ml-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
