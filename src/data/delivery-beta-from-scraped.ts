/**
 * Beta delivery restaurants — generated at module load time from the
 * scraped menus + businesses.ts metadata. Surfaced through the same
 * delivery-restaurants helper functions so /deliver/[restaurant] +
 * cart UI work uniformly across PAL-confirmed and Beta restaurants.
 *
 * Pricing strategy: same 45% markup as PAL-confirmed (per Winston, set
 * customer expectations once — no surprise price jump when restaurants
 * graduate from Beta to formal partnership).
 *
 * Order flow for Beta differs from non-Beta — see DeliveryRestaurant.
 * isBeta in delivery-types.ts.
 *
 * Items WITHOUT a parseable price are excluded (you can't add unpriced
 * items to a cart). They remain visible on the encyclopedia detail page
 * via CallDirectView's selectBestMenu.
 */

import { businesses, type Business } from "./businesses";
import { SCRAPED } from "./restaurant-menus-scraped";
import type {
  DeliveryRestaurant,
  MenuCategory,
  MenuItem,
  DeliveryWindow,
  Weekday,
} from "./delivery-types";

// ============================================================
// Pricing parser
// ============================================================

/**
 * Parse a price string from a scraped menu into integer cents.
 * Returns null if no parseable amount (item should be excluded from cart).
 *
 * Handles:
 *   "$15.99"           → 1599
 *   "$14"              → 1400
 *   "$15.99 / $17.99"  → 1599 (takes the lower; sizes can be a future feature)
 *   "Cup $5.99 / Bowl $7.99" → 599
 *   "Reg $7.79 / Lg $11.99"  → 779
 *   "$10.99 ($12.99 with extras)" → 1099
 *   "Market" / "Market Price"     → null (excluded)
 *   undefined / ""                → null
 *   "$9.99/lb"         → 999 (per-lb pricing — operator confirms quantity)
 */
export function parsePriceToCents(raw: string | undefined): number | null {
  if (!raw) return null;
  // Match all $X.YY or $XX patterns
  const matches = Array.from(raw.matchAll(/\$\s*(\d+(?:\.\d{1,2})?)/g));
  if (matches.length === 0) return null;
  // Take the LOWEST price found (smallest size, regular vs large, etc.)
  const dollars = matches.map((m) => parseFloat(m[1]));
  const min = Math.min(...dollars);
  if (!Number.isFinite(min) || min <= 0) return null;
  return Math.round(min * 100);
}

// ============================================================
// Hours conversion
// ============================================================

/**
 * Convert a businesses.ts hoursOfOperation map into deliveryHours format.
 * Falls back to 11am-9pm M-Su if the source has no structured hours.
 *
 * Example input:
 *   { Monday: "11:00 AM – 9:00 PM", Tuesday: "Closed", ... }
 *
 * Skips closed days. Uses 11am-9pm default for entries we can't parse.
 */
const DEFAULT_BETA_HOURS: DeliveryWindow[] = [
  { day: "monday", open: "11:00", close: "21:00" },
  { day: "tuesday", open: "11:00", close: "21:00" },
  { day: "wednesday", open: "11:00", close: "21:00" },
  { day: "thursday", open: "11:00", close: "21:00" },
  { day: "friday", open: "11:00", close: "21:00" },
  { day: "saturday", open: "11:00", close: "21:00" },
  { day: "sunday", open: "11:00", close: "21:00" },
];

const DAY_MAP: Record<string, Weekday> = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
};

