"use client";

import React, { useEffect, useState } from "react";
import RecommendationCarousel from "./RecommendationCarousel";
import { getSimilarProducts } from "@/services/RecommendationService";
import { AdminProduct } from "@/services/AdminService";

interface SimilarProductsProps {
  productId: string;
}

export default function SimilarProducts({ productId }: SimilarProductsProps) {
  const [similarList, setSimilarList] = useState<AdminProduct[]>([]);

  useEffect(() => {
    const loadSimilar = async () => {
      const list = await getSimilarProducts(productId);
      setSimilarList(list);
    };
    loadSimilar();
  }, [productId]);

  if (similarList.length === 0) return null;

  return (
    <RecommendationCarousel
      title="Similar Products"
      subtitle="Alternative options selected for you"
      products={similarList}
    />
  );
}
