import React from "react";
import ProductCard from "./ProductCard";

interface ProductType {
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

interface RelatedProductsProps {
  products: ProductType[];
}

/**
 * RelatedProducts Component
 *
 * Renders a horizontal grid of 4 product cards matching the active item's category.
 */
export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="border-t border-stone-200/50 py-16">
      <h2 className="text-xl font-black text-stone-900 tracking-wider uppercase mb-10 text-left">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price}
            imageSrc={p.imageSrc}
            discountPercent={p.discountPercent}
            rating={p.rating}
            reviewCount={p.reviewCount}
            category={p.category}
            brand={p.brand}
            description={p.description}
          />
        ))}
      </div>
    </div>
  );
}
