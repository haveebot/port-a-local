import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Things to Do in Port Aransas, TX — Port A Local",
  description:
    "Explore the best tours, adventures, and activities in Port Aransas, Texas. Dolphin cruises, kayaking, parasailing, and more — all vetted by locals who live here.",
};

export default function DoPage() {
  const category = getCategoryBySlug("do")!;
  const businesses = getBusinessesByCategory("do");
  return <CategoryPage category={category} businesses={businesses} />;
}
