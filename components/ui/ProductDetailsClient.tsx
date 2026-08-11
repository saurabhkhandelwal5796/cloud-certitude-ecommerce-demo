"use client";

import React, { useState, useMemo } from "react";
import ProductImageGallery from "@/components/ui/ProductImageGallery";
import DeliveryChecker from "@/components/ui/DeliveryChecker";
import ProductInfo from "@/components/ui/ProductInfo";
import type { AdminProduct } from "@/services/AdminService";
import type { VariantWithAttributes } from "@/services/VariantService";

interface Props {
  product: AdminProduct;
  variants: VariantWithAttributes[];
  productAttributes: Record<string, string>;
}

import SocialShare from "@/components/ui/SocialShare";

export default function ProductDetailsClient({ product, variants, productAttributes }: Props) {
  // We need to lift the variant selection state up if we want the left gallery to update
  // based on the right side's selection.
  
  const [activeVariantImages, setActiveVariantImages] = useState<string[]>(product.images);

  // We can pass a callback to ProductInfo to notify when the active variant changes
  const handleVariantChange = (variant: VariantWithAttributes | null) => {
    if (variant && variant.variant.images && variant.variant.images.length > 0) {
      setActiveVariantImages(variant.variant.images);
    } else {
      setActiveVariantImages(product.images); // fallback to product images
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start">
      {/* Left Column */}
      <div className="w-full lg:w-1/2">
        <ProductImageGallery images={activeVariantImages} category={product.category} />
        <DeliveryChecker productId={product.id} />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2">
        <ProductInfo
          id={product.id}
          name={product.name}
          brand={product.brand}
          price={product.price}
          imageSrc={product.imageSrc}
          discountPercent={product.discountPercent}
          rating={product.rating || 4.5}
          reviewCount={product.reviewCount || 0}
          sku={product.sku || ""}
          description={product.description}
          variants={variants}
          productAttributes={productAttributes}
          onVariantChange={handleVariantChange}
        />

        {/* Social Sharing block */}
        <SocialShare
          url={`https://cloudcertitudefashion.com/products/${product.id}`}
          title={product.name}
        />
      </div>
    </div>
  );
}
