import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Exclusive Offers & Sale",
  "Shop premium sustainable designer items at exclusive prices.",
  "/sale"
);

export default function SalePage() {
  return (
    <CollectionTemplate
      title="Exclusive Offers"
      description="Premium Style at Exceptional Values"
      imageSrc="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="Sale"
    />
  );
}
