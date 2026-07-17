"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { useCart } from "@/context/CartContext";
import { getFrequentlyBoughtTogether } from "@/services/RecommendationService";
import { AdminProduct } from "@/services/AdminService";

interface FrequentlyBoughtTogetherProps {
  productId: string;
}

export default function FrequentlyBoughtTogether({ productId }: FrequentlyBoughtTogetherProps) {
  const { addToCart } = useCart();
  const [bundle, setBundle] = useState<{
    mainProduct: AdminProduct;
    bundleProducts: AdminProduct[];
    totalPrice: number;
    discountedPrice: number;
  } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const loadBundle = async () => {
      try {
        const data = await getFrequentlyBoughtTogether(productId);
        setBundle(data);
      } catch (err) {
        console.error("Frequently Bought Together bundle failed:", err);
      }
    };
    loadBundle();
  }, [productId]);

  const handleAddBundle = () => {
    if (!bundle) return;
    setIsAdding(true);
    
    // Add all three items to cart
    setTimeout(() => {
      // 1. Main product
      addToCart(
        {
          id: bundle.mainProduct.id,
          name: bundle.mainProduct.name,
          price: bundle.mainProduct.price,
          imageSrc: bundle.mainProduct.imageSrc,
          discountPercent: bundle.mainProduct.discountPercent,
          brand: bundle.mainProduct.brand,
        },
        1,
        "M",
        "Beige"
      );

      // 2. Companion products
      bundle.bundleProducts.forEach((p) => {
        addToCart(
          {
            id: p.id,
            name: p.name,
            price: p.price,
            imageSrc: p.imageSrc,
            discountPercent: p.discountPercent,
            brand: p.brand,
          },
          1,
          "M",
          "Black"
        );
      });

      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 800);
  };

  if (!bundle) return null;

  const allItems = [bundle.mainProduct, ...bundle.bundleProducts];

  return (
    <div className="w-full text-left py-12 border-t border-stone-200/50">
      <div>
        <h3 className="text-lg font-black tracking-widest text-stone-900 uppercase">
          Frequently Bought Together
        </h3>
        <p className="mt-1 text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest">
          Complete the look and save 15% on this exclusive bundle
        </p>
      </div>

      <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-8 p-6 sm:p-8 rounded-3xl border border-stone-250 bg-white/70 backdrop-blur-sm shadow-sm">
        {/* Images Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {allItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {/* Product Thumbnail */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-20 w-16 overflow-hidden rounded-xl border border-stone-150 shadow-sm bg-stone-50">
                  <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-stone-850 truncate max-w-[80px] block text-center">
                  {item.name}
                </span>
                <span className="text-[9px] font-black text-stone-900 block text-center">
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* Plus sign */}
              {idx < allItems.length - 1 && (
                <span className="text-xl font-light text-stone-300 -mt-8">+</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="text-center lg:text-right space-y-4 min-w-[200px] border-t border-stone-100 lg:border-t-0 pt-6 lg:pt-0 w-full lg:w-auto">
          <div className="space-y-1">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Bundle Total
            </span>
            <div className="flex items-baseline justify-center lg:justify-end gap-2.5">
              <span className="text-2xl font-black text-stone-900">
                {formatPrice(bundle.discountedPrice)}
              </span>
              <span className="text-sm font-semibold text-stone-400 line-through">
                {formatPrice(bundle.totalPrice)}
              </span>
            </div>
            <span className="block text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">
              Save {formatPrice(bundle.totalPrice - bundle.discountedPrice)} (15% Off bundle pack)
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            disabled={isAdding || isAdded}
            className={`w-full lg:w-auto px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md h-11 flex items-center justify-center cursor-pointer disabled:opacity-75 ${
              isAdded ? "bg-emerald-600 hover:bg-emerald-700" : "bg-stone-900 hover:bg-stone-850"
            }`}
          >
            {isAdding ? "Adding Bundle..." : isAdded ? "Bundle Added! ✓" : "Add Bundle to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
