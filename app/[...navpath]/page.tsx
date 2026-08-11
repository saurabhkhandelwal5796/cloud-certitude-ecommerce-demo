import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNodeByPath, getAncestors, getNodeSeo, getNodeBanners } from "@/services/NavigationService";
import NodeCollectionTemplate from "@/components/ui/NodeCollectionTemplate";
import DynamicBreadcrumbs from "@/components/ui/DynamicBreadcrumbs";

/**
 * app/[...navpath]/page.tsx
 *
 * Universal catch-all route for the navigation_nodes tree.
 *
 * Handles paths of unlimited depth via a single indexed DB lookup:
 *   /men                           → params.navpath = ["men"]
 *   /men/clothing                  → params.navpath = ["men", "clothing"]
 *   /men/clothing/top-wear/t-shirts → params.navpath = ["men", "clothing", "top-wear", "t-shirts"]
 *
 * Route collision safety:
 *   Next.js resolves static routes before catch-alls, so /cart, /checkout,
 *   /admin, /search, /men, /women, /kids all continue to work unchanged.
 *
 * Per Next.js 15 docs: params is a Promise — must be awaited.
 */

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ navpath: string[] }>;
}): Promise<Metadata> {
  const { navpath } = await params;
  const fullPath = navpath.join("/");

  const node = await getNodeByPath(fullPath);
  if (!node) return { title: "Collection" };

  const seo = await getNodeSeo(node.id);

  return {
    title: seo?.title ?? `${node.name} | Cloud Certitude Fashion`,
    description:
      seo?.description ??
      `Shop the latest ${node.name} collection at Cloud Certitude Fashion.`,
    openGraph: {
      title: seo?.title ?? node.name,
      description: seo?.description ?? `Shop ${node.name}`,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
    alternates: seo?.canonicalUrl
      ? { canonical: seo.canonicalUrl }
      : undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NavPathPage({
  params,
}: {
  params: Promise<{ navpath: string[] }>;
}) {
  const { navpath } = await params;

  // Guard: empty catch-all should never happen, but be safe
  if (!navpath || navpath.length === 0) {
    notFound();
  }

  const fullPath = navpath.join("/");

  // Single indexed DB lookup — O(log n) via full_path index
  const node = await getNodeByPath(fullPath);

  if (!node || !node.isActive) {
    notFound();
  }

  // Fetch ancestors + banners in parallel
  const [ancestors, banners] = await Promise.all([
    getAncestors(node.id),
    getNodeBanners(node.id),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <DynamicBreadcrumbs ancestors={ancestors} current={node} />
      </div>

      {/* Optional node banners */}
      {banners.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.href ?? "#"}
                className="flex-shrink-0 rounded-xl overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.altText ?? node.name}
                  className="h-32 w-auto object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Collection grid — client component */}
      <NodeCollectionTemplate node={node} />
    </div>
  );
}
