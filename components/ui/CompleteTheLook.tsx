"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils";
import { useCart } from "@/context/CartContext";
import { getCompleteTheLook } from "@/services/RecommendationService";
import { AdminProduct } from "@/services/AdminService";

interface CompleteTheLookProps {
  productId: string;
}

export default function CompleteTheLook({ productId }: CompleteTheLookProps) {
  const { addToCart } = useCart();
  const [styleDetails, setStyleDetails] = useState<{
    accessories: AdminProduct[];
    subtitle: string;
  } | null>(null);

  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const loadLook = async () => {
      const data = await getCompleteTheLook(productId);
      setStyleDetails(data);
    };
    lookUpdateListener(); // Load initially
    
    function lookUpdateListener() {
      loadLook();
    }
  }, [productId]);

  const handleQuickAdd = (p: AdminProduct) => {
    setAddingId(p.id);
    setTimeout(() => {
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
        "Beige"
      );
      setAddingId(null);
    }, 600);
  };

  if (!styleDetails || styleDetails.accessories.length === 0) return null;

  return (
    <div className="w-full text-left py-12 border-t border-stone-200/50">
      <div>
        <h3 className="text-lg font-black tracking-widest text-stone-900 uppercase">
          Complete The Look
        </h3>
        <p className="mt-1 text-[10px] text-[#E0A99E] font-extrabold uppercase tracking-widest">
          Styling Recommendations: {styleDetails.subtitle}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {styleDetails.accessories.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200/60 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Clickable Image & Details */}
            <Link href={`/products/${item.id}`} className="relative h-20 w-16 overflow-hidden rounded-xl bg-stone-50 border border-stone-100 flex-shrink-0">
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            <div className="flex-grow min-w-0">
              <span className="text-[9px] font-bold text-[#E0A99E] uppercase tracking-widest block truncate">
                {item.brand}
              </span>
              <Link
                href={`/products/${item.id}`}
                className="text-xs font-bold text-stone-850 truncate hover:text-[#C68B7D] transition-colors leading-tight mt-0.5 block"
              >
                {item.name}
              </Link>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xs font-black text-stone-900">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => handleQuickAdd(item)}
              disabled={addingId !== null}
              className="flex-shrink-0 h-8 w-8 rounded-full border border-stone-250 bg-stone-50 hover:bg-stone-900 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shadow-sm"
              title="Quick add item to cart"
            >
              {addingId === item.id ? "…" : "+"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
