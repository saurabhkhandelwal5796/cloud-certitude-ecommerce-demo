import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Women's Sustainable Collection",
  "Discover premium sustainable evening gowns, trench coats, sweaters and accessories for women.",
  "/women"
);

export default function WomenPage() {
  return (
    <CollectionTemplate
      title="Women's Collection"
      description="Fashion Designed to Inspire"
      imageSrc="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="Women"
    />
  );
}
