import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Accessories Collection",
  "Shop premium sustainable organic cotton scarves, bags, and designer watches.",
  "/collections/accessories"
);

export default function AccessoriesPage() {
  return (
    <CollectionTemplate
      title="Accessories"
      description="Elevate your style with premium, sustainable additions"
      imageSrc="https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="Accessories"
    />
  );
}
