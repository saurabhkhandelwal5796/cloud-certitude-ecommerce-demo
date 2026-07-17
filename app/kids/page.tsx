import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Kids Sustainable Collection",
  "Explore kids organic cotton rompers, fleece jackets and knit canvas sneakers.",
  "/kids"
);

const PRODUCTS = [
  {
    id: "k1",
    name: "Kids Cotton Knit Romper Set",
    price: 85,
    discountPercent: 10,
    rating: 4.7,
    category: "Kids",
    brand: "EcoKnit",
    color: "Beige",
    size: ["S", "M"],
    description: "An incredibly soft, organic cotton pointelle knit romper set complete with matching booties.",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k2",
    name: "Kids Organic Fleece Jacket",
    price: 98,
    rating: 4.6,
    category: "Kids",
    brand: "EcoKnit",
    color: "Olive",
    size: ["S", "M", "L"],
    description: "Warm, insulating zip fleece jacket made entirely from recycled post-consumer polyester fibers.",
    imageSrc: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k3",
    name: "Kids Knit Canvas Sneakers",
    price: 65,
    discountPercent: 15,
    rating: 4.4,
    category: "Kids",
    brand: "Modern Classic",
    color: "White",
    size: ["S", "M"],
    description: "Flexible, breathable canvas low-tops featuring convenient hook-and-loop velcro straps.",
    imageSrc: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k4",
    name: "Kids Organic Cotton Dungarees",
    price: 75,
    rating: 4.8,
    category: "Kids",
    brand: "EcoKnit",
    color: "Cream",
    size: ["S", "M", "L"],
    description: "Charming adjustable denim-style overall dungarees made from ultra-soft washed organic cotton slub.",
    imageSrc: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k5",
    name: "Kids Striped Cotton Tee",
    price: 32,
    discountPercent: 5,
    rating: 4.3,
    category: "Kids",
    brand: "Modern Classic",
    color: "Cream",
    size: ["S", "M", "L"],
    description: "Classic crewneck tee in soft cotton jersey featuring timeless yarn-dyed horizontal navy stripes.",
    imageSrc: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k6",
    name: "Kids French Terry Hoodie",
    price: 58,
    rating: 4.5,
    category: "Kids",
    brand: "Certitude",
    color: "Charcoal",
    size: ["S", "M", "L"],
    description: "Thick, loopback French terry zip hoodie featuring flatlock seams to prevent chafing during active play.",
    imageSrc: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k7",
    name: "Kids Linen Summer Sun Hat",
    price: 28,
    rating: 4.2,
    category: "Kids",
    brand: "Atelier",
    color: "Beige",
    size: ["S", "M"],
    description: "Wide-brimmed linen sun hat designed with safe chin-strap ties and UPF 50+ UV protection filters.",
    imageSrc: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k8",
    name: "Kids Warm Ribbed Leggings",
    price: 24,
    discountPercent: 20,
    rating: 4.6,
    category: "Kids",
    brand: "EcoKnit",
    color: "Blush",
    size: ["S", "M", "L"],
    description: "Stretchy organic rib-knit leggings with a soft elasticated comfort waistband, perfect for layering.",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k9",
    name: "Kids Quilted Lightweight Vest",
    price: 68,
    rating: 4.5,
    category: "Kids",
    brand: "Certitude",
    color: "Olive",
    size: ["S", "M", "L"],
    description: "Water-repellent diamond quilted zip vest with light synthetic down fill, ideal for transitional weather.",
    imageSrc: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k10",
    name: "Kids Wool Knitted Beanie",
    price: 30,
    rating: 4.7,
    category: "Kids",
    brand: "EcoKnit",
    color: "Charcoal",
    size: ["S", "M"],
    description: "Chunky rib-knit cuff beanie made from extra-soft merino wool that doesn't scratch or itch.",
    imageSrc: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k11",
    name: "Kids Denim Utility Jacket",
    price: 88,
    discountPercent: 10,
    rating: 4.8,
    category: "Kids",
    brand: "Modern Classic",
    color: "Charcoal",
    size: ["S", "M", "L"],
    description: "Classic button-front trucker jacket in durable faded washed cotton denim with authentic hardware.",
    imageSrc: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k12",
    name: "Kids Cotton Pajama Set",
    price: 45,
    rating: 4.9,
    category: "Kids",
    brand: "EcoKnit",
    color: "Blush",
    size: ["S", "M", "L"],
    description: "Two-piece cozy pajama set featuring flat seams and breathable waffle-knit organic cotton structures.",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
  },
];

export default function KidsPage() {
  return (
    <CollectionTemplate
      title="Kids' Collection"
      description="Comfort Meets Playfulness"
      imageSrc="https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200&auto=format&fit=crop"
      initialProducts={PRODUCTS}
    />
  );
}
