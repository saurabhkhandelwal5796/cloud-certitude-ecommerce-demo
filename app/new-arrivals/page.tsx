import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "New Arrivals",
  "Discover the latest premium fashion additions freshly cataloged.",
  "/new-arrivals"
);

export default function NewArrivalsPage() {
  return (
    <CollectionTemplate
      title="New Arrivals"
      description="Freshly Cataloged Luxury Essentials"
      imageSrc="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="New Arrival"
    />
  );
}
