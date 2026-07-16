"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { WishlistItemType } from "@/context/WishlistContext";

interface MoveToCartButtonProps {
  item: WishlistItemType;
}

/**
 * MoveToCartButton Component
 *
 * Adds the wishlist item to the cart (Size: M, Color: Beige, Qty: 1),
 * removes it from the wishlist, and triggers "Moved to Cart." toast via the cart context.
 */
export default function MoveToCartButton({ item }: MoveToCartButtonProps) {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();

  const handleMoveToCart = () => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        imageSrc: item.imageSrc,
        discountPercent: item.discountPercent,
        brand: item.brand,
      },
      1,
      "M",
      "Beige"
    );
    removeFromWishlist(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleMoveToCart}
      className="flex-1 rounded-full bg-[#E0A99E] py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer h-9 flex items-center justify-center"
    >
      Move to Cart
    </button>
  );
}
