/**
 * Server-trusted catalog of beach booking products.
 *
 * The /api/checkout/beach route MUST compute Stripe `unit_amount` from
 * THIS file, never from the client-supplied request body — otherwise an
 * attacker can POST `totalPrice: 0.01` and book a $300 cabana for a penny.
 *
 * Source of truth for both:
 *   - the public booking form at /beach
 *   - the checkout creation route at /api/checkout/beach
 */

export interface BeachProduct {
  value: string;
  label: string;
  description: string;
  /** Vendor's daily take in cents (paid out via Stripe Connect). */
  vendorBaseCents: number;
  /** PAL's daily booking fee in cents (retained on the platform side). */
  palFeeCents: number;
}

export const BEACH_PRODUCTS: readonly BeachProduct[] = [
  {
    value: "cabana",
    label: "Cabana Setup",
    description: "Full beach cabana — shade, comfort, the works.",
    vendorBaseCents: 27500, // $275 vendor take
    palFeeCents: 2500, // $25 PAL booking fee
  },
  {
    value: "chairs",
    label: "Chair & Umbrella Setup",
    description: "Two chairs and a beach umbrella, set up and ready to go.",
    vendorBaseCents: 7500, // $75 vendor take
    palFeeCents: 1000, // $10 PAL booking fee
  },
];

export function getBeachProduct(slug: string): BeachProduct | null {
  return BEACH_PRODUCTS.find((p) => p.value === slug) ?? null;
}

/** Total daily charge to the customer (cents) — vendor + PAL fee. */
export function dailyTotalCents(p: BeachProduct): number {
  return p.vendorBaseCents + p.palFeeCents;
}
