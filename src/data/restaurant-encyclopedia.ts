/**
 * Restaurant Encyclopedia — the unified food index for Port Aransas.
 *
 * Joins two existing data sources to surface every known restaurant on
 * one /deliver surface:
 *   - businesses.ts (39 editorial /eat picks, with menus + descriptions)
 *   - delivery-restaurants.ts (3 PAL-delivery operations with full
 *     structured menus + cart support)
 *
 * Each spot is classified into a state for the UI to render the right
 * affordance ("Order through PAL" button vs. "Call to order" CTA):
 *
 *   pal-delivery — PAL operates delivery; full order flow lives at
 *                  /deliver/[restaurant]
 *   call-direct  — Restaurant exists in our directory but PAL doesn't
 *                  yet deliver from them. Show menu summary + phone CTA;
 *                  later we can convert these one at a time.
 *
 * The "encyclopedia" framing is editorial: PAL aims to be THE food index
 * for the island, not just a 3-restaurant delivery app. The /eat ones
 * are reachable directly; the PAL-delivery ones get the order flow on top.
 */

import { businesses, type Business } from "./businesses";
import { RESTAURANTS as DELIVERY_RESTAURANTS } from "./delivery-restaurants";
import type { DeliveryRestaurant } from "./delivery-types";

export type FoodSpotState = "pal-delivery" | "call-direct" | "reservations";

/**
 * Slugs of restaurants that are sit-down/fine-dining and don't do takeout
 * or delivery. CTA on these pages is "Call for reservations" instead of
 * "Call to order." Source-of-truth: editorial call by Winston (per
 * 2026-05-02 — La Playa / Roosevelt's / Lisabella's all confirmed by
 * the operator as no-takeout fine dining). Add slugs here as the
 * encyclopedia grows.
 */
const RESERVATIONS_SLUGS = new Set<string>([
  "la-playa-mexican-grille",
  "roosevelts-tarpon-inn",
  "lisabellas-bistro",
  "venetian-hot-plate",
]);

export interface FoodSpot {
  /** Unified slug — uses the businesses.ts slug when joinable, else the
   *  delivery-restaurants slug. URLs at /deliver/[slug] resolve here. */
  slug: string;
  name: string;
  /** Public-facing description (1-2 sentences). Pulled from businesses.tagline
   *  when available, else delivery-restaurants.shortDescription. */
  tagline: string;
  /** Longer prose for detail page. Only set if businesses.ts has it. */
  description?: string;
  cuisineTags: string[];
  address?: string;
  phone?: string;
  website?: string;
  /** Operating hours summary string. From businesses.hours if present. */
  hours?: string;
  /** State drives the CTA affordance */
  state: FoodSpotState;
  /** When state==='pal-delivery', this points to the delivery row */
  delivery?: DeliveryRestaurant;
  /** When state==='call-direct', this points to the businesses.ts row */
  business?: Business;
  /** Featured flag from businesses.ts — surface featured spots first */
  featured: boolean;
}

/**
 * Build the unified spot list. Priority rules when both sources have an
 * entry for the same restaurant (currently only Crazy Cajun):
 *   - state inherits from delivery (pal-delivery wins)
 *   - tagline + description prefer businesses.ts (richer editorial copy)
 *   - menu data lives on the delivery side anyway
 */
export function getAllFoodSpots(): FoodSpot[] {
  const spots: FoodSpot[] = [];
  const businessByDeliverySlug = new Map<string, Business>();

  // Index businesses.ts by their delivery-cross-reference (where set).
  // delivery-restaurants.ts uses `businessSlug` as the foreign key.
  for (const d of DELIVERY_RESTAURANTS) {
    if (!d.isActive) continue;
    const b = businesses.find(
      (x) =>
        x.slug === d.businessSlug ||
        x.slug === d.slug ||
        // Tolerant fallback: case-insensitive name match
        x.name.toLowerCase().includes(d.name.toLowerCase().replace(/^the\s+/i, "")),
    );
    if (b) businessByDeliverySlug.set(d.slug, b);
  }

  // 1) Add all PAL-delivery spots first (these win)
  for (const d of DELIVERY_RESTAURANTS) {
    if (!d.isActive) continue;
    const b = businessByDeliverySlug.get(d.slug);
    spots.push({
      slug: d.slug,
      name: b?.name ?? d.name,
      tagline: b?.tagline ?? d.shortDescription,
      description: b?.description,
      cuisineTags: d.cuisineTags ?? [],
      address: b?.address ?? d.pickupAddress,
      phone: b?.phone ?? d.phone,
      website: b?.website,
      hours: b?.hours,
      state: "pal-delivery",
      delivery: d,
      business: b,
      featured: b?.featured ?? false,
    });
  }

  // 2) Add the rest of the eat directory (deduped against PAL-delivery)
  const palBusinessSlugs = new Set(
    Array.from(businessByDeliverySlug.values()).map((b) => b.slug),
  );
  for (const b of businesses) {
    if (b.category !== "eat") continue;
    if (palBusinessSlugs.has(b.slug)) continue; // already added as PAL
    const state: FoodSpotState = RESERVATIONS_SLUGS.has(b.slug)
      ? "reservations"
      : "call-direct";
    spots.push({
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      description: b.description,
      cuisineTags: b.tags ?? [],
      address: b.address,
      phone: b.phone,
      website: b.website,
      hours: b.hours,
      state,
      business: b,
      featured: b.featured,
    });
  }

  // Sort by state priority (pal-delivery > call-direct > reservations),
  // featured first within each state, then alphabetical
  const stateOrder: Record<FoodSpotState, number> = {
    "pal-delivery": 0,
    "call-direct": 1,
    reservations: 2,
  };
  return spots.sort((a, b) => {
    if (a.state !== b.state) return stateOrder[a.state] - stateOrder[b.state];
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Lookup a single spot by its unified slug. */
export function getFoodSpotBySlug(slug: string): FoodSpot | null {
  return getAllFoodSpots().find((s) => s.slug === slug) ?? null;
}

/** Convenience splitters for the index page */
export function splitByState(spots: FoodSpot[]): {
  palDelivery: FoodSpot[];
  callDirect: FoodSpot[];
  reservations: FoodSpot[];
} {
  return {
    palDelivery: spots.filter((s) => s.state === "pal-delivery"),
    callDirect: spots.filter((s) => s.state === "call-direct"),
    reservations: spots.filter((s) => s.state === "reservations"),
  };
}
