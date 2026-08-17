import type { MetadataRoute } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";

const SITE_URL = "https://cloud-certitude-ecommerce-demo.vercel.app";

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
    const supabase = getSupabaseClient() as any;
    let allIds: string[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error("[Sitemap] Supabase error:", error);
        break;
      }
      if (data && data.length > 0) {
        allIds.push(...data.map((d: any) => d.id));
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    const productSitemap = allIds.map((id) => ({
      url: `${SITE_URL}/products/${id}`,
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
