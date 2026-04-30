import Fuse from "fuse.js";
import { businesses, type Business } from "@/data/businesses";
import { stories } from "@/data/stories";
import { dispatches } from "@/data/dispatches";
import { archivePhotos } from "@/data/archives";
import { RESTAURANTS } from "@/data/delivery-restaurants";

/**
 * Derive synthetic tag signals from existing business data so Fuse can
 * surface businesses for tourist-flavored queries without us hand-tagging
 * every entry. Reads tagline + description + amenities + menu names +
 * hoursOfOperation and emits canonical signal tags.
 *
 * Why: pre-Lever-B, "best happy hour", "where to eat with kids", "what's
 * open late", "pet friendly", "breakfast", "sunset spot" all returned
 * cited=0 because the relevant info exists in the entries but isn't
 * tagged. This pulls it through.
 *
 * Conservative — signal must be explicit in source text/hours, not
 * inferred. If a business doesn't actually serve breakfast, we won't
 * tag it just because it opens early.
 */
function deriveTagSignals(b: Business): string[] {
  const signals: string[] = [];
  const menuText =
    b.menu?.flatMap((s) => [
      s.section,
      ...s.items.map((i) => `${i.name} ${i.description ?? ""}`),
    ]) ?? [];
  const haystack = [
    b.tagline,
    b.description,
    ...(b.amenities ?? []),
    ...menuText,
  ]
    .join(" ")
    .toLowerCase();
  const hoursValues = b.hoursOfOperation
    ? Object.values(b.hoursOfOperation)
    : [];

  // Kid / family friendly — explicit mention only
  if (/\bkid|\bfamily-?friendly|all ages|kids? menu|kid's menu|for kids|with kids/.test(haystack)) {
    signals.push("kid friendly", "kids", "family friendly", "with kids", "for kids");
  }
  // Pet / dog friendly
  if (/\bpet[- ]?friendly|\bdog[- ]?friendly|dogs welcome|dogs allowed|pups? welcome/.test(haystack)) {
    signals.push("pet friendly", "dog friendly", "pets", "dogs");
  }
  // Happy hour
  if (/happy hour|drink special|2[-\s]for[-\s]1|two[-\s]for[-\s]one/.test(haystack)) {
    signals.push("happy hour", "drink specials");
  }
  // Breakfast — must say so explicitly OR open before 9am
  const opensEarly = hoursValues.some((h) =>
    /^\s*(6|7|8):\d{2}\s*AM/i.test(h),
  );
  if (/breakfast|brunch|pancake|biscuit|omelet|breakfast taco|kolache/.test(haystack) || opensEarly) {
    signals.push("breakfast", "morning", "early");
  }
  // Late night — open past 10pm OR explicit
  const opensLate = hoursValues.some((h) =>
    /\b(10|11):\d{2}\s*PM\b|midnight|12:00\s*AM/i.test(h),
  );
  if (opensLate || /late[- ]night|after hours|open late/.test(haystack)) {
    signals.push("late night", "open late", "after hours");
  }
  // Sunset / waterfront views
  if (/sunset|waterfront|harbor view|bay view|beach view|water view/.test(haystack)) {
    signals.push("sunset", "view", "waterfront");
  }
  // Outdoor seating / patio
  if (/\bpatio\b|\bdeck\b|terrace|outdoor seat|outside seat|al fresco/.test(haystack)) {
    signals.push("outdoor seating", "patio", "outside");
  }
  // Live music
  if (/live music|live band|acoustic|karaoke|open mic/.test(haystack)) {
    signals.push("live music", "music");
  }
  // Coffee
  if (/\bcoffee|espresso|latte|cappuccino|cold brew/.test(haystack)) {
    signals.push("coffee", "cafe");
  }
  // Beer / brewery
  if (/\bbeer\b|brewery|craft beer|tap room|on tap|ipa\b|lager|pilsner/.test(haystack)) {
    signals.push("beer", "brewery");
  }

  return signals;
}

export interface GullyItem {
  type:
    | "business"
    | "story"
    | "dispatch"
    | "archive"
    | "portal"
    | "delivery-vendor";
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
  /** Portal-specific — used by getGullyHref to route correctly */
  href?: string;
}

