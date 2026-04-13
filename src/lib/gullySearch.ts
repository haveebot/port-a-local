import Fuse from "fuse.js";
import { businesses } from "@/data/businesses";
import { stories } from "@/data/stories";
import { archivePhotos } from "@/data/archives";

export interface GullyItem {
  type: "business" | "story" | "archive";
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  category: string;
  /** Flattened menu item names — internal search fuel, not displayed */
  menuItems?: string[];
  /** Business-specific */
  featured?: boolean;
  hoursOfOperation?: Record<string, string>;
  hours?: string;
  /** Story-specific */
  icon?: string;
  readTime?: string;
}

const businessItems: GullyItem[] = businesses.map((b) => ({
  type: "business" as const,
  slug: b.slug,
  name: b.name,
  tagline: b.tagline,
  description: b.description,
  tags: b.tags,
  category: b.category,
  featured: b.featured,
  hoursOfOperation: b.hoursOfOperation,
  hours: b.hours,
  menuItems: b.menu?.flatMap((s) => s.items.map((i) => i.name)) ?? [],
}));

const storyItems: GullyItem[] = stories
  .filter((s) => s.published)
  .map((s) => ({
    type: "story" as const,
    slug: s.slug,
    name: s.title,
    tagline: s.subtitle,
    description: s.description,
    tags: s.tags,
    category: s.category,
    icon: s.icon,
    readTime: s.readTime,
  }));

const archiveItems: GullyItem[] = archivePhotos.map((p) => ({
  type: "archive" as const,
  slug: p.id,
  name: p.title,
  tagline: p.description.slice(0, 120),
  description: p.description,
  tags: p.tags,
  category: "archives",
  icon: "🏛️",
}));

export const gullyItems: GullyItem[] = [...businessItems, ...storyItems, ...archiveItems];

export const gullyFuse = new Fuse(gullyItems, {
  keys: [
    { name: "name", weight: 3 },
    { name: "tagline", weight: 2 },
    { name: "tags", weight: 2 },
    { name: "menuItems", weight: 1.5 },
    { name: "description", weight: 1 },
    { name: "category", weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
});

export function getGullyHref(item: GullyItem): string {
  if (item.type === "story") return `/history/${item.slug}`;
  if (item.type === "archive") return `/archives`;
  return `/${item.category}/${item.slug}`;
}
