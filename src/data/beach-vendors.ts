/**
 * Beach setup vendors — the on-call contractors who claim and fulfill
 * /beach bookings (cabanas + chairs).
 *
 * Internal partners, not external businesses, so no SMS opt-in flow
 * needed (vs cart-vendors). All active vendors get blasted on every
 * paid /beach booking. First to reply CLAIM wins the job.
 *
 * John Brown's phone is read from env (JOHN_BROWN_PHONE) so we don't
 * hardcode a personal cell in source. Other vendors keep phone inline
 * since they're added/changed via PR review.
 *
 * The fan-out + claim flow lives in src/lib/beachVendorBlast.ts and
 * is wired into /api/beach/confirm/route.ts after Stripe payment
 * confirms. Inbound CLAIM matching lives in /api/twilio/sms/inbound.
 */

export interface BeachVendor {
  slug: string;
  name: string;
  /**
   * Inline phone OR the literal string `"env:JOHN_BROWN_PHONE"` to defer
   * to the env var. Keeps PII out of the repo for the principals while
   * letting newer vendors use plain inline numbers. The phoneFor()
   * helper resolves either form.
   */
  phone: string;
  email?: string;
  active: boolean;
  /** Free-text role/note for admin display. */
  role?: string;
  /**
   * Set false if Twilio returns 30006 ("landline / unreachable carrier")
   * for the phone. Same semantics as cart-vendors.smsCapable.
   */
  smsCapable?: boolean;
}

// Beach-vendor routing pivoted 2026-05-11 PM: Bron's is the sole beach
// vendor on PAL going forward. All three of Bron's directory phones
// (reservations line + Bron's cell + Kristen) receive every new beach
// booking blast. Prior vendors (John Brown, Tyler, Danny Peterson) are
// retired from active routing — retained in git history if needed.
//
// Revenue split for Bron-on-PAL beach fulfillment is pending the
// updated Bron's agreement review (separate from the bronsbeach.com
// 12% revenue share, which covers bookings on Bron's own domain).
// Until the new agreement lands, the existing /beach product pricing
// in beach-products.ts stays as-is.
export const beachVendors: BeachVendor[] = [
  {
    slug: "brons-reservations",
    name: "Bron's reservations",
    phone: "(361) 290-7143",
    active: true,
    role: "Bron's Beach — primary reservations line",
    smsCapable: true,
  },
  {
    slug: "brons-bron-cell",
    name: "Bron Doyle (cell)",
    phone: "(361) 946-2766",
    active: true,
    role: "Bron's Beach — owner direct cell",
    smsCapable: true,
  },
  {
    slug: "brons-kristen",
    name: "Kristen",
    phone: "(254) 220-3808",
    active: true,
    role: "Bron's Beach — team operator",
    smsCapable: true,
  },
];

/**
 * Resolve a vendor's phone number — handles the env-var indirection
 * for principals whose number lives in Vercel env (e.g. JOHN_BROWN_PHONE).
 * Returns "" for missing/blank values so caller can skip cleanly.
 */
export function beachVendorPhone(v: BeachVendor): string {
  const raw = (v.phone || "").trim();
  if (!raw) return "";
  if (raw.startsWith("env:")) {
    const key = raw.slice(4);
    return (process.env[key] || "").trim();
  }
  return raw;
}

/**
 * Vendors who should receive new-booking blast SMS.
 * Active + has phone + not flagged smsCapable:false.
 */
export function getBlastableBeachVendors(): BeachVendor[] {
  return beachVendors.filter(
    (v) =>
      v.active &&
      beachVendorPhone(v).length > 0 &&
      v.smsCapable !== false,
  );
}

/**
 * Find a beach vendor by E.164 phone (used by the inbound webhook
 * to match CLAIM replies back to a vendor record).
 */
export function findBeachVendorByPhone(phoneE164: string): BeachVendor | null {
  for (const v of beachVendors) {
    const p = beachVendorPhone(v);
    if (!p) continue;
    const digits = p.replace(/\D/g, "").replace(/^1/, "");
    if (digits.length !== 10) continue;
    const vE164 = `+1${digits}`;
    if (vE164 === phoneE164) return v;
  }
  return null;
}
