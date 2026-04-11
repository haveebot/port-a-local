import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Best Bars & Beach Bars in Port Aransas, TX — Port A Local",
  description:
    "Find the best bars, beach bars, and island watering holes in Port Aransas, Texas. Local-vetted drinks spots — from laid-back dives to sunset views on the water.",
};

export default function DrinkPage() {
  const category = getCategoryBySlug("drink")!;
  const businesses = getBusinessesByCategory("drink");
  return <CategoryPage category={category} businesses={businesses} />;
}
