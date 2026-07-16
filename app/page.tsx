"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { verifySupabaseConfig } from "@/utils";
import CategoryCard from "@/components/ui/CategoryCard";
import ProductCard from "@/components/ui/ProductCard";
import TestimonialCard from "@/components/ui/TestimonialCard";

// Premium placeholder data for Categories
const CATEGORIES = [
  {
    title: "Women",
    href: "#women",
    imageSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Men",
    href: "#men",
    imageSrc: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Kids",
    href: "#kids",
    imageSrc: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Accessories",
    href: "#accessories",
    imageSrc: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop",
  },
];

// Premium placeholder data for Featured Products
const FEATURED_PRODUCTS = [
  {
    id: "fp1",
    name: "Classic Cashmere Trench Coat",
    price: 499,
    discountPercent: 15,
    rating: 4.8,
    category: "Men",
    imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp2",
    name: "Silk Cocktail Evening Gown",
    price: 650,
    rating: 4.9,
    category: "Women",
    imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp3",
    name: "Suede Handcrafted Chelsea Boots",
    price: 280,
    discountPercent: 20,
    rating: 4.6,
    category: "Men",
    imageSrc: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp4",
    name: "Italian Leather Designer Handbag",
    price: 890,
    rating: 5.0,
    category: "Accessories",
    imageSrc: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp5",
    name: "Kids Cotton Knit Romper Set",
    price: 85,
    rating: 4.7,
    category: "Kids",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp6",
    name: "Chronograph Gold Mesh Watch",
    price: 350,
    discountPercent: 10,
    rating: 4.5,
    category: "Accessories",
    imageSrc: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp7",
    name: "Kids Knit Canvas Sneakers",
    price: 65,
    rating: 4.4,
    category: "Kids",
    imageSrc: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "fp8",
    name: "Slim Fit Wool Tuxedo Jacket",
    price: 520,
    rating: 4.9,
    category: "Men",
    imageSrc: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
  },
];

// Premium placeholder data for New Arrivals
const NEW_ARRIVALS = [
  {
    id: "na1",
    name: "Oversized Merino Wool Sweater",
    price: 195,
    rating: 4.7,
    category: "Women",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "na2",
    name: "Modern Pilot Gold Sunglasses",
    price: 220,
    discountPercent: 10,
    rating: 4.8,
    category: "Accessories",
    imageSrc: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "na3",
    name: "Minimalist Linen Utility Shirt",
    price: 120,
    rating: 4.5,
    category: "Men",
    imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "na4",
    name: "Kids Organic Fleece Jacket",
    price: 98,
    rating: 4.6,
    category: "Kids",
    imageSrc: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "na5",
    name: "Luxury Silk Square Scarf",
    price: 145,
    rating: 4.9,
    category: "Accessories",
    imageSrc: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600&auto=format&fit=crop",
  },
];

