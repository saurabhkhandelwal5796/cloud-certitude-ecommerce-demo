import type { Metadata } from "next";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata(
  "Your Orders",
  "View your completed orders history and details at Cloud Certitude Fashion.",
  "/orders"
);

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