const businessItems: GullyItem[] = businesses.map((b) => ({
  type: "business" as const,
  slug: b.slug,
  name: b.name,
  tagline: b.tagline,
  description: b.description,
  // Author-provided tags + synthetic signals derived from entry text
  // (see deriveTagSignals above). De-duped so a business that already
  // carries "happy hour" doesn't get it twice.
  tags: Array.from(new Set([...b.tags, ...deriveTagSignals(b)])),
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

const dispatchItems: GullyItem[] = dispatches
  .filter((d) => d.published)
  .map((d) => ({
    type: "dispatch" as const,
    slug: d.slug,
    name: d.title,
    tagline: d.subtitle,
    description: d.description,
    tags: d.tags,
    category: d.category,
    icon: d.icon,
    readTime: d.readTime,
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

/**
 * PAL revenue portals. Hardcoded so they always rank when someone
 * searches "delivery", "rent", "services", etc. — without these,
 * Gully only finds matching directory listings, not the actual
 * portal landing pages.
 */
const portalItems: GullyItem[] = [
  {
    type: "portal" as const,
    slug: "deliver",
    name: "PAL Delivery",
    tagline: "Local food + convenience runs to your beach house",
    description:
      "Order from real Port Aransas restaurants and convenience stores. Local runners pick up and deliver. SMS at every step. Tip 100% to runner.",
    tags: [
      "delivery",
      "deliveries",
      "food",
      "restaurants",
      "convenience",
      "order",
      "to-go",
      "runner",
    ],
    category: "delivery",
    icon: "🍽️",
    href: "/deliver",
  },
  {
    type: "portal" as const,
    slug: "deliver-runners",
    name: "Drive for PAL — runner leaderboard",
    tagline: "Real cash, your schedule, your bank every delivery",
    description:
      "PAL Delivery runs on locals. See what runners are earning this week and apply to drive. No app, no quotas, no algorithm.",
    tags: [
      "drive",
      "driver",
      "runner",
      "delivery",
      "side income",
      "earn",
      "apply",
      "stripe",
      "leaderboard",
    ],
    category: "delivery",
    icon: "🚗",
    href: "/deliver/runners",
  },
  {
    type: "portal" as const,
    slug: "rent",
    name: "Golf Cart Rentals",
    tagline: "Reserve a cart from a vetted local company — $20 off standard rates",
    description:
      "Pick your dates, lock in with a $10/day reservation fee. We blast your request to 20 local cart companies and the first to claim wins. Pickup or delivery — vendor's call. Guaranteed $20 off the standard rate.",
    tags: [
      "rent",
      "rental",
      "rentals",
      "golf cart",
      "cart",
      "carts",
      "reserve",
      "vendor",
      "marketplace",
    ],
    category: "rent",
    icon: "🛻",
    href: "/rent",
  },
  {
    type: "portal" as const,
    slug: "beach",
    name: "Beach Rentals",
    tagline: "Cabanas, chairs, umbrellas — delivered to the sand",
    description:
      "Beach setup delivered straight to your spot. Cabana ($300/day) or chairs + umbrella ($85/day). Local crew handles setup and breakdown.",
    tags: [
      "beach",
      "rental",
      "rentals",
      "cabana",
      "chair",
      "umbrella",
      "setup",
    ],
    category: "beach",
    icon: "🏖️",
    href: "/beach",
  },
  {
    type: "portal" as const,
    slug: "maintenance",
    name: "Maintenance Dispatch",
    tagline: "Plumbing, electrical, AC, repairs — fast",
    description:
      "Submit a maintenance request — Standard (free, next-day) or Emergency Priority Dispatch ($20, within 4 hours, 7am-8pm). Local trusted vendor handles the work.",
    tags: [
      "maintenance",
      "service",
      "services",
      "repair",
      "handyman",
      "plumbing",
      "electrical",
      "ac",
      "hvac",
      "emergency",
      "priority dispatch",
    ],
    category: "services",
    icon: "🔧",
    href: "/maintenance",
  },
  {
    type: "portal" as const,
    slug: "housekeeping",
    name: "Housekeeping",
    tagline: "Book a cleaning — $100/hr, 1-hour minimum",
    description:
      "Book a vacation-rental cleaning by square footage. Roughly an hour per 1,000 sqft. Pay up front via Stripe, we coordinate exact timing. Standard, deep, and move-out cleans available.",
    tags: [
      "housekeeping",
      "house keeping",
      "cleaning",
      "cleaner",
      "clean",
      "maid",
      "turnover",
      "deep clean",
      "move out",
      "move-out",
      "rental cleaning",
      "vacation rental",
      "service",
      "services",
    ],
    category: "services",
    icon: "🧹",
    href: "/housekeeping",
  },
  {
    type: "portal" as const,
    slug: "locals",
    name: "Locals — rent + hire",
    tagline: "Things locals own (and skills locals offer)",
    description:
      "Beta marketplace: rent gear from a local (kayaks, paddleboards, beach gear) or hire a local for a service (charters, lessons, projects). Browse → request a quote → we connect.",
    tags: [
      "locals",
      "rent",
      "hire",
      "rental",
      "service",
      "kayak",
      "paddleboard",
      "charter",
      "marketplace",
    ],
    category: "locals",
    icon: "🤝",
    href: "/locals",
  },
];

/**
 * Restaurants + stores in the PAL Delivery catalog. Lets customers
 * Gully-search "Crazy Cajun" or "Lowe's Market" and land directly on
 * the menu page (not just the parent /deliver index).
 */
const deliveryVendorItems: GullyItem[] = RESTAURANTS.filter(
  (r) => r.isActive,
).map((r) => ({
  type: "delivery-vendor" as const,
  slug: r.slug,
  name: r.name,
  tagline: r.shortDescription,
  description: r.shortDescription,
  tags: [
    ...r.cuisineTags.map((t) => t.toLowerCase()),
    "delivery",
    "deliveries",
    r.kind === "store" ? "convenience" : "restaurant",
    r.kind === "store" ? "essentials" : "food",
  ],
  category: "delivery",
  icon: r.kind === "store" ? "🛒" : "🍽️",
  href: `/deliver/${r.slug}`,
}));

export const gullyItems: GullyItem[] = [
  ...portalItems,
  ...deliveryVendorItems,
  ...businessItems,
  ...storyItems,
  ...dispatchItems,
  ...archiveItems,
];

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
  if (item.href) return item.href;
  if (item.type === "story") return `/history/${item.slug}`;
  if (item.type === "dispatch") return `/dispatch/${item.slug}`;
  if (item.type === "archive") return `/archives`;
  return `/${item.category}/${item.slug}`;
}
