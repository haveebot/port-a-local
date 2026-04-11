import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Best Restaurants in Port Aransas, TX — Port A Local",
  description:
    "Discover the best places to eat in Port Aransas, Texas. Local-vetted restaurants, seafood shacks, cafes, and diners — no paid placements, just honest picks from people who live here.",
};

export default function EatPage() {
  const category = getCategoryBySlug("eat")!;
  const businesses = getBusinessesByCategory("eat");
  return <CategoryPage category={category} businesses={businesses} />;
}
