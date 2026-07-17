"use client";

import { useEffect } from "react";
import { trackProductView } from "@/services/RecommendationService";

interface ViewTrackerProps {
  productId: string;
}

export default function ViewTracker({ productId }: ViewTrackerProps) {
  useEffect(() => {
    trackProductView(productId);
  }, [productId]);

  return null;
}
