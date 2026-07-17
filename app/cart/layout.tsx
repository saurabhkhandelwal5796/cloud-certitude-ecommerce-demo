import type { Metadata } from "next";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata(
  "Shopping Cart",
  "Review the luxury sustainable apparel items in your shopping bag and proceed to checkout.",
  "/cart"
);

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
