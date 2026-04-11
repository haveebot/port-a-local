import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Fishing Charters & Guides in Port Aransas, TX — Port A Local",
  description:
    "Book the best fishing charters, guides, and tackle shops in Port Aransas, Texas. Deep sea, bay, and nearshore fishing — local picks from people who know these waters.",
};

export default function FishPage() {
  const category = getCategoryBySlug("fish")!;
  const businesses = getBusinessesByCategory("fish");
  return <CategoryPage category={category} businesses={businesses} />;
}
