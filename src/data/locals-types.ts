/**
 * PAL Locals — type model
 *
 * Third marketplace vertical (after /deliver and /rent).
 * Two sub-types under one URL:
 *   - RENT: gear, equipment, vehicles a local owns and lists
 *   - HIRE: services a local performs
 *
 * Same demand-aggregator pattern: customer browses → "Request a quote" →
 * email lands at admin@/hello@ → PAL connects them to the provider →
 * provider quotes + transacts directly. Beta until volume justifies
 * formalized booking + Stripe.
 *
 * Off-limits to /locals: anything overlapping our maintenance vendor's
 * domain (plumbing, electrical, AC, hurricane prep, locks, general
 * repair, pool/lawn). Those go through /maintenance.
 */

/**
 * Listing modes:
 *   - rent: locals own a thing, customer rents for a period (kayak, paddleboard)
 *   - hire: locals offer a service, customer requests/books (charter, lesson)
 *   - sell: locals sell goods outright, customer buys-now via Stripe (crafts,
 *     merch, art) — Etsy-style. Vendor handles fulfillment (ship/pickup/deliver
 *     with the customer directly). PAL collects payment + 10% platform fee
 *     on top, transfers vendor's full quote to their Stripe Connect account.
 */
export type ListingMode = "rent" | "hire" | "sell";

export type RentCategory =
  | "beach-gear"
  | "watercraft"
  | "fishing-gear"
  | "photo-gear"
  | "shelter-shade";

export type HireCategory =
  | "photography"
  | "charter-captain"
  | "fishing-guide"
  | "beach-setup"
  | "rental-cleaning"
  | "pet-care"
  | "errand-running"
  | "fitness-yoga"
  | "childcare"
  | "wellness";

export type SellCategory =
  | "art-prints"
  | "crafts-handmade"
  | "merch-apparel"
  | "baked-goods"
  | "books-zines";

export type LocalsCategory = RentCategory | HireCategory | SellCategory;

export interface CategoryMeta {
  id: LocalsCategory;
  mode: ListingMode;
  label: string;
  /** One-line plain-English description shown on the section card */
  blurb: string;
  /** PortalIcon name fallback (we reuse existing icons) */
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  // Rent
  {
    id: "beach-gear",
    mode: "rent",
    label: "Beach Gear",
    blurb:
      "Chairs, umbrellas, tents, party trailers, fire pits — anything a local has lying around and would rent out for a beach day.",
    icon: "beach",
  },
  {
    id: "watercraft",
    mode: "rent",
    label: "Watercraft",
    blurb:
      "Jet skis, paddleboards, kayaks, surfboards. Owners decide pickup or delivery, lessons or no.",
    icon: "fish",
  },
  {
    id: "fishing-gear",
    mode: "rent",
    label: "Fishing Gear",
    blurb:
      "Rods, reels, tackle boxes, coolers, wading gear. Bring less from home.",
    icon: "fish",
  },
  {
    id: "photo-gear",
    mode: "rent",
    label: "Photography Gear",
    blurb:
      "Cameras, drones, tripods, lenses. Locals with kit they're not using this week.",
    icon: "photos",
  },
  {
    id: "shelter-shade",
    mode: "rent",
    label: "Shelter & Shade",
    blurb:
      "Canopies, generators, large coolers, beach tents — for the bigger group day or the long weekend setup.",
    icon: "stay",
  },
  // Hire
  {
    id: "photography",
    mode: "hire",
    label: "Photographers",
    blurb:
      "Family beach sessions, engagements, drone work, vacation portraits. Locals who know the light and the hour.",
    icon: "photos",
  },
  {
    id: "charter-captain",
    mode: "hire",
    label: "Charter Captains",
    blurb:
      "Offshore, bay, jetty trips. Half-day or full. Local captains, vetted by reputation not by Yelp.",
    icon: "fish",
  },
  {
    id: "fishing-guide",
    mode: "hire",
    label: "Fishing Guides",
    blurb:
      "Wade, kayak, jetty, surf. Guides who know the bite and where it'll be Saturday.",
    icon: "fish",
  },
  {
    id: "beach-setup",
    mode: "hire",
    label: "Beach Setup",
    blurb:
      "Cabanas, chairs, umbrellas dropped at your spot in the morning, picked up at sunset. (Bigger setups go through /beach — this is the freelance route.)",
    icon: "beach",
  },
  {
    id: "rental-cleaning",
    mode: "hire",
    label: "Vacation Rental Cleaning",
    blurb:
      "Turnover cleans, mid-stay refresh, post-trip deep clean. Independent cleaners, not big-management contracts.",
    icon: "services",
  },
  {
    id: "pet-care",
    mode: "hire",
    label: "Dog Walking & Pet Care",
    blurb:
      "Walks, drop-ins, pet sitting while you're at the beach or out for dinner.",
    icon: "services",
  },
  {
    id: "errand-running",
    mode: "hire",
    label: "Errand Running",
    blurb:
      "Grocery runs, package pickup, last-minute supply runs. PAL Delivery does food — this is everything else.",
    icon: "services",
  },
  {
    id: "fitness-yoga",
    mode: "hire",
    label: "Fitness & Yoga",
    blurb:
      "Beach yoga, personal training, group classes on the sand. Locals teaching their craft.",
    icon: "services",
  },
  {
    id: "childcare",
    mode: "hire",
    label: "Childcare",
    blurb:
      "Vetted local babysitters and date-night sitters. So you can actually go to dinner.",
    icon: "services",
  },
  {
    id: "wellness",
    mode: "hire",
    label: "Massage & Wellness",
    blurb:
      "Mobile massage, sound baths, meditation walks. Brought to your rental.",
    icon: "services",
  },
  // Sell — locals who sell goods outright (Etsy-on-PAL pattern, added 2026-04-27)
  {
    id: "art-prints",
    mode: "sell",
    label: "Art & Prints",
    blurb:
      "Original art, prints, photography, beach-life pieces from local artists. They ship or hand off; PAL just connects you.",
    icon: "art",
  },
  {
    id: "crafts-handmade",
    mode: "sell",
    label: "Crafts & Handmade",
    blurb:
      "Shell jewelry, driftwood pieces, hand-poured candles, hand-stitched gear. The kind of thing you can only find from a local who makes it.",
    icon: "shell",
  },
  {
    id: "merch-apparel",
    mode: "sell",
    label: "Merch & Apparel",
    blurb:
      "Tees, hats, totes, stickers — limited runs from local boats, businesses, brands.",
    icon: "shop",
  },
  {
    id: "baked-goods",
    mode: "sell",
    label: "Baked Goods & Pantry",
    blurb:
      "Cookies, pies, hot sauces, jams. From a kitchen down the street. Vendor handles delivery + freshness.",
    icon: "eat",
  },
  {
    id: "books-zines",
    mode: "sell",
    label: "Books & Zines",
    blurb:
      "Self-published, locally-authored, sometimes signed. Coastal cookbooks, beach-town histories, fiction.",
    icon: "heritage",
  },
];

