"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface WishlistItemType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  reviewCount?: number;
  category: string;
  brand?: string;
  description?: string;
}

export interface WishlistToastType {
  id: string;
  message: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItemType[];
  wishlistCount: number;
  addToWishlist: (product: WishlistItemType) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  toasts: WishlistToastType[];
  removeToast: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

/**
 * WishlistProvider Component
 *
 * Global React context coordinator maintaining wishlist items in client memory.
 * Syncs details dynamically to localStorage and manages global visual toast notifications.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [toasts, setToasts] = useState<WishlistToastType[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const toastIdRef = useRef(0);

  // 1. Safe hydration mount loader from localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const stored = localStorage.getItem("certitude_wishlist");
        if (stored) {
          setWishlistItems(JSON.parse(stored));
        }
      } catch (err) {
        console.error("[WishlistContext] Failed loading wishlist from localStorage:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadWishlist();
  }, []);

  // 2. Persist state edits to storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("certitude_wishlist", JSON.stringify(wishlistItems));
    } catch (err) {
      console.error("[WishlistContext] Failed syncing wishlist to localStorage:", err);
    }
  }, [wishlistItems, isInitialized]);

  // Toast Manager helpers
  const addToast = (message: string) => {
    toastIdRef.current += 1;
    const id = `wishlist-toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 2500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Wishlist actions
  const addToWishlist = (product: WishlistItemType) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev; // Prevent duplicate entries
      return [...prev, product];
    });
    addToast("Added to Wishlist.");
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    addToast("Removed from Wishlist.");
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        toasts,
        removeToast,
      }}
    >
      {children}

      {/* Floating Success Toasts stack */}
      <div className="fixed bottom-5 left-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur-md animate-slide-in pointer-events-auto text-left"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E0A99E]/10 text-[#C68B7D]">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
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
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
