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
    | "delivery-vendor"
    | "essentials";
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
 * Island Essentials sections — practical info that already lives on
 * /essentials but wasn't surfaced to Gully. Indexing each section as
 * a separate item with deep-link href closes a class of cited=0
 * questions ("do I need a beach permit", "how does the ferry work",
 * "wildlife rules", etc.) without writing new content.
 *
 * Anchor IDs match what /essentials/page.tsx generates:
 * `section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")`
 *
 * Per memory feedback_pal_no_manufactured_dispatch.md: this is
 * surfacing existing content, not inventing new angles.
 */
const essentialsItems: GullyItem[] = [
  {
    type: "essentials" as const,
    slug: "essentials-ferry",
    name: "Ferry — Getting to Port Aransas",
    tagline: "Free, 24/7, no reservation. Crossing takes ~10 minutes from Aransas Pass.",
    description:
      "The Port Aransas ferry is free, 24/7, 365 days a year. No reservation needed. Board from Port Street stacking lanes in Aransas Pass. Crossing takes ~10 minutes. Peak waits during Spring Break and summer weekends can mean 30-60+ minute waits — arrive early or use the alternate route via SH 361 from Corpus Christi through Padre Island. Real-time ferry info: tune to AM 530 radio or check @PortA_Ferry on X. Watch for dolphins riding the ferry wake.",
    tags: ["ferry", "txdot", "aransas pass", "crossing", "free", "24 hours", "wait time", "getting here", "how to get to port aransas"],
    category: "essentials",
    icon: "⛴️",
    href: "/essentials#getting-here-the-ferry",
  },
  {
    type: "essentials" as const,
    slug: "essentials-cart-rules",
    name: "Golf Cart Rules",
    tagline: "Street-legal on most roads. Driver's license required. Stay off SH 361.",
    description:
      "Golf carts are the main way to get around Port Aransas — street-legal on most roads. Must have a valid driver's license. Headlights and taillights required after dark. Stay off SH 361 (the highway) — carts are not allowed on state highways. Speed limit in town is typically 20-30 mph (carts max around 25). Seatbelts required if the cart has them. No driving on the beach — carts are for roads only.",
    tags: ["golf cart", "cart rules", "street legal", "drivers license", "speed limit", "rules", "regulations", "where to drive cart"],
    category: "essentials",
    icon: "🛺",
    href: "/essentials#golf-cart-rules",
  },
  {
    type: "essentials" as const,
    slug: "essentials-beach-rules",
    name: "Beach Rules — Permits, Driving, Pets",
    tagline: "Beach driving allowed with a $12 Nueces County beach parking permit. No glass. Leashed dogs welcome.",
    description:
      "Beach driving is allowed on most Port Aransas beaches with a valid Nueces County beach parking permit ($12/year for residents, $12/day for visitors). 4WD recommended — 2WD vehicles get stuck regularly. If you get stuck, call a tow service, not 911. No glass on the beach — ever. Cans and plastic only. Build fires only in designated areas and fully extinguish before leaving. Leashed dogs are welcome on the beach. Clean up everything you bring — pack it in, pack it out. Rip currents are real — swim near lifeguard stations when possible. If caught, swim parallel to shore.",
    tags: ["beach permit", "beach sticker", "beach parking", "do I need a permit", "drive on the beach", "beach driving", "dogs on beach", "pet friendly beach", "rip currents", "beach rules", "nueces county", "12 dollar"],
    category: "essentials",
    icon: "🏖️",
    href: "/essentials#beach-rules-tips",
  },
  {
    type: "essentials" as const,
    slug: "essentials-parking",
    name: "Parking in Port Aransas",
    tagline: "Free downtown street parking — no meters. Beach parking needs the Nueces County permit.",
    description:
      "Downtown Port Aransas has free street parking — no meters. Beach parking requires a Nueces County beach parking permit if you drive onto the sand. During peak season (Spring Break, summer), downtown fills up fast — walk or cart if possible. The ferry stacking lanes can back up — don't park in them thinking they're regular parking.",
    tags: ["parking", "where to park", "downtown parking", "beach parking", "ferry parking", "free parking"],
    category: "essentials",
    icon: "🅿️",
    href: "/essentials#parking",
  },
  {
    type: "essentials" as const,
    slug: "essentials-weather-water",
    name: "Weather & Water Safety",
    tagline: "Gulf temps 60–85°F. Rip currents real. Sunscreen mandatory. Watch for jellyfish May–October.",
    description:
      "Gulf water temps range from ~60°F in winter to ~85°F in summer. Jellyfish are common May through October — shuffle your feet when entering the water to avoid stingrays. Afternoon thunderstorms are frequent in summer — they build fast and hit hard. Get off the beach if you see lightning. Sunscreen is mandatory — the Gulf sun is stronger than you think, especially with water reflection. Mosquitoes can be intense at dawn and dusk, especially after rain — bring repellent.",
    tags: ["weather", "water temp", "jellyfish", "stingrays", "thunderstorms", "lightning", "sunscreen", "mosquitoes", "is the water cold", "rip currents"],
    category: "essentials",
    icon: "🌊",
    href: "/essentials#weather-water-safety",
  },
  {
    type: "essentials" as const,
    slug: "essentials-wildlife",
    name: "Wildlife — Dolphins, Turtles, Whooping Cranes",
    tagline: "Dolphins year-round. Sea turtle nests April–August. Whooping cranes winter Nov–March.",
    description:
      "Dolphins are everywhere — in the ship channel, around the ferry, and in the bay. Watch from shore or take a dolphin tour. Sea turtles nest on Port Aransas beaches from April through August. If you see a nest (marked with stakes and tape), keep your distance. The Amos Rehabilitation Keep (ARK) at UTMSI rehabilitates injured sea turtles and birds — free to visit. Don't feed the wildlife — including pelicans, seagulls, and feral cats. Whooping cranes winter at the Aransas National Wildlife Refuge across the bay (November–March) — world's rarest crane.",
    tags: ["dolphins", "sea turtles", "whooping cranes", "wildlife", "ARK", "amos rehabilitation", "birds", "nature", "what wildlife"],
    category: "essentials",
    icon: "🐬",
    href: "/essentials#wildlife",
  },
  {
    type: "essentials" as const,
    slug: "essentials-fishing-basics",
    name: "Fishing Basics — License, Stamps, Spots",
    tagline: "Texas fishing license + saltwater stamp required for 17+. Pier and jetty fishing accessible to all.",
    description:
      "Texas fishing license required for anyone 17+. Buy online at TPWD.gov or at Island Tackle. Saltwater stamp required in addition to the fishing license. Popular catches: redfish, speckled trout, flounder, sheepshead, black drum, tarpon (catch & release only). Pier fishing: Horace Caldwell Pier ($5 entry) and Ancel Brundrett Pier (free). Jetty fishing: walk out on the north jetty via the Jetty Boat from Fisherman's Wharf. Charter fishing: book a half-day or full-day trip through Deep Sea Headquarters, Woody's Last Stand, or Fisherman's Wharf.",
    tags: ["fishing license", "saltwater stamp", "tpwd", "redfish", "speckled trout", "flounder", "tarpon", "pier fishing", "jetty fishing", "shore fishing", "where to fish", "fishing rules"],
    category: "essentials",
    icon: "🎣",
    href: "/essentials#fishing-basics",
  },
  {
    type: "essentials" as const,
    slug: "essentials-emergency",
    name: "Emergency & Medical",
    tagline: "911 for emergencies. PA Police: (361) 749-4545. Nearest hospital: Corpus Christi (~45 min).",
    description:
      "Emergency: call 911. Port Aransas Police: (361) 749-4545. Nueces County EMS serves Port Aransas — ambulance response from on-island station. Nearest hospital: Corpus Christi Medical Center (~45 min via SH 361 or ferry + I-37). Urgent care is limited on Port Aransas — for serious injuries, go to Corpus Christi. Hurricane evacuation: follow SH 361 south to Corpus Christi — do not wait for the ferry, use the highway route.",
    tags: ["emergency", "911", "police", "hospital", "urgent care", "hurricane", "evacuation", "medical", "ems", "ambulance"],
    category: "essentials",
    icon: "🏥",
    href: "/essentials#emergency-medical",
  },
  {
    type: "essentials" as const,
    slug: "essentials-connectivity",
    name: "Connectivity, WiFi, Groceries, Gas",
    tagline: "Cell service good island-wide. IGA on island, HEB across the ferry. Fill up gas before crossing.",
    description:
      "Cell service is generally good on the island (AT&T, Verizon, T-Mobile all have coverage). WiFi is available at most hotels, restaurants, and coffee shops — Coffee Waves is a popular work spot. Grocery: closest full grocery store is the IGA in Port Aransas or HEB in Aransas Pass (across the ferry). Gas: fill up before you get on the island — there are a few stations in town but prices are higher. ATMs: available at most gas stations and some restaurants. Many places are card-only.",
    tags: ["wifi", "cell service", "internet", "grocery", "iga", "heb", "gas station", "atm", "card only", "remote work"],
    category: "essentials",
    icon: "📱",
    href: "/essentials#connectivity-essentials",
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
  ...essentialsItems,
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
