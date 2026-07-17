import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/checkout/", "/profile/"],
    },
    sitemap: "https://cloudcertitudefashion.com/sitemap.xml",
  };
}
