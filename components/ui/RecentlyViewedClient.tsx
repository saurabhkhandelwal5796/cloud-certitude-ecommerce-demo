"use client";

import React, { useEffect, useState } from "react";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import { getProducts } from "@/services/AdminService";

// Match the ProductType interface from RecentlyViewed exactly
interface ProductType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating?: number;      // optional — no fake ratings
  reviewCount?: number;
  category: string;
  brand?: string;
  description?: string;
}

/**
 * RecentlyViewedClient
 *
 * Reads recently-viewed product IDs from localStorage (written by ViewTracker),
 * fetches matching products from Supabase, and renders the RecentlyViewed row.
 * Client-side only to avoid hydration mismatches.
 */
export default function RecentlyViewedClient() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem("certitude_viewed_ids");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (ids.length === 0) return;

        const all = await getProducts();
        const ordered: ProductType[] = ids
          .map((id) => all.find((p) => p.id === id))
          .filter((p): p is NonNullable<typeof p> => p !== undefined)
          .slice(0, 4)
          .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            imageSrc: p.imageSrc,
            discountPercent: p.discountPercent,
            rating: p.rating,           // real value or undefined — no fake
            reviewCount: p.reviewCount,
            category: p.category,
            brand: p.brand,
            description: p.description,
          }));

        setProducts(ordered);
      } catch {
        // Non-critical — silently skip
      }
    };
    load();
  }, []);

  if (products.length === 0) return null;

  return <RecentlyViewed products={products} />;
}