/* ------------------- Listings (provider-supplied) ------------------- */

export interface Listing {
  id: string;
  mode: ListingMode;
  category: LocalsCategory;
  /** What the listing is called — "Joel's Photography", "Brian's Fishing Charters" */
  title: string;
  /** Provider's display name (often a person's first name or business) */
  provider: string;
  /** Short pitch — one paragraph max */
  description: string;
  /** Display price/range — free-form because providers price differently */
  pricingNote?: string;
  /** Tag chips for filtering — "drone", "family-friendly", "experienced", etc */
  tags?: string[];
  /** Owner-supplied availability note — "weekends" / "summer only" / etc */
  availabilityNote?: string;
  /** Optional photo URL relative to /public — placeholder OK */
  photoUrl?: string;
  /** When false, hidden from /locals listings */
  isActive: boolean;
  /** ISO timestamp of when listing was added (for sort) */
  addedAt: string;

  /* --------- Sell-mode only --------- */
  /** Vendor's price in cents (sell mode). Customer pays this + 10% PAL
      platform fee on top. Vendor keeps full priceCents amount via
      Stripe Connect Express transfer at purchase. */
  priceCents?: number;
  /** Vendor's Stripe Connect account ID — destination for the
      transfer of priceCents at purchase time. */
  stripeAccountId?: string;
  /** Sold-out flag (vendor toggles when inventory's gone). */
  soldOut?: boolean;
  /** Vendor's plan for getting it to the customer. Free-form. e.g.
      "I'll meet you at the marina" / "Pickup at studio (text first)" /
      "Ship USPS — flat $8 nationwide" / "Free local delivery in PA" */
  fulfillmentNote?: string;
  /** Sell-mode only: vendor's email — fires the "you sold something"
      notification on customer purchase. Falls back to admin@ when
      missing (Winston manually relays until vendor wires this up). */
  vendorEmail?: string;
  /** Sell-mode only: vendor's phone — included in admin alert and
      could power SMS notifications post-A2P approval. */
  vendorPhone?: string;
}
