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

export const beachVendors: BeachVendor[] = [
  {
    slug: "john-brown",
    name: "John Brown",
    phone: "env:JOHN_BROWN_PHONE",
    active: true,
    role: "Maintenance + beach setup contractor",
  },
  {
    slug: "tyler",
    name: "Tyler",
    phone: "(361) 813-6958",
    active: true,
    role: "Beach setup contractor (also a delivery-runner applicant — has a beach trailer)",
  },
  {
    slug: "danny-peterson",
    name: "Danny Peterson",
    phone: "(808) 463-5544",
    active: true,
    role: "Beach setup contractor (beach trailer in the near future, like Tyler)",
    smsCapable: true, // Twilio Lookup confirmed mobile (AT&T) 2026-04-29
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
