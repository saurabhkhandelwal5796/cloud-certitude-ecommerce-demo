"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ui/ProductCard";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true);

        if (error) {
          console.error("Error fetching products:", error);
          setProducts([]);
          return;
        }

        const q = query.toLowerCase();
        const filtered = (data || []).filter((product: any) => {
          const nameMatch = product.name?.toLowerCase().includes(q);
          const brandMatch = product.brand?.toLowerCase().includes(q);
          const categoryMatch = product.category?.toLowerCase().includes(q);
          const descMatch = product.description?.toLowerCase().includes(q);
          const skuMatch = product.sku?.toLowerCase().includes(q);
          const tagsMatch = Array.isArray(product.tags) && product.tags.some((t: string) => t.toLowerCase().includes(q));
          return nameMatch || brandMatch || categoryMatch || descMatch || skuMatch || tagsMatch;
        }).slice(0, 20);

        setProducts(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl font-bold tracking-tight text-stone-900 mb-8">
        Search Results for &quot;{query}&quot;
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-stone-500 animate-pulse">Searching...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageSrc={
                product.image_src ||
                product.imageSrc ||
                (Array.isArray(product.images) && product.images[0]) ||
                ""
              }
              discountPercent={product.discount_percent || product.discountPercent}
              rating={product.rating || 4.5}
              reviewCount={product.review_count || product.reviewCount || 0}
              category={product.category}
              brand={product.brand}
              description={product.description}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-stone-200 rounded-3xl bg-white/50">
          <p className="text-stone-500">No products found.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <p className="text-stone-500">Searching...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
