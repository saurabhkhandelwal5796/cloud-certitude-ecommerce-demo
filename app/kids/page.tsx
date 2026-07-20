import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Kids' Organic Cotton Collection",
  "Shop soft, organic, durable rompers, hoodies, pants and knitwear for kids.",
  "/kids"
);

export default function KidsPage() {
  return (
    <CollectionTemplate
      title="Kids' Collection"
      description="Playful Comfort for Little Ones"
      imageSrc="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop"
      categoryFilter="Kids"
    />
  );
}
