import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { getCategoryBySlug } from "@/data/categories";
import { getBusinessesByCategory } from "@/data/businesses";

export const metadata: Metadata = {
  title: "Best Places to Stay in Port Aransas, TX — Port A Local",
  description:
    "Find the best hotels, beach houses, and vacation rentals in Port Aransas, Texas. Local-vetted lodging you can actually trust — no resorts, no gimmicks.",
};

export default function StayPage() {
  const category = getCategoryBySlug("stay")!;
  const businesses = getBusinessesByCategory("stay");
  return <CategoryPage category={category} businesses={businesses} />;
}
