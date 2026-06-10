/**
 * Cart vendor directory — the blast list.
 * When a customer books a cart through PAL, all active vendors with a
 * deliverable contact channel (SMS-capable phone or email) receive the
 * lead simultaneously. First to reply ACCEPT (or CLAIM, legacy) wins.
 *
 * Selected by Winston 2026-04-15 from a master list of 26 PA cart companies.
 *
 * 2026-05-09: Migrated to multi-recipient model (`phones[]` + `emails[]`)
 * + added `firstLookMinutes` field for preferred-vendor priority window.
 * A vendor with `firstLookMinutes > 0` receives the lead alone for that
 * many minutes; the rest of the directory is blasted at expiry (or
 * immediately if the priority vendor replies PASS).
 *
 * By accepting a lead, vendors agree to:
 * - Have a clean, well-maintained cart ready for customer pickup on the start date
 * - Provide the customer a minimum $20 discount off their standard rental rate
 * - Adhere to their standard rental practices (rental agreements, ID verification,
 *   deposit handling, customer service, emergency maintenance for the rental duration)
 */

export interface CartVendorPhone {
  number: string;
  label?: "primary" | "personal" | "team" | string;
  contactName?: string;
  /**
   * Set to false when Twilio returns error 30006 ("landline / unreachable
   * carrier") for this number. The bulk-invite + lead-blast SMS paths skip
   * numbers with smsCapable === false. Undefined treated as "try SMS."
   */
  smsCapable?: boolean;
}

export interface CartVendorEmail {
  address: string;
  label?: "primary" | "general" | string;
  contactName?: string;
  /** Optional comment-style note for unverified guesses, bounce history, etc. */
  note?: string;
}

export interface CartVendor {
  slug: string;
  name: string;
  address: string;
  cartSizes: string[]; // "4", "6", "8"
  active: boolean; // false = excluded from all blast paths

  /**
   * All phone numbers attached to this vendor. Lead-blast SMS fans out to
   * every entry where `smsCapable !== false`. The first entry is treated
   * as "primary" for legacy single-phone displays.
   */
  phones: CartVendorPhone[];

  /**
   * All email addresses attached to this vendor. Lead-blast email fans
   * out to every entry. Empty array = vendor is not yet on email blast.
   */
  emails: CartVendorEmail[];

  /**
   * If set and > 0, this vendor gets a priority first-look window of N
   * minutes when a matching lead arrives. During the window only this
   * vendor's phones/emails receive the alert. At expiry (or on PASS reply)
   * the rest of the directory is blasted. Multiple priority vendors with
   * matching first-look sizes get parallel windows. Undefined or 0 =
   * standard simultaneous blast (the default for most vendors).
   */
  firstLookMinutes?: number;

  /**
   * The cart sizes this vendor gets the first-look HEAD-START on — which
   * can be narrower than what they rent (`cartSizes`). Lets us route
   * first-look by size: Bron's owns 4/6, Joy owns 8, even though both
   * rent multiple sizes and both still receive open-blasts for everything
   * in their `cartSizes`. Undefined falls back to `cartSizes` (vendor gets
   * first-look on every size they rent). Only meaningful when
   * `firstLookMinutes > 0`.
   */
  firstLookSizes?: string[];

  /**
   * Set false to exclude this vendor from AUTOMATIC new-lead fan-out
   * (first-look windows + open blasts, SMS and email). Comms on bookings
   * already assigned to them — operator Send-updates, manual reassign,
   * the confirm-time handoff package — are unaffected, and they remain
   * available in the rentals-tool reassign dropdown.
   *
   * Used 2026-06-10 for Bron's: operator receives new bookings and routes
   * them manually while the partnership terms are worked out.
   */
  leadBlasts?: boolean;
}

