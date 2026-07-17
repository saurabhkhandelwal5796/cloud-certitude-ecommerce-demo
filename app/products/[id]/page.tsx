import React from "react";
import ProductImageGallery from "@/components/ui/ProductImageGallery";
import ProductInfo from "@/components/ui/ProductInfo";
import DeliveryChecker from "@/components/ui/DeliveryChecker";
import ProductReviews from "@/components/ui/ProductReviews";
import RelatedProducts from "@/components/ui/RelatedProducts";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import ViewTracker from "@/components/ui/ViewTracker";
import SimilarProducts from "@/components/ui/SimilarProducts";
import CompleteTheLook from "@/components/ui/CompleteTheLook";
import FrequentlyBoughtTogether from "@/components/ui/FrequentlyBoughtTogether";
import { getMetadata, getProductSchema, getBreadcrumbSchema } from "@/utils/seo";
import SocialShare from "@/components/ui/SocialShare";

// All catalog products combined for details lookup
const ALL_PRODUCTS = [
  {
    id: "m1",
    name: "Classic Cashmere Trench Coat",
    price: 499,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 124,
    sku: "CC-M-TRENCH-01",
    category: "Men",
    brand: "Certitude",
    color: "Beige",
    size: ["M", "L", "XL"],
    description: "Premium double-breasted coat made with pure organic cashmere and structured shoulders for an elegant silhouette.",
    imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "m2",
    name: "Minimalist Linen Utility Shirt",
    price: 120,
    rating: 4.5,
    reviewCount: 98,
    sku: "CC-M-LINEN-02",
    category: "Men",
    brand: "Atelier",
    color: "Cream",
    size: ["S", "M", "L"],
    description: "A breathable, lightweight utility shirt crafted from 100% fine French flax linen, featuring double patch pockets.",
    imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "w1",
    name: "Silk Cocktail Evening Gown",
    price: 650,
    discountPercent: 10,
    rating: 4.9,
    reviewCount: 240,
    sku: "CC-W-SILK-01",
    category: "Women",
    brand: "Certitude",
    color: "Blush",
    size: ["S", "M", "L"],
    description: "Exquisite floor-length evening gown crafted from heavy 100% mulberry silk satin with a delicate drape back.",
    imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "w2",
    name: "Oversized Merino Wool Sweater",
    price: 195,
    rating: 4.7,
    reviewCount: 156,
    sku: "CC-W-MERINO-02",
    category: "Women",
    brand: "EcoKnit",
    color: "Beige",
    size: ["XS", "S", "M", "L"],
    description: "Relaxed mock neck sweater chunky knit from responsibly sourced extra-fine Australian merino wool.",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "k1",
    name: "Kids Cotton Knit Romper Set",
    price: 85,
    discountPercent: 10,
    rating: 4.7,
    reviewCount: 42,
    sku: "CC-K-ROMPER-01",
    category: "Kids",
    brand: "EcoKnit",
    color: "Beige",
    size: ["S", "M"],
    description: "An incredibly soft, organic cotton pointelle knit romper set complete with matching booties.",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
    ],
  },
];

// Fallback template for any other dynamic ID to ensure page always displays cleanly
const DEFAULT_FALLBACK_PRODUCT = {
  id: "default",
  name: "Classic Atelier Knit Cardigan",
  price: 210,
  discountPercent: 15,
  rating: 4.7,
  reviewCount: 88,
  sku: "CC-A-KNIT-99",
  category: "New Collection",
  brand: "Atelier",
  color: "Beige",
  size: ["S", "M", "L", "XL"],
  description: "A tailored mid-weight cardigan crafted from organic extra-fine wool fibers. Minimalist, structural, and soft on touch.",
  imageSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
  ],
};

