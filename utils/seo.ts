import { Metadata } from "next";

const SITE_URL = "https://cloudcertitudefashion.com";

/**
 * Returns a standardized Next.js Metadata configuration object.
 */
export function getMetadata(
  title: string,
  description: string,
  canonicalPath: string = "",
  extra: Partial<Metadata> = {}
): Metadata {
  const url = `${SITE_URL}${canonicalPath}`;
  return {
    title: `${title} | Cloud Certitude Fashion`,
    description,
    keywords: [
      "luxury clothing",
      "sustainable fashion",
      "organic apparel",
      "designer jackets",
      "evening gowns",
      "fair trade fashion",
      "atelier capsule wardrobe",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | Cloud Certitude Fashion`,
      description,
      url,
      siteName: "Cloud Certitude Fashion",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${title} - Cloud Certitude Fashion`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Cloud Certitude Fashion`,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    ...extra,
  };
}

/**
 * Generates JSON-LD Structured Data Schema for Products.
 */
export function getProductSchema(product: {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  rating: number;
  imageSrc: string;
  sku: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageSrc,
    "description": product.description,
    "sku": product.sku,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand,
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/products/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.5,
      "reviewCount": 12,
    },
  };
}

/**
 * Generates JSON-LD Structured Data Schema for the Organization.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cloud Certitude Fashion",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "sameAs": [
      "https://facebook.com/cloudcertitudefashion",
      "https://twitter.com/cloudcertitudefashion",
      "https://linkedin.com/company/cloudcertitudefashion",
    ],
  };
}

/**
 * Generates JSON-LD Structured Data Schema for Breadcrumbs.
 */
export function getBreadcrumbSchema(links: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": links.map((link, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": link.name,
      "item": `${SITE_URL}${link.url}`,
    })),
  };
}
