/**
 * Bron's Beach Rentals — staging product catalog.
 *
 * For the bronsbeach.com staging demo (2026-05-09). Pricing simplified
 * to clean flat-rate per day for fast operator demo; real prices land
 * after the walk-in conversation with Bron when he tells us his actual
 * SKUs + rates.
 *
 * Revenue split: 12% to PAL platform, 88% to Bron's connected account.
 * In production this happens via Stripe Connect `application_fee_amount`
 * with the platform fee auto-deposited daily. For the demo, the split
 * is computed + stored in the checkout metadata; actual Connect transfer
 * activates once Bron's connected account onboards.
 */

export interface BronsProduct {
  slug: string;
  label: string;
  shortDescription: string;
  longDescription: string;
  /** Customer pays this per day. */
  dailyTotalCents: number;
  /** Image asset path or remote URL. Static placeholders for staging. */
  imageHint: string;
}

/**
 * PAL's revenue share on every Bron's transaction. Internal only —
 * never shown to the customer at any rate breakdown level.
 */
export const PAL_REVENUE_SHARE_PCT = 12;

/** Compute platform fee + vendor portion from total. Server-side only. */
export function splitTotal(totalCents: number): {
  palFeeCents: number;
  vendorCents: number;
} {
  const palFeeCents = Math.round((totalCents * PAL_REVENUE_SHARE_PCT) / 100);
  return {
    palFeeCents,
    vendorCents: totalCents - palFeeCents,
  };
}

export const BRONS_PRODUCTS: BronsProduct[] = [
  {
    slug: "chair-umbrella",
    label: "Chair & Umbrella",
    shortDescription: "Two beach chairs and a 6-foot umbrella, set up where you'd like on the beach.",
    longDescription:
      "Two heavy-duty beach chairs, a 6-foot umbrella with sand anchor, and crew setup at your spot. Pickup at end of day handled by us — you just relax.",
    dailyTotalCents: 4500, // $45/day
    imageHint: "chair-umbrella",
  },
  {
    slug: "cabana",
    label: "Family Cabana",
    shortDescription: "16×16 shade cloth cabana with chairs and a cooler. The big setup.",
    longDescription:
      "16×16 shade cloth cabana, six heavy-duty chairs, and a large cooler stocked with ice. Crew sets it up at your access point and breaks it down at end of day. Made for big groups, long days.",
    dailyTotalCents: 17500, // $175/day
    imageHint: "cabana",
  },
  {
    slug: "cooler-only",
    label: "Cooler with Ice",
    shortDescription: "Large cooler, fully iced, dropped at your spot.",
    longDescription:
      "75-quart cooler with a full bag of ice, delivered to your beach access point or vacation rental. Add to any setup or rent on its own.",
    dailyTotalCents: 2500, // $25/day
    imageHint: "cooler",
  },
  {
    slug: "beach-tent",
    label: "Beach Shade Tent",
    shortDescription: "Pop-up shade tent, sand anchors, and crew setup.",
    longDescription:
      "8×8 pop-up beach shade tent with all four sand anchors and crew setup at your spot. Smaller footprint than the cabana — perfect for a couple or small family.",
    dailyTotalCents: 6500, // $65/day
    imageHint: "beach-tent",
  },
];

export function getBronsProduct(slug: string): BronsProduct | null {
  return BRONS_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
