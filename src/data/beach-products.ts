/**
 * Server-trusted catalog of beach booking products + add-ons.
 *
 * The /api/checkout/beach route MUST compute Stripe `unit_amount` from
 * THIS file, never from the client-supplied request body — otherwise an
 * attacker can POST `totalPrice: 0.01` and book a $300 setup for a penny.
 *
 * Source of truth for:
 *   - the public booking form at /beach (product card + included items + add-on picker)
 *   - the checkout creation route at /api/checkout/beach (pricing)
 *   - the booking-request + paid-confirmation emails (product label)
 *   - the vendor-blast SMS (smsNoun)
 */

export interface BeachProduct {
  value: string;
  label: string;
  /** One-line tagline shown under the product label on the booking card. */
  description: string;
  /** Optional bulleted list of what comes with the setup. */
  includes?: readonly string[];
  /** Vendor's daily take in cents (paid out via Stripe Connect). */
  vendorBaseCents: number;
  /** PAL's daily booking fee in cents (retained on the platform side). */
  palFeeCents: number;
  /**
   * Optional SMS wording for the vendor-blast lead text. Falls back to
   * `${qty} × ${label}` when omitted. `suffix` is appended in parens.
   */
  smsNoun?: {
    singular: string;
    plural: string;
    suffix?: string;
  };
  /**
   * If defined, the vendor-blast SMS only goes to vendors whose `slug` is
   * in this list (intersected with the active+smsCapable filter). Used to
   * keep specialised products (e.g. the Beach Rig — only Tyler has the
   * trailer) routed correctly. Undefined = blast to all active vendors.
   */
  vendorSlugs?: readonly string[];
}

/**
 * Primary beach setups. Customer picks exactly one as the base of the booking.
 */
export const BEACH_PRODUCTS: readonly BeachProduct[] = [
  {
    value: "chairs",
    label: "2 Beach Chairs & Umbrella",
    description: "The classic — two chairs and a beach umbrella, set up and ready to go.",
    vendorBaseCents: 6000, // $60 vendor take
    palFeeCents: 2000, // $20 PAL booking fee
    smsNoun: { singular: "chair-set", plural: "chair-sets", suffix: "2 chairs + umbrella each" },
    vendorSlugs: ["brons-reservations", "brons-bron-cell", "brons-kristen"],
  },
  {
    value: "shibumi",
    label: "4 Beach Chairs & Shibumi Shade",
    description: "Four chairs and a Shibumi shade cover — the upgrade for groups.",
    includes: [
      "4 beach chairs",
      "Shibumi shade cover",
    ],
    vendorBaseCents: 14000, // $140 vendor take
    palFeeCents: 4000, // $40 PAL booking fee
    smsNoun: { singular: "Shibumi setup", plural: "Shibumi setups", suffix: "4 chairs + Shibumi shade" },
    vendorSlugs: ["brons-reservations", "brons-bron-cell", "brons-kristen"],
  },
  {
    value: "beach-rig",
    label: "The Beach Rig",
    description: "Our full-day rolling setup — a 16-foot beach trailer rigged with everything you need.",
    includes: [
      "16-foot beach trailer",
      "10 chairs (6 loungers + 4 fold-out)",
      "2 fold-out tables",
      "2 ice chests",
      "12×12 attached shade cloth",
      "2 umbrellas",
    ],
    vendorBaseCents: 40000, // $400 vendor take
    palFeeCents: 5000, // $50 PAL booking fee
    smsNoun: { singular: "Beach Rig", plural: "Beach Rigs", suffix: "16-ft trailer + chairs + shade + ice chests" },
    vendorSlugs: ["tyler"],
  },
];

/**
 * Add-ons — flat $25/day each. Cannot be rented individually; must be
 * attached to one of BEACH_PRODUCTS at checkout. Customer can pick any
 * quantity per add-on (0–N).
 */
export const BEACH_ADDONS: readonly BeachProduct[] = [
  {
    value: "addon-boogie",
    label: "Boogie Board",
    description: "Add a boogie board to your setup.",
    vendorBaseCents: 2200, // $22 vendor take
    palFeeCents: 300, // $3 PAL booking fee
    smsNoun: { singular: "boogie board", plural: "boogie boards" },
  },
  {
    value: "addon-chair",
    label: "Beach Chair",
    description: "Add an extra chair to your setup.",
    vendorBaseCents: 2200,
    palFeeCents: 300,
    smsNoun: { singular: "extra chair", plural: "extra chairs" },
  },
  {
    value: "addon-umbrella",
    label: "Umbrella",
    description: "Add an extra umbrella to your setup.",
    vendorBaseCents: 2200,
    palFeeCents: 300,
    smsNoun: { singular: "extra umbrella", plural: "extra umbrellas" },
  },
];

/** Look up a product OR add-on by slug. Returns null on miss. */
export function getBeachProduct(slug: string): BeachProduct | null {
  return (
    BEACH_PRODUCTS.find((p) => p.value === slug) ??
    BEACH_ADDONS.find((p) => p.value === slug) ??
    null
  );
}

/** Look up an add-on by slug. Returns null if slug isn't an add-on. */
export function getBeachAddon(slug: string): BeachProduct | null {
  return BEACH_ADDONS.find((p) => p.value === slug) ?? null;
}

/** Resolve a slug to its customer-facing label, or echo the slug on miss. */
export function getBeachProductLabel(slug: string): string {
  return getBeachProduct(slug)?.label ?? slug;
}

/** Total daily charge to the customer (cents) — vendor + PAL fee. */
export function dailyTotalCents(p: BeachProduct): number {
  return p.vendorBaseCents + p.palFeeCents;
}

/** SMS-friendly noun phrase for vendor-blast wording. */
export function productSmsLabel(product: string, qty: number): string {
  const p = getBeachProduct(product);
  if (!p?.smsNoun) {
    return `${qty} × ${p?.label ?? product}`;
  }
  const noun = qty === 1 ? p.smsNoun.singular : p.smsNoun.plural;
  const base = `${qty} ${noun}`;
  return p.smsNoun.suffix ? `${base} (${p.smsNoun.suffix})` : base;
}

/**
 * Serialised add-on selection as it flows through the booking pipeline.
 * Encoded as JSON in Stripe metadata (key: "addons").
 */
export type BeachAddonSelection = Record<string, number>;

/** Render add-on selections as a human-readable inline string. */
export function addonsSmsSummary(selection: BeachAddonSelection): string {
  const parts: string[] = [];
  for (const [slug, qty] of Object.entries(selection)) {
    if (!qty || qty < 1) continue;
    parts.push(productSmsLabel(slug, qty));
  }
  return parts.join(" + ");
}
