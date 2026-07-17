import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Men's Sustainable Collection",
  "Shop premium sustainable organic cotton coats, jackets, shirts and knitwear for men.",
  "/men"
);

const PRODUCTS = [
  {
    id: "m1",
    name: "Classic Cashmere Trench Coat",
    price: 499,
    discountPercent: 15,
    rating: 4.8,
    category: "Men",
    brand: "Certitude",
    color: "Beige",
    size: ["M", "L", "XL"],
    description: "Premium double-breasted coat made with pure organic cashmere and structured shoulders for an elegant silhouette.",
    imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m2",
    name: "Minimalist Linen Utility Shirt",
    price: 120,
    rating: 4.5,
    category: "Men",
    brand: "Atelier",
    color: "Cream",
    size: ["S", "M", "L"],
    description: "A breathable, lightweight utility shirt crafted from 100% fine French flax linen, featuring double patch pockets.",
    imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m3",
    name: "Suede Handcrafted Chelsea Boots",
    price: 280,
    discountPercent: 20,
    rating: 4.6,
    category: "Men",
    brand: "Modern Classic",
    color: "Beige",
    size: ["M", "L"],
    description: "Artisan-crafted Italian suede boots with comfortable elastic side panels and durable Goodyear-welted soles.",
    imageSrc: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m4",
    name: "Slim Fit Wool Tuxedo Jacket",
    price: 520,
    rating: 4.9,
    category: "Men",
    brand: "Certitude",
    color: "Charcoal",
    size: ["M", "L", "XL", "XXL"],
    description: "Impeccably tailored tuxedo jacket featuring premium Italian virgin wool with elegant satin peak lapels.",
    imageSrc: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m5",
    name: "Organic Cotton Ribbed Sweater",
    price: 150,
    rating: 4.7,
    category: "Men",
    brand: "EcoKnit",
    color: "Olive",
    size: ["S", "M", "L", "XL"],
    description: "Warm and structured mock neck sweater knit from certified extra-long staple organic cotton yarn.",
    imageSrc: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m6",
    name: "Premium Raw Indigo Denim",
    price: 180,
    discountPercent: 10,
    rating: 4.4,
    category: "Men",
    brand: "Modern Classic",
    color: "Charcoal",
    size: ["S", "M", "L"],
    description: "Selvedge denim jeans cut in a clean slim-straight fit that will break in beautifully over time.",
    imageSrc: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m7",
    name: "Luxury Silk Knit Polo",
    price: 195,
    rating: 4.8,
    category: "Men",
    brand: "Atelier",
    color: "Cream",
    size: ["M", "L", "XL"],
    description: "Sophisticated short sleeve knit polo spun from a premium mulberry silk and long-staple cotton blend.",
    imageSrc: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m8",
    name: "Vintage Canvas Field Jacket",
    price: 320,
    discountPercent: 30,
    rating: 4.3,
    category: "Men",
    brand: "EcoKnit",
    color: "Olive",
    size: ["M", "L", "XL"],
    description: "Heavyweight weather-resistant washed cotton canvas utility jacket with functional multi-pocket detailing.",
    imageSrc: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m9",
    name: "Italian Leather Duffle Bag",
    price: 450,
    rating: 4.9,
    category: "Men",
    brand: "Atelier",
    color: "Charcoal",
    size: ["M"],
    description: "Spacious weekend travel bag constructed in Florence from thick full-grain vegetable tanned leather.",
    imageSrc: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m10",
    name: "Classic Chronograph Watch",
    price: 350,
    rating: 4.6,
    category: "Men",
    brand: "Certitude",
    color: "White",
    size: ["M", "L"],
    description: "Timeless chronograph wristwatch featuring a matte white dial, Swiss movement, and black leather strap.",
    imageSrc: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m11",
    name: "Tailored Linen Drawstring Trousers",
    price: 140,
    discountPercent: 15,
    rating: 4.5,
    category: "Men",
    brand: "Atelier",
    color: "Beige",
    size: ["S", "M", "L", "XL"],
    description: "Relaxed yet tailored summer trousers featuring an elastic waistband and drawstring details.",
    imageSrc: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m12",
    name: "Merino Wool Knit Scarf",
    price: 85,
    rating: 4.7,
    category: "Men",
    brand: "EcoKnit",
    color: "Blush",
    size: ["S", "M"],
    description: "Extremely soft rib-knit scarf spun from 100% fine extra-fine merino wool, ideal for colder seasons.",
    imageSrc: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop",
  },
];

export default function MenPage() {
  return (
    <CollectionTemplate
      title="Men's Collection"
      description="Modern Essentials for Every Occasion"
      imageSrc="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1200&auto=format&fit=crop"
      initialProducts={PRODUCTS}
    />
  );
}
