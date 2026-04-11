import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Best Shops & Boutiques in Port Aransas, TX — Port A Local",
  description:
    "Discover the best local shops, boutiques, surf shops, and markets in Port Aransas, Texas. All run by real Port A people — no chains, no tourist traps.",
};

export default function ShopPage() {
  const category = getCategoryBySlug("shop")!;
  const businesses = getBusinessesByCategory("shop");
  return <CategoryPage category={category} businesses={businesses} />;
}