export const cartVendors: CartVendor[] = [
  {
    slug: "coastal-eds",
    name: "Coastal Ed's Coastal Carts",
    address: "600 Cut Off Rd, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [
      { number: "(361) 749-7001", label: "primary", smsCapable: false }, // 30006 landline confirmed 2026-04-29
    ],
    emails: [
      {
        address: "contact@coastaleds.com",
        label: "primary",
        note: "HIGH (own site Contact page); BOUNCED 2026-04-28 'inbox full' — soft bounce, retry auto, fall back to phone if persists. Footer typo `contact@coastleds.com` may be siphoning their legit traffic.",
      },
    ],
  },
  {
    slug: "port-a-beach-buggies",
    name: "Port A Beach Buggies",
    address: "307 W Ave G, Port Aransas, TX",
    cartSizes: ["2", "4", "6", "8"],
    active: true,
    phones: [
      { number: "(361) 749-2066", label: "primary", smsCapable: false }, // 30006 landline confirmed 2026-04-29
    ],
    emails: [
      {
        address: "insideout361@gmail.com",
        label: "primary",
        note: "HIGH (formerly 'Inside Out' — Scott Tanzer, same owner / same inbox as Jackfish below)",
      },
    ],
  },
  {
    slug: "jackfish",
    name: "Jackfish Cart Rentals",
    address: "3411 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    phones: [
      { number: "(361) 459-2900", label: "primary", smsCapable: false },
      {
        number: "(361) 339-1089",
        label: "alt",
        contactName: "Mac Owens",
        smsCapable: false,
        // alt phone published as primary on portaransasgolfcarts.com (Twilio Lookup: fixedVoip / Charter Fiberlink — production SMS returned 30006 as expected, fixedVoip didn't accept)
      },
    ],
    emails: [{ address: "insideout361@gmail.com", label: "primary" }],
    // both 459-2900 main and 339-1089 alt return 30006 — needs direct ask for Mac Owens cell
  },
  {
    slug: "texas-red",
    name: "Texas Red Golf Carts",
    address: "311 Sea Isle Dr, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
    phones: [{ number: "(361) 749-5400", label: "primary" }],
    emails: [], // NEED — MEDIUM-confidence guess: red@texasredgolfcarts.com (verify before adding)
  },
  {
    slug: "first-stop",
    name: "First Stop Cart Rentals & Repair",
    address: "718 S Station St, Port Aransas, TX",
    cartSizes: ["4"],
    active: true,
    phones: [{ number: "(210) 338-9918", label: "primary" }],
    emails: [], // NEED — site 1ststopcarts.com unreachable; phone-only outreach
  },
  {
    slug: "tarpon-carts",
    name: "Tarpon Carts & Rentals",
    address: "614 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [
      { number: "(361) 749-2569", label: "primary", smsCapable: false },
      {
        number: "(361) 988-8161",
        label: "alt",
        contactName: "Lee R. Hoskins Jr. (Sandcastle satellite)",
        smsCapable: false,
        // Lookup said mobile (Worldcall) but production SMS came back 30006 too.
      },
    ],
    emails: [
      {
        address: "TarponCartsandRentals@gmail.com",
        label: "primary",
        note: "HIGH (own site Reservations section)",
      },
    ],
  },
  {
    slug: "brons-beach-carts",
    name: "Bron's Beach Carts & Backyard",
    address: "314 E Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    leadBlasts: false,
    firstLookMinutes: 30,
    phones: [
      {
        number: "(361) 290-7143",
        label: "primary",
        contactName: "Bron's reservations",
      },
      {
        number: "(361) 946-2766",
        label: "personal",
        contactName: "Bron Doyle (cell)",
      },
      {
        number: "(254) 220-3808",
        label: "team",
        contactName: "Kristen",
      },
    ],
    emails: [
      {
        address: "bron@bronsbeachcarts.com",
        label: "primary",
        contactName: "Bron Doyle",
        note: "Unverified 2026-05-09 — added per operator direction; bounce will tell us if it's wrong.",
      },
      {
        address: "sales@bronsbeachcarts.com",
        label: "general",
        note: "Unverified 2026-05-09 — original MEDIUM-confidence guess; kept as fallback. Bounce will tell us.",
      },
    ],
  },
  {
    slug: "paradise-cart",
    name: "Paradise Cart Rental",
    address: "428 S Alister St, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    phones: [{ number: "(361) 749-3003", label: "primary" }],
    emails: [{ address: "paradisecartrental@gmail.com", label: "primary" }],
  },
  {
    slug: "kacies-beach-carts",
    name: "Kacie's Beach Carts",
    address: "445 W Cotter Ave Ste D, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [{ number: "(361) 777-6622", label: "primary" }],
    emails: [], // NEED — site has contact form only; IG @kaciesbeachcarts as fallback
  },
  {
    slug: "island-outfitters",
    name: "Island Outfitters",
    address: "525 Cut Off Rd, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
    phones: [{ number: "(361) 336-3866", label: "primary" }],
    emails: [
      {
        address: "info@islandoutfittersTX.com",
        label: "primary",
        note: "HIGH (own site homepage)",
      },
    ],
  },
  {
    slug: "joy-cart-rentals",
    name: "Joy Cart Rentals",
    address: "307 Sea Isle Dr, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    // 8-seater first-look owner (confirmed they rent 8s). Bron's keeps 4/6;
    // Joy still receives open-blasts on 4/6 they rent, just not the
    // head-start there.
    firstLookMinutes: 30,
    firstLookSizes: ["8"],
    phones: [
      // Shop line — not used for SMS (text the manager's cell instead).
      { number: "(361) 749-2278", label: "primary", smsCapable: false },
      {
        number: "(361) 332-6532",
        label: "team",
        contactName: "Vivian Frank",
        smsCapable: true,
      },
    ],
    emails: [{ address: "info@joycartrentals.com", label: "primary" }],
  },
  {
    slug: "gulf-carts",
    name: "Gulf Carts",
    address: "606 Cut Off Rd Ste B, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [{ number: "(361) 677-3099", label: "primary" }],
    emails: [
      {
        address: "gulfcartsllc@gmail.com",
        label: "primary",
        note: "HIGH (own site Reservations page)",
      },
    ],
  },
  {
    slug: "island-surf-rentals",
    name: "Island Surf Rentals",
    address: "130 E Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    phones: [
      { number: "(361) 749-0822", label: "primary", smsCapable: false }, // landline
      {
        number: "(210) 315-5718",
        label: "alt",
        contactName: "Dale Christianson (Tradewinds)",
        smsCapable: true,
        // Twilio Lookup confirms MOBILE (AT&T Wireless). 210 = San Antonio area code.
      },
    ],
    emails: [{ address: "islandsurfrentals@yahoo.com", label: "primary" }],
  },
  {
    slug: "ocean-carts",
    name: "Ocean Carts",
    address: "3417 S 11th St, Port Aransas, TX",
    cartSizes: ["6"],
    active: true,
    phones: [
      { number: "(361) 339-1036", label: "primary", smsCapable: false }, // landline
      {
        number: "(361) 217-8490",
        label: "alt",
        contactName: "Damian Allan (general partner)",
        smsCapable: true,
        // BBB profile alt — Twilio Lookup confirms MOBILE (AT&T Wireless). business mid-ownership-change per BBB.
      },
    ],
    emails: [{ address: "info@oceancarts.com", label: "primary" }],
  },
  {
    slug: "marlins-beach-carts",
    name: "Marlins Beach Carts",
    address: "521 W Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    phones: [{ number: "(361) 300-2355", label: "primary" }],
    emails: [{ address: "marlinsbeachcarts@gmail.com", label: "primary" }],
  },
  {
    slug: "ash-cart-rental",
    name: "Ash Cart Rental",
    address: "2700 S 11th St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    // 2026-04-29: replied STOP to opt-in invite + Winston rule "if a vendor opts out
    // of SMS, remove from all listings + directory entirely". active=false hides them
    // from the cart-vendor blast AND the admin SMS roster (still preserved here for
    // history / audit; flip back to true if they ever re-engage).
    active: false,
    phones: [{ number: "(361) 244-1020", label: "primary" }],
    emails: [], // NEED — MEDIUM-confidence guess: ashcartrental@gmail.com (verify before adding)
  },
  {
    slug: "port-a-carts",
    name: "Port A Carts",
    address: "210 N Alister St, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [{ number: "(361) 300-4045", label: "primary" }],
    emails: [], // NEED — MEDIUM-confidence guess: Portacarts@gmail.com (verify before adding)
  },
  {
    slug: "sage-beach-carts",
    name: "Sage Beach Carts",
    address: "5009 TX-361, Port Aransas, TX",
    cartSizes: ["4", "6", "8"],
    active: true,
    phones: [{ number: "(361) 217-0703", label: "primary" }],
    emails: [
      {
        address: "customerservice@sagebeachcarts.com",
        label: "primary",
        note: "HIGH — Wagner-owned; Top Deck (a separate Tanzer/Inside-Out brand reaching insideout361@gmail.com via Port A Beach Buggies above) was previously listed here in error",
      },
    ],
  },
  {
    slug: "island-carts",
    name: "Island Carts",
    address: "422 W Ave G, Port Aransas, TX",
    cartSizes: ["4", "6"],
    active: true,
    phones: [{ number: "(361) 777-5661", label: "primary" }],
    emails: [{ address: "islandcarts2@gmail.com", label: "primary" }],
  },
  {
    slug: "pa-golf-cart-rental",
    name: "Port Aransas Golf Cart Rental",
    address: "2131 State Hwy 361, Port Aransas, TX",
    cartSizes: [],
    active: true,
    phones: [
      { number: "(361) 749-0070", label: "primary", smsCapable: false }, // 30006 landline confirmed 2026-04-29
    ],
    emails: [], // NEED — no website / FB / IG surfaced; phone-only outreach
  },
];

