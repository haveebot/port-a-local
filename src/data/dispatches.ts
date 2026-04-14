/**
 * Port A Local — Dispatch
 *
 * Current-events editorial, analysis, and investigation. Distinct from Heritage
 * (preserved history). Dispatches are dated, sourced, and carry a point of view.
 *
 * Voice: local, journalistic, specific, sourced. Reluctant to sensationalize.
 */

export interface Dispatch {
  slug: string;
  title: string;
  subtitle: string;
  /** Short description for cards, OG tags, and search */
  description: string;
  category: "editorial" | "analysis" | "investigation" | "news";
  icon: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  /** ISO date of publication */
  date: string;
  /** ISO date of last material update (shown if present) */
  updatedAt?: string;
  /** Tags for search / filtering */
  tags: string[];
  /** Related dispatch slugs */
  relatedDispatches?: string[];
  /** Related heritage story slugs — cross-link into /history */
  relatedStories?: string[];
}

export const dispatches: Dispatch[] = [
  {
    slug: "the-two-port-aransases",
    title: "The Two Port Aransases",
    subtitle:
      "Tourism dashboards say the island is up. Main Street tells a different story — and the numbers, read carefully, agree.",
    description:
      "A national-chain drive-thru closes on Highway 361 while a $1.3 billion PUD expansion breaks ground a few miles south. The Tourism Bureau says everything is up. The Texas Comptroller tells a quieter, more complicated story. What the island's dashboards can and cannot see.",
    category: "editorial",
    icon: "🧭",
    readTime: "11 min",
    featured: true,
    published: true,
    date: "2026-04-14",
    tags: [
      "Port Aransas",
      "economy",
      "tourism",
      "Cinnamon Shore",
      "Palmilla Beach",
      "Sunflower Beach",
      "Mark Schnell",
      "30A",
      "HOT tax",
      "sales tax",
      "PAISD",
      "Sonic",
      "PUD",
      "development",
    ],
    relatedDispatches: [],
    relatedStories: ["storms-of-port-aransas", "cinnamon-shore-tension"],
  },
];

export function getDispatchBySlug(slug: string): Dispatch | undefined {
  return dispatches.find((d) => d.slug === slug);
}

export function getPublishedDispatches(): Dispatch[] {
  return dispatches.filter((d) => d.published);
}

export function getFeaturedDispatches(): Dispatch[] {
  return dispatches.filter((d) => d.published && d.featured);
}
