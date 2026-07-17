import React from "react";
import CollectionTemplate from "@/components/ui/CollectionTemplate";
import { getMetadata } from "@/utils/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getMetadata(
  "Women's Sustainable Collection",
  "Discover premium sustainable evening gowns, trench coats, sweaters and accessories for women.",
  "/women"
);

const PRODUCTS = [
  {
    id: "w1",
    name: "Silk Cocktail Evening Gown",
    price: 650,
    discountPercent: 10,
    rating: 4.9,
    category: "Women",
    brand: "Certitude",
    color: "Blush",
    size: ["S", "M", "L"],
    description: "Exquisite floor-length evening gown crafted from heavy 100% mulberry silk satin with a delicate drape back.",
    imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w2",
    name: "Oversized Merino Wool Sweater",
    price: 195,
    rating: 4.7,
    category: "Women",
    brand: "EcoKnit",
    color: "Beige",
    size: ["XS", "S", "M", "L"],
    description: "Relaxed mock neck sweater chunky knit from responsibly sourced extra-fine Australian merino wool.",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w3",
    name: "Italian Leather Designer Handbag",
    price: 890,
    rating: 5.0,
    category: "Women",
    brand: "Atelier",
    color: "Charcoal",
    size: ["M"],
    description: "Iconic structured top-handle bag handcrafted in Milan from scratch-resistant pebbled calfskin.",
    imageSrc: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w4",
    name: "Classic Silk Square Scarf",
    price: 145,
    discountPercent: 20,
    rating: 4.8,
    category: "Women",
    brand: "Atelier",
    color: "Blush",
    size: ["S", "M"],
    description: "Lustrous 90x90cm twill silk scarf featuring hand-rolled edges and a unique heritage geometric print.",
    imageSrc: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w5",
    name: "Fine Knit Cashmere Cardigan",
    price: 260,
    rating: 4.6,
    category: "Women",
    brand: "EcoKnit",
    color: "Cream",
    size: ["XS", "S", "M", "L"],
    description: "Buttery-soft classic button-front cardigan spun from rare 2-ply grade-A Mongolian cashmere.",
    imageSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w6",
    name: "Pleated Linen A-Line Skirt",
    price: 160,
    discountPercent: 15,
    rating: 4.4,
    category: "Women",
    brand: "Modern Classic",
    color: "Beige",
    size: ["S", "M", "L"],
    description: "High-waisted linen midi skirt with crisp structured pleats and a matching fabric belt.",
    imageSrc: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w7",
    name: "Premium Linen Summer Dress",
    price: 210,
    rating: 4.7,
    category: "Women",
    brand: "Atelier",
    color: "White",
    size: ["XS", "S", "M", "L"],
    description: "An airy off-shoulder dress featuring soft smocked details and built-in linen lining.",
    imageSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w8",
    name: "Draped Crepe Blazer",
    price: 340,
    discountPercent: 10,
    rating: 4.6,
    category: "Women",
    brand: "Certitude",
    color: "Charcoal",
    size: ["S", "M", "L", "XL"],
    description: "Sleek open-front blazer tailored from premium Japanese crepe with a satin collar trim.",
    imageSrc: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w9",
    name: "Modern Pilot Gold Sunglasses",
    price: 220,
    rating: 4.8,
    category: "Women",
    brand: "Modern Classic",
    color: "Cream",
    size: ["M"],
    description: "Luxurious pilot sunglasses with gold-plated metal frames and impact-resistant polarized lenses.",
    imageSrc: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w10",
    name: "Suede Ankle Strap Heels",
    price: 240,
    rating: 4.5,
    category: "Women",
    brand: "Atelier",
    color: "Olive",
    size: ["S", "M", "L"],
    description: "Elegant evening sandals set on a comfortable block heel, finished in high-grade kid suede.",
    imageSrc: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w11",
    name: "Organic Utility Cotton Trousers",
    price: 135,
    discountPercent: 25,
    rating: 4.3,
    category: "Women",
    brand: "EcoKnit",
    color: "Olive",
    size: ["XS", "S", "M", "L"],
    description: "Relaxed high-rise trousers made from durable organic cotton twill with deep patch utility pockets.",
    imageSrc: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w12",
    name: "Wrap Wool Coat",
    price: 450,
    rating: 4.9,
    category: "Women",
    brand: "Certitude",
    color: "Charcoal",
    size: ["S", "M", "L"],
    description: "A tailored double-faced wrap coat crafted from pure thermal sheep's wool with side welt slits.",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  },
];

export default function WomenPage() {
  return (
    <CollectionTemplate
      title="Women's Collection"
      description="Fashion Designed to Inspire"
      imageSrc="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
      initialProducts={PRODUCTS}
    />
  );
}