/* ------------------------------------------------------------------ */
/* Helpers — array-aware, with backward-compat shims                  */
/* ------------------------------------------------------------------ */

/**
 * Primary phone for a vendor — first entry in `phones[]`. Used for
 * single-phone displays and as the "main" number in admin views.
 * Returns empty string if vendor has no phones (shouldn't happen).
 */
export function primaryPhoneFor(v: CartVendor): string {
  return v.phones[0]?.number ?? "";
}

/**
 * Effective SMS phone for legacy single-recipient callers — returns the
 * first SMS-capable phone in the array. Falls back to primary if none
 * are SMS-capable. Preserved for callers that still send to a single
 * number (e.g. opt-in confirmation acks). NEW callers should use
 * `smsPhonesFor()` to fan out to all SMS-capable phones.
 */
export function smsPhoneFor(v: CartVendor): string {
  const sms = v.phones.find((p) => p.smsCapable !== false);
  if (sms) return sms.number;
  return primaryPhoneFor(v);
}

/**
 * All SMS-capable phones for a vendor — used by lead-blast and first-look
 * SMS to fan out to every reachable number on the record (e.g. Bron's
 * three numbers).
 */
export function smsPhonesFor(v: CartVendor): string[] {
  return v.phones
    .filter((p) => p.smsCapable !== false && p.number.trim().length > 0)
    .map((p) => p.number);
}

