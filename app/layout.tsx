import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata(
  "Premium Sustainable Apparel",
  "Discover standard collection wardrobe basics, cashmeres, silk evening dresses, and premium accessories at Cloud Certitude Fashion.",
  ""
);

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import SEOProvider from "@/components/ui/SEOProvider";
import { PromotionalBanner } from "@/components/ui/MarketingSuite";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cloud Certitude Fashion",
    "url": "https://cloudcertitudefashion.com",
    "logo": "https://cloudcertitudefashion.com/logo.png",
  };

  const webSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cloud Certitude Fashion",
    "url": "https://cloudcertitudefashion.com",
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-stone-800">
        <SEOProvider>
          <PromotionalBanner />
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </SEOProvider>
      </body>
    </html>
  );
}