// Premium Customer Reviews
const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    review: "The quality of the trench coat exceeded all my expectations. The tailoring is pristine, the customer support was extremely helpful, and delivery took less than three days. Outstanding branding!",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    role: "Verified Purchaser"
  },
  {
    name: "David Miller",
    review: "Purchased the Italian leather bag and mesh chronograph. Truly premium products that make a clear statement. The transaction was effortless, and the packaging felt incredibly high-end.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    role: "Elite Tier Member"
  },
  {
    name: "Emma Thompson",
    review: "Finding high-quality organic cotton clothing for kids that looks contemporary can be hard. The Certitude kids knit romper is gorgeous, soft, and holds up perfectly after multiple washes.",
    rating: 4,
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop",
    role: "Verified Purchaser"
  },
];

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Run Supabase verification silently in background for status logs
    const configStatus = verifySupabaseConfig();
    console.log("[System] Supabase Integration Status:", configStatus);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }, 1000);
  };

  return (
    <div className="bg-[#FAF9F6] text-stone-800 min-h-screen transition-colors duration-500">
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-[#FAF9F6]">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
          alt="Luxury Fashion Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-85 scale-100 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#FAF9F6]/30 to-[#FAF9F6]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] text-[#E0A99E] animate-pulse">
            Introducing Autumn/Winter &apos;26
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-widest text-stone-900 uppercase sm:text-6xl md:text-7xl lg:text-8xl">
            LUXURY REDEFINED
          </h1>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-stone-700 font-light max-w-2xl mx-auto leading-relaxed">
            Discover timeless fashion curated for every occasion. Exquisite tailoring, sustainably made, made to last.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#men"
              className="w-full sm:w-auto rounded-full bg-[#E0A99E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20"
            >
              Shop Men
            </Link>
            <Link
              href="#women"
              className="w-full sm:w-auto rounded-full border border-stone-250 bg-white/80 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-white hover:border-stone-400 transition-colors backdrop-blur-sm shadow-sm"
            >
              Shop Women
            </Link>
          </div>
        </div>

        {/* Scroll bottom indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400 text-[10px] uppercase tracking-widest font-semibold">
          Scroll Down
          <svg className="h-4 w-4 animate-bounce text-[#E0A99E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
            Curated Collections
          </h2>
          <p className="mt-2 text-sm text-stone-500 font-light">
            Select standard categories designed with luxurious precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              href={category.href}
              imageSrc={category.imageSrc}
            />
          ))}
        </div>
      </section>

      {/* Promotion Split Section */}
      <section className="bg-[#FAF6F0] border-y border-stone-200/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E0A99E]">
                Ethical Fashion Brand
              </span>
              <h2 className="text-2xl font-extrabold tracking-wider uppercase text-stone-900 sm:text-4xl">
                SUSTAINABLE LUXURY MATTERS
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed font-light">
                Every piece in our Atelier catalog is constructed using certified organic cotton, recycled cashmeres, or responsibly sourced Italian leathers. We believe in providing timeless fashion designs that lower our ecological footprint without compromising on prestige or quality.
              </p>
              <div className="flex gap-8 border-t border-stone-200/60 pt-6">
                <div>
                  <h4 className="text-xl font-bold text-stone-900">100%</h4>
                  <p className="text-[10px] uppercase text-stone-400 mt-1 font-bold">Organic Cotton</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Zero</h4>
                  <p className="text-[10px] uppercase text-stone-400 mt-1 font-bold">Toxic Dyes Used</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Fair</h4>
                  <p className="text-[10px] uppercase text-stone-400 mt-1 font-bold">Wages Guaranteed</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/50 shadow-md shadow-stone-200/30">
              <Image
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"
                alt="Ethical Tailoring"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section id="featured" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
            Featured Masterpieces
          </h2>
          <p className="mt-2 text-sm text-stone-500 font-light max-w-lg mx-auto">
            Browse our core catalog of top-rated accessories, outerwear, and dresses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageSrc={product.imageSrc}
              discountPercent={product.discountPercent}
              rating={product.rating}
              category={product.category}
            />
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS SECTION */}
      <section id="new-arrivals" className="bg-[#FAF6F0]/40 border-t border-stone-200/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div className="text-left">
              <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
                New Arrivals
              </h2>
              <p className="mt-2 text-sm text-stone-500 font-light">
                Discover the latest trending releases freshly cataloged.
              </p>
            </div>
            {/* Horizontal scroll indicator */}
            <div className="hidden sm:flex gap-1.5 text-xs text-stone-400 items-center mt-4 sm:mt-0 uppercase tracking-widest font-bold">
              Swipe to explore
              <svg className="h-4 w-4 text-[#E0A99E] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Horizontal Scrolling wrapper for mobile & tablet */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
            {NEW_ARRIVALS.map((product) => (
              <div key={product.id} className="w-[280px] flex-shrink-0">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageSrc={product.imageSrc}
                  discountPercent={product.discountPercent}
                  rating={product.rating}
                  category={product.category}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
            Customer Testimonials
          </h2>
          <p className="mt-2 text-sm text-stone-500 font-light">
            Verified opinions from our loyal global clientele.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((review) => (
            <TestimonialCard
              key={review.name}
              name={review.name}
              review={review.review}
              rating={review.rating}
              avatarSrc={review.avatarSrc}
              role={review.role}
            />
          ))}
        </div>
      </section>

      {/* 6. NEWSLETTER SECTION */}
      <section className="relative overflow-hidden border-t border-stone-200/50 bg-gradient-to-br from-[#FDF6F0] to-[#F7E1D7] py-24 shadow-inner">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E0A99E] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-widest text-stone-900 uppercase sm:text-4xl">
            Stay in Style
          </h2>
          <p className="mt-4 text-sm text-stone-600 font-light max-w-md mx-auto leading-relaxed">
            Subscribe to our Atelier mailing list to receive notifications of exclusive sales, seasonal lookbooks, and fashion updates.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            {newsletterSubscribed ? (
              <div className="rounded-full bg-[#E0A99E]/10 border border-[#E0A99E]/20 px-6 py-4 text-sm text-[#C68B7D] font-bold leading-relaxed shadow-sm">
                Thank you for subscribing! Keep an eye on your inbox for our latest arrivals.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-850 placeholder-stone-400 shadow-sm focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex-shrink-0 rounded-full bg-stone-900 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-800 transition-colors shadow-md cursor-pointer"
                >
                  {isSubmitting ? "Subscribed..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
