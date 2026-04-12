export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  /** Tags to match businesses against — any business with at least one of these tags appears */
  matchTags: string[];
  /** Optional category filter — only show businesses from these categories */
  categories?: string[];
  /** SEO meta description */
  metaDescription: string;
}

export const guides: Guide[] = [
  {
    slug: "happy-hour",
    title: "Best Happy Hours in Port Aransas",
    subtitle: "Cold drinks, good deals, and the best spots to kick off your evening on the island",
    description:
      "Port A's happy hour scene is the real deal — half-price oysters, frozen margaritas, waterfront sunsets, and no cover charges. These are the spots locals actually go to when the afternoon starts winding down.",
    icon: "🍹",
    matchTags: ["happy hour"],
    categories: ["eat", "drink"],
    metaDescription:
      "The best happy hour deals in Port Aransas, TX. Half-price oysters, frozen drinks, waterfront bars — vetted by locals.",
  },
  {
    slug: "pet-friendly",
    title: "Pet-Friendly Port Aransas",
    subtitle: "Bring your dog — these spots welcome four-legged visitors",
    description:
      "Port Aransas is one of the most dog-friendly beach towns in Texas. These restaurants, bars, and activities welcome your pup with open patios, water bowls, and zero attitude.",
    icon: "🐕",
    matchTags: ["pet friendly", "pet-friendly", "dog-friendly", "dog friendly"],
    metaDescription:
      "Pet-friendly restaurants, bars, and activities in Port Aransas, TX. Dog-friendly patios and beach spots vetted by locals.",
  },
  {
    slug: "date-night",
    title: "Date Night in Port Aransas",
    subtitle: "Romantic dinners, craft cocktails, and sunset views for two",
    description:
      "Whether it's a special occasion or just a Tuesday, these are the Port A spots that set the mood — fine dining, waterfront tables, cocktail bars, and views that do the work for you.",
    icon: "🌅",
    matchTags: ["date night", "fine dining", "good for date night"],
    categories: ["eat", "drink"],
    metaDescription:
      "The best date night restaurants and bars in Port Aransas, TX. Fine dining, sunset views, and romantic spots vetted by locals.",
  },
  {
    slug: "family-friendly",
    title: "Family-Friendly Port Aransas",
    subtitle: "Kid-approved restaurants, activities, and adventures the whole crew will love",
    description:
      "Traveling with kids? Port Aransas has you covered. From restaurants with mini golf to dolphin tours and beach gear rentals, these spots are built for families.",
    icon: "👨‍👩‍👧‍👦",
    matchTags: ["family-friendly", "family friendly", "family", "kid friendly", "kids"],
    metaDescription:
      "Family-friendly restaurants, activities, and things to do in Port Aransas, TX. Kid-approved spots vetted by locals.",
  },
  {
    slug: "sunset-views",
    title: "Best Sunset Views in Port Aransas",
    subtitle: "Where to watch the sky turn gold over the Gulf",
    description:
      "Port A sunsets are the main event. These waterfront bars, restaurants, boat tours, and beach spots give you a front-row seat to the best light show on the Texas coast.",
    icon: "🌅",
    matchTags: ["sunset views", "sunset", "sunset cruise", "gulf views"],
    metaDescription:
      "The best sunset viewing spots in Port Aransas, TX. Waterfront bars, boat tours, and beach spots with Gulf views.",
  },
  {
    slug: "live-music",
    title: "Live Music in Port Aransas",
    subtitle: "Where to catch a set on the island — bars, patios, and waterfront stages",
    description:
      "Port A has a live music scene that punches above its weight. From dive bars with jukebox legends to waterfront stages with full bands, here's where to find it.",
    icon: "🎵",
    matchTags: ["live music"],
    categories: ["eat", "drink"],
    metaDescription:
      "Live music venues and bars in Port Aransas, TX. Dive bars, waterfront stages, and patios with live bands.",
  },
  {
    slug: "seafood",
    title: "Best Seafood in Port Aransas",
    subtitle: "Fresh Gulf catches, fried platters, raw bars, and everything in between",
    description:
      "You're on a barrier island on the Gulf of Mexico. The seafood here isn't trucked in — it's pulled out of the water down the road. These are the spots that do it best.",
    icon: "🦞",
    matchTags: ["seafood", "oysters", "gulf", "shrimp", "fish tacos"],
    categories: ["eat"],
    metaDescription:
      "The best seafood restaurants in Port Aransas, TX. Fresh Gulf catches, oyster bars, fried platters — vetted by locals.",
  },
  {
    slug: "outdoor-adventures",
    title: "Outdoor Adventures in Port Aransas",
    subtitle: "Fishing, dolphins, parasailing, kayaking, and everything the Gulf has to offer",
    description:
      "Port Aransas is built for being outside. Charter a fishing trip, swim with dolphins, parasail over the Gulf, or just rent a board and paddle out. Here's where the adventure starts.",
    icon: "🏄",
    matchTags: ["outdoor", "dolphins", "fishing", "parasailing", "adventure", "boat tour", "nature tour", "surf lessons", "paddleboard"],
    categories: ["do", "fish"],
    metaDescription:
      "Outdoor activities and adventures in Port Aransas, TX. Fishing charters, dolphin tours, parasailing, kayaking — vetted by locals.",
  },
  {
    slug: "locally-owned",
    title: "Locally Owned in Port Aransas",
    subtitle: "Support the businesses that make this island what it is",
    description:
      "These aren't chains. They're not franchises. They're businesses started by people who live on this island, built with their own hands, and kept alive through hurricanes and slow seasons. When you spend here, you're spending local.",
    icon: "🏝️",
    matchTags: ["locally owned"],
    metaDescription:
      "Locally owned businesses in Port Aransas, TX. Restaurants, shops, and services run by islanders — no chains, no franchises.",
  },
  {
    slug: "late-night",
    title: "Late Night Port Aransas",
    subtitle: "Where to eat and drink after the sun goes down",
    description:
      "Port A doesn't roll up the sidewalks at 9. These spots keep the kitchen open, the drinks cold, and the music going well past dark.",
    icon: "🌙",
    matchTags: ["late night"],
    categories: ["eat", "drink"],
    metaDescription:
      "Late night restaurants and bars in Port Aransas, TX. Kitchen open late, cold drinks, live music after dark.",
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