// Related products
const RELATED_PRODUCTS = [
  {
    id: "m1",
    name: "Classic Cashmere Trench Coat",
    price: 499,
    discountPercent: 15,
    rating: 4.8,
    category: "Men",
    brand: "Certitude",
    imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w1",
    name: "Silk Cocktail Evening Gown",
    price: 650,
    discountPercent: 10,
    rating: 4.9,
    category: "Women",
    brand: "Certitude",
    imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k2",
    name: "Kids Organic Fleece Jacket",
    price: 98,
    rating: 4.6,
    category: "Kids",
    brand: "EcoKnit",
    imageSrc: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m3",
    name: "Suede Handcrafted Chelsea Boots",
    price: 280,
    discountPercent: 20,
    rating: 4.6,
    category: "Men",
    brand: "Modern Classic",
    imageSrc: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&auto=format&fit=crop",
  },
];

// Recently Viewed products
const RECENTLY_VIEWED_PRODUCTS = [
  {
    id: "w2",
    name: "Oversized Merino Wool Sweater",
    price: 195,
    rating: 4.7,
    category: "Women",
    brand: "EcoKnit",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m2",
    name: "Minimalist Linen Utility Shirt",
    price: 120,
    rating: 4.5,
    category: "Men",
    brand: "Atelier",
    imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "k1",
    name: "Kids Cotton Knit Romper Set",
    price: 85,
    discountPercent: 10,
    rating: 4.7,
    category: "Kids",
    brand: "EcoKnit",
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m4",
    name: "Slim Fit Wool Tuxedo Jacket",
    price: 520,
    rating: 4.9,
    category: "Men",
    brand: "Certitude",
    imageSrc: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop",
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = ALL_PRODUCTS.find((p) => p.id === id) || {
    ...DEFAULT_FALLBACK_PRODUCT,
    id,
  };
  return getMetadata(
    product.name,
    product.description,
    `/products/${product.id}`
  );
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Search in database first, fallback to fallback template if not found
  const product =
    ALL_PRODUCTS.find((p) => p.id === id) || {
      ...DEFAULT_FALLBACK_PRODUCT,
      id,
    };

  const productSchema = getProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    price: product.price,
    rating: product.rating,
    imageSrc: product.imageSrc,
    sku: product.sku,
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: product.category || "Fashion", url: `/${(product.category || "Fashion").toLowerCase()}` },
    { name: product.name, url: `/products/${product.id}` },
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Client-side View tracker */}
      <ViewTracker productId={product.id} />

      {/* 2-Column Desktop Grid (Gallery + Details) */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Image Viewport + Delivery Checker */}
        <div className="w-full lg:w-1/2">
          <ProductImageGallery images={product.images} />
          <DeliveryChecker />
        </div>

        {/* Right Column: Title, Ratings, Size Selector, Cart trigger, Details Accordion */}
        <div className="w-full lg:w-1/2">
          <ProductInfo
            id={product.id}
            name={product.name}
            brand={product.brand}
            price={product.price}
            imageSrc={product.imageSrc}
            discountPercent={product.discountPercent}
            rating={product.rating}
            reviewCount={product.reviewCount}
            sku={product.sku}
            description={product.description}
          />

          {/* Social Sharing block */}
          <SocialShare
            url={`https://cloudcertitudefashion.com/products/${product.id}`}
            title={product.name}
          />
        </div>
      </div>

      {/* Frequently Bought Together Bundle Package */}
      <FrequentlyBoughtTogether productId={product.id} />

      {/* Complete The Look styling picks */}
      <CompleteTheLook productId={product.id} />

      {/* Similar Products Carousel */}
      <SimilarProducts productId={product.id} />

      {/* Reviews feed breakdown (Section 7) */}
      <ProductReviews
        productId={product.id}
        initialRating={product.rating}
        initialReviewCount={product.reviewCount}
      />

      {/* Related Products carousel (Section 8) */}
      <RelatedProducts products={RELATED_PRODUCTS} />

      {/* Recently Viewed carousel (Section 9) */}
      <RecentlyViewed products={RECENTLY_VIEWED_PRODUCTS} />
    </div>
  );
}