/** Parse "11:00 AM" or "9:30 PM" or "11AM" or "9 PM" → "HH:mm" 24h */
function parseTime12to24(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = (m[3] ?? "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function buildDeliveryHours(b: Business): DeliveryWindow[] {
  if (!b.hoursOfOperation) return DEFAULT_BETA_HOURS;
  const out: DeliveryWindow[] = [];
  for (const [dayName, range] of Object.entries(b.hoursOfOperation)) {
    const wkday = DAY_MAP[dayName];
    if (!wkday) continue;
    if (/closed/i.test(range)) continue;
    // Match "11:00 AM – 9:00 PM" or "11AM-9PM"
    const m = range.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[–-]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
    if (!m) continue;
    const open = parseTime12to24(m[1]);
    const close = parseTime12to24(m[2]);
    if (!open || !close) continue;
    out.push({ day: wkday, open, close });
  }
  return out.length > 0 ? out : DEFAULT_BETA_HOURS;
}

// ============================================================
// Beta restaurant builder
// ============================================================

interface BetaBundle {
  restaurants: DeliveryRestaurant[];
  categories: MenuCategory[];
  items: MenuItem[];
}

/**
 * Generate Beta delivery data from scraped menus. Excludes:
 *   - Restaurants without ANY priced items (can't be ordered from)
 *   - Restaurants in the RESERVATIONS bucket (sit-down only — listed in
 *     /deliver but not orderable)
 *   - Restaurants already in the curated PAL-delivery roster (Crazy Cajun)
 *
 * IDs are deterministic: "beta-{slug}", "beta-cat-{slug}-{section-slug}",
 * "beta-item-{slug}-{section-slug}-{item-slug}". Survives a code-reload
 * cleanly so cart-state + URLs in flight don't break across deploys.
 */
function buildBeta(): BetaBundle {
  const restaurants: DeliveryRestaurant[] = [];
  const categories: MenuCategory[] = [];
  const items: MenuItem[] = [];

  const RESERVATIONS = new Set([
    "venetian-hot-plate",
    "la-playa-mexican-grille",
    "roosevelts-tarpon-inn",
    "lisabellas-bistro",
  ]);
  const ALREADY_PAL_DELIVERY = new Set(["crazy-cajun"]);

  for (const scraped of SCRAPED) {
    if (RESERVATIONS.has(scraped.slug)) continue;
    if (ALREADY_PAL_DELIVERY.has(scraped.slug)) continue;

    const business = businesses.find((b) => b.slug === scraped.slug);
    if (!business) continue;

    const restaurantId = `beta-${scraped.slug}`;

    // Build categories + items in tandem — skip categories with zero
    // priced items.
    let sectionSort = 0;
    let totalPricedItems = 0;
    const tempCategories: MenuCategory[] = [];
    const tempItems: MenuItem[] = [];
    for (const section of scraped.menu) {
      const sectionSlug = section.section
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const categoryId = `beta-cat-${scraped.slug}-${sectionSlug}`;
      let itemSort = 0;
      let pricedInSection = 0;
      for (const item of section.items) {
        const cents = parsePriceToCents(item.price);
        if (cents === null) continue; // skip unpriced
        const itemSlug = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        tempItems.push({
          id: `beta-item-${scraped.slug}-${sectionSlug}-${itemSlug}`,
          restaurantId,
          categoryId,
          name: item.name,
          description: item.description,
          basePriceCents: cents,
          isAvailable: true,
          sort: itemSort++,
        });
        pricedInSection++;
        totalPricedItems++;
      }
      if (pricedInSection > 0) {
        tempCategories.push({
          id: categoryId,
          restaurantId,
          name: section.section,
          sort: sectionSort++,
        });
      }
    }

    if (totalPricedItems === 0) continue; // no orderable items, skip restaurant

    restaurants.push({
      id: restaurantId,
      slug: scraped.slug,
      name: business.name,
      pickupAddress: business.address,
      pickupNotes: `BETA — call ahead before pickup. ${business.phone ?? ""}`.trim(),
      phone: business.phone,
      businessSlug: business.slug,
      shortDescription: business.tagline,
      cuisineTags: business.tags?.slice(0, 3) ?? [],
      accent: "#1e40af", // Beta blue accent (vs coral/red for confirmed)
      deliveryHours: buildDeliveryHours(business),
      // Conditioning rule (Winston, 2026-05-02): same 45% markup as PAL-
      // confirmed restaurants. No "Beta discount" — set price expectations
      // from day one so customers don't feel a price jump when the
      // restaurant graduates to a formal partner.
      markupPct: 45,
      isActive: true,
      isBeta: true,
      kind: "restaurant",
    });
    categories.push(...tempCategories);
    items.push(...tempItems);
  }

  return { restaurants, categories, items };
}

const BETA = buildBeta();

export const BETA_RESTAURANTS: DeliveryRestaurant[] = BETA.restaurants;
export const BETA_CATEGORIES: MenuCategory[] = BETA.categories;
export const BETA_MENU_ITEMS: MenuItem[] = BETA.items;
