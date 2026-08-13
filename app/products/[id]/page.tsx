import React, { cache } from "react";
import ProductReviews from "@/components/ui/ProductReviews";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import ViewTracker from "@/components/ui/ViewTracker";
import SimilarProducts from "@/components/ui/SimilarProducts";
import CompleteTheLook from "@/components/ui/CompleteTheLook";
import FrequentlyBoughtTogether from "@/components/ui/FrequentlyBoughtTogether";
import { getMetadata, getProductSchema, getBreadcrumbSchema } from "@/utils/seo";
import SocialShare from "@/components/ui/SocialShare";
import RecentlyViewedClient from "@/components/ui/RecentlyViewedClient";
import ProductDetailsClient from "@/components/ui/ProductDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getProduct = cache(async (id: string) => {
  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  const { data: rawProduct } = await supabase.from('products').select('*').eq('id', id).single();
  return rawProduct;
});

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const rawProduct = await getProduct(id);

  if (!rawProduct) {
    return getMetadata("Product Not Found", "This product could not be found.", `/products/${id}`);
  }
  return getMetadata(rawProduct.name, rawProduct.description, `/products/${rawProduct.id}`);
}

export default async function ProductDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialVariantId = typeof resolvedSearchParams?.variant === "string" ? resolvedSearchParams.variant : undefined;

  // ── 1. Fetch product from Supabase ─────────────────────────────────────────
  const rawProduct = await getProduct(id);
  
  let product: import("@/services/AdminService").AdminProduct | null = null;
  if (rawProduct) {
    const p = rawProduct;
    product = {
      id: String(p.id),
      name: String(p.name),
      description: String(p.description || ""),
      category: String(p.category),
      brand: String(p.brand || "Atelier"),
      price: Number(p.price),
      discountPercent: p.discount_percent !== undefined ? Number(p.discount_percent) : (p.discountPercent !== undefined ? Number(p.discountPercent) : 0),
      stockQuantity: p.stock !== undefined ? Number(p.stock) : (p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0),
      imageSrc: (p.image_src || p.imageSrc || (Array.isArray(p.images) ? p.images[0] : "")) || "",
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      size: Array.isArray(p.size) ? (p.size as string[]) : ["S", "M", "L", "XL"],
      color: Array.isArray(p.color) ? (p.color as string[]) : ["Beige", "Black", "Charcoal"],
      rating: p.rating !== undefined ? Number(p.rating) : 4.5,
      reviewCount: p.review_count !== undefined ? Number(p.review_count) : (p.reviewCount !== undefined ? Number(p.reviewCount) : 0),
      sku: String(p.sku || ""),
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      hsnCode: p.hsn_code !== undefined ? String(p.hsn_code || "") : "",
      navNodeId: p.nav_node_id ? String(p.nav_node_id) : (p.navNodeId ? String(p.navNodeId) : null),
      status: p.status as "draft" | "active" | "archived" || "draft"
    };
  }

  // ── 2. Fetch variants with attribute labels (parallel with product fetch) ──
  let variantsWithAttrs: import("@/services/VariantService").VariantWithAttributes[] = [];
  let productAttributes: Record<string, string> = {};

  try {
    const { getVariantsWithAttributesSSR } = await import("@/services/VariantService");
    const { getProductAttributes, getFullCatalog } = await import("@/services/AttributeService");

    const [fetchedVariants, assignedValueIds, catalog] = await Promise.all([
      getVariantsWithAttributesSSR(id),
      // Product-level attribute assignments (Material, Fit, etc.)
      getProductAttributes(id),
      getFullCatalog(),
    ]);

    variantsWithAttrs = fetchedVariants;

    // Build product-level attribute map from catalog + assigned value IDs
    if (assignedValueIds.length > 0) {
      const attrMap: Record<string, string> = {};
      for (const group of catalog) {
        for (const attr of group.attributes) {
          for (const val of attr.values) {
            if (assignedValueIds.includes(val.id)) {
              attrMap[attr.name] = val.value;
            }
          }
        }
      }
      productAttributes = attrMap;
    }
  } catch (err) {
    // Non-fatal: variant tables may not be set up in all environments
    console.warn("[ProductDetailsPage] Variant/attribute fetch failed:", err);
  }

  // ── 3. Handle missing product ──────────────────────────────────────────────
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-stone-900 uppercase tracking-wide">
          Product Not Found
        </h1>
        <p className="mt-4 text-sm text-stone-500">
          This product may have been removed or the link is incorrect.
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-[#E0A99E] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#D4988D] transition-colors"
        >
          Back to Home
        </a>
      </div>
    );
  }

  // ── 4. Structured Data ─────────────────────────────────────────────────────
  const productSchema = getProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    price: product.price,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    imageSrc: product.imageSrc,
    sku: product.sku || "",
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: product.category || "Fashion", url: `/${(product.category || "fashion").toLowerCase()}` },
    { name: product.name, url: `/products/${product.id}` },
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  // ── 5. Render ──────────────────────────────────────────────────────────────
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

      {/* 2-Column Desktop Grid (Gallery + Details) Managed by Client wrapper */}
      <ProductDetailsClient 
        product={product} 
        variants={variantsWithAttrs} 
        productAttributes={productAttributes} 
        initialVariantId={initialVariantId}
      />

      {/* Frequently Bought Together Bundle Package */}
      <FrequentlyBoughtTogether productId={product.id} />

      {/* Complete The Look styling picks */}
      <CompleteTheLook productId={product.id} />

      {/* Similar Products Carousel */}
      <SimilarProducts productId={product.id} />

      {/* Reviews feed breakdown */}
      <ProductReviews
        productId={product.id}
        initialRating={product.rating}
        initialReviewCount={product.reviewCount}
      />

      {/* Recently Viewed — loaded from localStorage client-side */}
      <RecentlyViewedClient />
    </div>
  );
}
