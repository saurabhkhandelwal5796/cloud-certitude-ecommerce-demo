import type { MetadataRoute } from "next";
import { getProducts } from "@/services/AdminService";

const SITE_URL = "https://cloudcertitudefashion.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/men",
    "/women",
    "/kids",
    "/new-arrivals",
    "/sale",
    "/wishlist",
    "/cart",
  ];

  const staticSitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const products = await getProducts();
    const productSitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticSitemap, ...productSitemap];
  } catch (err) {
    console.error("[Sitemap] Error fetching products for sitemap:", err);
    return staticSitemap;
  }
}
