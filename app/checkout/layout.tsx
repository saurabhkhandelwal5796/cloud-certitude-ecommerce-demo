import type { Metadata } from "next";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata(
  "Checkout",
  "Securely complete your purchase at Cloud Certitude Fashion.",
  "/checkout"
);

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
