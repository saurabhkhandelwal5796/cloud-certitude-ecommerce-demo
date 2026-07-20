"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { verifySupabaseConfig } from "@/utils";
import CategoryCard from "@/components/ui/CategoryCard";
import ProductCard from "@/components/ui/ProductCard";
import TestimonialCard from "@/components/ui/TestimonialCard";
import RecommendationCarousel from "@/components/ui/RecommendationCarousel";
import { AdminProduct } from "@/services/AdminService";

const CATEGORIES = [
  {
    title: "Women",
    href: "/women",
    imageSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Men",
    href: "/men",
    imageSrc: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Kids",
    href: "/kids",
    imageSrc: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Accessories",
    href: "/sale",
    imageSrc: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop",
  },
];

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
    review: "Purchased the Italian leather bag and mesh chronograph. Truly premium products that make a statement. The transaction was effortless, and the packaging felt incredibly high-end.",
    rating: 5,
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    role: "Elite Tier Member"
  },
  {
    name: "Emma Thompson",
    review: "Finding high-quality organic cotton clothing for kids that looks contemporary can be hard. The kids knit romper is gorgeous, soft, and holds up perfectly after multiple washes.",
    rating: 4,
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop",
    role: "Verified Purchaser"
  },
];

const HERO_SLIDES = [
  {
    title: "Summer Collection",
    subtitle: "Modern Essentials for Warm Seasons",
    cta: "Shop Women",
    href: "/women",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Flat 50% OFF",
    subtitle: "Premium Fashion at Half Price",
    cta: "Shop Sale",
    href: "/sale",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "New Arrivals",
    subtitle: "Freshly Cataloged Luxury Essentials",
    cta: "Shop New",
    href: "/new-arrivals",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Kids Collection",
    subtitle: "Playful Comfort for Little Ones",
    cta: "Shop Kids",
    href: "/kids",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1600&auto=format&fit=crop"
  },
  {
    title: "Luxury Fashion",
    subtitle: "Sartorial Collections for Men",
    cta: "Shop Men",
    href: "/men",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1600&auto=format&fit=crop"
  }
];

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recommendations states
  const [recommendedForYou, setRecommendedForYou] = useState<AdminProduct[]>([]);
  const [trendingNow, setTrendingNow] = useState<AdminProduct[]>([]);
  const [bestSellers, setBestSellers] = useState<AdminProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<AdminProduct[]>([]);
  const [customersAlsoBought, setCustomersAlsoBought] = useState<AdminProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<AdminProduct[]>([]);

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    verifySupabaseConfig();

    const loadRecommendations = async () => {
      try {
        const { getSupabaseClient } = await import("@/lib/supabase/client");
        const {
          getRecommendedForYou,
          getTrendingNow,
          getBestSellers,
          getCustomersAlsoBought,
          getCustomerProfile,
        } = await import("@/services/RecommendationService");
        const { getProducts } = await import("@/services/AdminService");

        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || undefined;

        const recs = await getRecommendedForYou(email);
        const trend = await getTrendingNow();
        const best = await getBestSellers();

        setRecommendedForYou(recs.slice(0, 8));
        setTrendingNow(trend.slice(0, 8));
        setBestSellers(best.slice(0, 8));

        const profile = getCustomerProfile();
        const allProducts = await getProducts();
        const viewed = allProducts.filter((p) => profile.recentlyViewed.includes(p.id));
        setRecentlyViewed(viewed);

        const lastViewedId = profile.recentlyViewed[0] || "m1";
        const alsoBought = await getCustomersAlsoBought(lastViewedId);
        setCustomersAlsoBought(alsoBought.slice(0, 8));

        const newArrList = allProducts.filter((p) => p.tags?.includes("New Arrival") || p.id.startsWith("new") || p.id.startsWith("na"));
        setNewArrivals(newArrList.slice(0, 8));
      } catch (err) {
        console.error("Failed to load recommendations on home page:", err);
      }
    };

    loadRecommendations();

    window.addEventListener("certitude_recommendations_updated", loadRecommendations);
    return () => window.removeEventListener("certitude_recommendations_updated", loadRecommendations);
  }, []);

  // Auto-rotating Hero Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

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
    <div className="bg-[#FAF9F6] text-stone-855 min-h-screen transition-colors duration-500">
      {/* 1. AUTO-ROTATING HERO CAROUSEL */}
      <section className="relative h-[65vh] sm:h-[80vh] w-full flex items-center overflow-hidden bg-stone-900">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover opacity-75 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-900/30 to-transparent" />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 text-left">
                <div className="max-w-xl space-y-4 sm:space-y-6">
                  <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#E0A99E]">
                    {slide.subtitle}
                  </span>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-white uppercase leading-none">
                    {slide.title}
                  </h1>
                  <p className="text-stone-300 font-light text-xs sm:text-sm max-w-sm sm:max-w-md">
                    Experience state-of-the-art sustainable tailoring designed to represent modern values, luxury, and prestige.
                  </p>
                  <div>
                    <Link
                      href={slide.href}
                      className="inline-block bg-white text-stone-900 rounded-full px-6 sm:px-8 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-[#E0A99E] hover:text-white transition-all shadow-lg transform hover:-translate-y-0.5 duration-300"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Left/Right navigation arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
          aria-label="Previous Slide"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
          aria-label="Next Slide"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Indicators / Dots */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2.5 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentHeroSlide ? "w-6 bg-[#E0A99E]" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide index ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. CATEGORY CARDS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
            Shop By Category
          </h2>
          <p className="mt-2 text-sm text-stone-500 font-light">
            Refined collection spaces tailored to match your specific essentials.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <CategoryCard key={idx} title={cat.title} href={cat.href} imageSrc={cat.imageSrc} />
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

      {/* 3. DYNAMIC AI RECOMMENDATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        {/* Recommended For You */}
        {recommendedForYou.length > 0 && (
          <RecommendationCarousel
            title="Recommended For You"
            subtitle="Personalized styling picks based on your affinity"
            products={recommendedForYou}
          />
        )}

        {/* Trending Now */}
        {trendingNow.length > 0 && (
          <RecommendationCarousel
            title="Trending Now"
            subtitle="Products generating maximum shopper velocity right now"
            products={trendingNow}
          />
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <RecommendationCarousel
            title="Best Sellers"
            subtitle="Top volume releases loved by our global clientele"
            products={bestSellers}
          />
        )}

        {/* Customers Also Bought */}
        {customersAlsoBought.length > 0 && (
          <RecommendationCarousel
            title="Customers Also Bought"
            subtitle="Often purchased alongside your browsing preferences"
            products={customersAlsoBought}
          />
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <RecommendationCarousel
            title="Recently Viewed Products"
            subtitle="Items you viewed during this session"
            products={recentlyViewed}
          />
        )}
      </section>

      {/* 4. NEW ARRIVALS SECTION */}
      <section id="new-arrivals" className="bg-[#FAF6F0]/40 border-t border-stone-200/40 py-20 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black tracking-widest text-stone-900 uppercase sm:text-3xl">
                New Arrivals
              </h2>
              <p className="mt-2 text-sm text-stone-500 font-light">
                Discover the latest trending releases freshly cataloged.
              </p>
            </div>
            <div className="hidden sm:flex gap-1.5 text-xs text-stone-400 items-center mt-4 sm:mt-0 uppercase tracking-widest font-bold">
              Swipe to explore
              <svg className="h-4 w-4 text-[#E0A99E] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
            {newArrivals.map((product) => (
              <div key={product.id} className="w-[280px] flex-shrink-0">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageSrc={product.imageSrc}
                  discountPercent={product.discountPercent}
                  rating={product.rating || 4.5}
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
                  className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm text-stone-850 placeholder-stone-400 shadow-sm focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 text-stone-800"
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
