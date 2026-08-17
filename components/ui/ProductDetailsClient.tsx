"use client";

import React, { useState, useMemo, useCallback } from "react";
import ProductImageGallery from "@/components/ui/ProductImageGallery";
import DeliveryChecker from "@/components/ui/DeliveryChecker";
import ProductInfo from "@/components/ui/ProductInfo";
import type { AdminProduct } from "@/services/AdminService";
import type { VariantWithAttributes } from "@/services/VariantService";

interface Props {
  product: AdminProduct;
  variants: VariantWithAttributes[];
  productAttributes: Record<string, string>;
  initialVariantId?: string;
}

import SocialShare from "@/components/ui/SocialShare";

const EMPTY_IMAGES: string[] = [];

export default function ProductDetailsClient({ product, variants, productAttributes, initialVariantId }: Props) {
  // Find the initial/primary variant
  const initialVariant = useMemo(() => {
    if (initialVariantId) {
      return variants.find((v) => v.variant.id === initialVariantId) || null;
    }
    return variants.find((v) => v.variant.isPrimary) || variants[0] || null;
  }, [variants, initialVariantId]);

  // Resolve initial images list
  const initialImages = useMemo(() => {
    if (initialVariant && initialVariant.variant.images && initialVariant.variant.images.length > 0) {
      return initialVariant.variant.images;
    }
    return EMPTY_IMAGES;
  }, [initialVariant]);

  const [activeVariantImages, setActiveVariantImages] = useState<string[]>(initialImages);

  // Sync images state if initialImages changes
  React.useEffect(() => {
    setActiveVariantImages(initialImages);
  }, [initialImages]);

  // We can pass a callback to ProductInfo to notify when the active variant changes
  const handleVariantChange = useCallback((variant: VariantWithAttributes | null) => {
    if (variant && variant.variant.images && variant.variant.images.length > 0) {
      setActiveVariantImages(variant.variant.images);
    } else {
      setActiveVariantImages(EMPTY_IMAGES); // Enforce: No variant = no product image
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start">
      {/* Left Column */}
      <div className="w-full lg:w-1/2">
        <ProductImageGallery images={activeVariantImages} category={product.category} />
        {/* <DeliveryChecker productId={product.id} /> */}
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
          rating={product.rating || 0}
          reviewCount={product.reviewCount || 0}
          sku={product.sku || ""}
          description={product.description}
          variants={variants}
          productAttributes={productAttributes}
          initialVariantId={initialVariantId}
          onVariantChange={handleVariantChange}
        />

        {/* Social Sharing block */}
        <SocialShare
          url={`https://cloud-certitude-ecommerce-demo.vercel.app/products/${product.id}`}
          title={product.name}
        />
      </div>
    </div>
  );
}