/**
 * Primary email for a vendor — first entry in `emails[]`. Empty string
 * if vendor has no emails.
 */
export function primaryEmailFor(v: CartVendor): string {
  return v.emails[0]?.address ?? "";
}

/**
 * All email addresses for a vendor — used by the lead-blast email
 * fan-out (e.g. Bron's `bron@` + `sales@` both get the alert).
 */
export function emailsFor(v: CartVendor): string[] {
  return v.emails
    .map((e) => e.address)
    .filter((a) => a.trim().length > 0);
}

/**
 * Whether the vendor has at least one SMS-capable phone. Used by the
 * admin SMS roster + bulk-invite eligibility.
 */
export function hasSmsCapablePhone(v: CartVendor): boolean {
  return v.phones.some((p) => p.smsCapable !== false && p.number.trim().length > 0);
}

/**
 * Vendors that can actually receive SMS — active + at least one
 * SMS-capable phone. The bulk-invite + lead-blast SMS paths use this list.
 */
export function getSmsCapableVendors(): CartVendor[] {
  return cartVendors.filter(
    (v) => v.active && v.leadBlasts !== false && hasSmsCapablePhone(v),
  );
}

/**
 * Vendors with at least one email — ready for the email blast.
 */
export function getBlastableVendors(): CartVendor[] {
  return cartVendors.filter(
    (v) => v.active && v.leadBlasts !== false && emailsFor(v).length > 0,
  );
}

/** All vendors (for admin reference). */
export function getAllVendors(): CartVendor[] {
  return cartVendors;
}

/** Count of vendors that will receive each blast (email-channel count). */
export function getBlastCount(): number {
  return getBlastableVendors().length;
}

/**
 * Vendors with `firstLookMinutes > 0` — the priority cohort for any new
 * lead, regardless of cart size. Per Winston 2026-05-13: first-look
 * priority is NOT gated on size match. We assume the priority vendor
 * (Bron's) can fulfill every cart size we offer; gating by size would
 * cost real first-look windows for no operational benefit.
 *
 * The `cartSize` parameter is retained for API stability (the call site
 * in /api/rent/confirm doesn't have to change) but is intentionally
 * ignored.
 */
export function getFirstLookVendorsForSize(
  cartSize: string,
): CartVendor[] {
  return cartVendors.filter(
    (v) =>
      v.active &&
      v.leadBlasts !== false &&
      typeof v.firstLookMinutes === "number" &&
      v.firstLookMinutes > 0 &&
      // First-look is awarded per SIZE. firstLookSizes (when set) narrows
      // the head-start to specific sizes; otherwise it covers everything
      // the vendor rents. This is what keeps an 8-seater lead from going to
      // a 4/6-only first-look vendor (the bug this replaces ignored size).
      (v.firstLookSizes ?? v.cartSizes).includes(cartSize),
  );
}

/**
 * Find a vendor whose `phones[]` includes the given E.164 number. Used by
 * the inbound SMS webhook to match replies (from any of a multi-number
 * vendor's phones) back to the vendor record.
 */
export function findVendorByPhoneE164(
  phoneE164: string,
  toE164: (s: string) => string,
): { vendor: CartVendor; phone: CartVendorPhone } | null {
  for (const v of cartVendors) {
    for (const p of v.phones) {
      if (toE164(p.number) === phoneE164) {
        return { vendor: v, phone: p };
      }
    }
  }
  return null;
}
