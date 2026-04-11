export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    slug: "eat",
    name: "Eat",
    description: "Restaurants, seafood shacks, cafes & diners vetted by locals",
    icon: "🍽️",
    color: "bg-sunset-500",
  },
  {
    slug: "drink",
    name: "Drink",
    description: "Bars, beach bars & island watering holes worth your time",
    icon: "🍺",
    color: "bg-ocean-500",
  },
  {
    slug: "stay",
    name: "Stay",
    description: "Beach houses, hotels & rentals you can actually trust",
    icon: "🏠",
    color: "bg-seafoam-500",
  },
  {
    slug: "do",
    name: "Do",
    description: "Tours, adventures & experiences worth your time on the island",
    icon: "🌊",
    color: "bg-coral-500",
  },
  {
    slug: "fish",
    name: "Fish",
    description: "Charters, guides & tackle shops for every angler on the island",
    icon: "🎣",
    color: "bg-sand-600",
  },
  {
    slug: "beach",
    name: "Beach",
    description: "Beach setups, rentals & everything you need on the sand",
    icon: "🏖️",
    color: "bg-sunset-500",
  },
  {
    slug: "shop",
    name: "Shop",
    description: "Local boutiques, surf shops & markets run by real Port A people",
    icon: "🛍️",
    color: "bg-ocean-500",
  },
  {
    slug: "realty",
    name: "Realty",
    description: "Local real estate agents & property experts who know the island",
    icon: "🏡",
    color: "bg-seafoam-500",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
