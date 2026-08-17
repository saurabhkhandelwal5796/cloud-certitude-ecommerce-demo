import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/checkout/", "/profile/"],
    },
    sitemap: "https://cloud-certitude-ecommerce-demo.vercel.app/sitemap.xml",
  };
}
