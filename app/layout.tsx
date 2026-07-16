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

export const metadata: Metadata = {
  title: "Cloud Certitude E-Commerce Demo",
  description:
    "A production-ready full-stack e-commerce clothing store powered by Next.js, Supabase, and Vercel.",
  keywords: ["e-commerce", "clothing", "Next.js", "Supabase", "Vercel"],
  openGraph: {
    title: "Cloud Certitude E-Commerce Demo",
    description:
      "A production-ready full-stack e-commerce clothing store powered by Next.js, Supabase, and Vercel.",
    type: "website",
  },
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-stone-800">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
