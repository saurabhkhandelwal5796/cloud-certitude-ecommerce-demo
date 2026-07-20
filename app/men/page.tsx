import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Men's Sustainable Collection",
  "Shop premium sustainable organic cotton coats, jackets, shirts and knitwear for men.",
  "/men"
);

export default function MenPage() {
  return (
    <CollectionTemplate
      title="Men's Collection"
      description="Modern Essentials for Every Occasion"
      imageSrc="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="Men"
    />
  );
}
