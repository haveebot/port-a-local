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
  /**
   * Alert email(s) for this vendor — used by the wheelhouse rentals
   * "Send update" (+ day-before reminders) to email the crew alongside
   * SMS. Unset falls back to the crew's shared business inbox via
   * beachVendorEmails() (keyed by `team`). Added 2026-06-04.
   */
  emails?: string[];
  active: boolean;
  /** Free-text role/note for admin display. */
  role?: string;
  /**
   * Set false if Twilio returns 30006 ("landline / unreachable carrier")
   * for the phone. Same semantics as cart-vendors.smsCapable.
   */
  smsCapable?: boolean;
  /**
   * Team identifier — vendor records that share a `team` value belong to
   * the same operating crew. Used by the inbound CLAIM handler to suppress
   * race-lost SMS noise between teammates: when one of Bron's 3 phones
   * claims a beach booking, the other two get a "claim-lost / claimed by"
   * notification, but a redundant SECOND claim attempt from another
   * Bron's number doesn't generate yet another race-lost SMS — the team
   * was already notified by the first claim resolution.
   *
   * Bron's-only model on the beach side (2026-05-11 PR #46) means three
   * BeachVendor records share team="brons". A future multi-tenant beach
   * roster would assign team-id per crew. Omit on standalone vendors.
   */
  team?: string;
  /**
   * When true, payouts to this vendor are handled OUT OF BAND by the
   * operator (not via Stripe Connect auto-transfer). The hourly beach-
   * payouts cron skips these vendors entirely — no payout attempt is
   * fired, no "vendor needs Stripe Connect" SMS to Winston, no entries
   * in the cron's skippedNoConnect count.
   *
   * Used 2026-05-20 for Bron's vendors while the revenue-split agreement
   * is being finalized — Winston and Bron settle payouts directly. Once
   * the agreement signs + Stripe Connect onboards, flip back to false
   * (or remove the field) and the cron resumes auto-payouts.
   */
  manualPayoutsOnly?: boolean;
  /**
   * Set false to exclude this vendor from AUTOMATIC new-booking fan-out
   * (lead blasts + claim-lost noise). Comms on jobs already assigned to
   * them — day-before crew reminders, claim confirmations, operator
   * Send-updates, manual reassignment — are unaffected.
   *
   * Used 2026-06-10 for Bron's vendors: operator receives new bookings
   * and routes them manually while the partnership terms are worked out.
   */
  leadBlasts?: boolean;
}

// Beach-vendor routing — Bron's is the sole vendor for chairs + shibumi
// setups (all three directory phones receive every blast on those products).
// Tyler is the sole vendor for The Beach Rig (he has the 16-ft trailer).
// Per-product routing is encoded in beach-products.ts via `vendorSlugs`;
// this file is just the active vendor roster.
export const beachVendors: BeachVendor[] = [
  {
    slug: "brons-reservations",
    name: "Bron's reservations",
    phone: "(361) 290-7143",
    active: true,
    role: "Bron's Beach — primary reservations line",
    smsCapable: true,
    team: "brons",
    manualPayoutsOnly: true,
    leadBlasts: false,
  },
  {
    slug: "brons-bron-cell",
    name: "Bron Doyle (cell)",
    phone: "(361) 946-2766",
    active: true,
    role: "Bron's Beach — owner direct cell",
    smsCapable: true,
    team: "brons",
    manualPayoutsOnly: true,
    leadBlasts: false,
  },
  {
    slug: "brons-kristen",
    name: "Kristen",
    phone: "(254) 220-3808",
    active: true,
    role: "Bron's Beach — team operator",
    smsCapable: true,
    team: "brons",
    manualPayoutsOnly: true,
    leadBlasts: false,
  },
  {
    slug: "tyler",
    name: "Tyler",
    phone: "(361) 813-6958",
    active: true,
    role: "Beach Rig vendor — has the 16-ft beach trailer",
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
 * Shared business inbox(es) per beach crew, keyed by `team`. A booking
 * alert/reminder to any one of a crew's lines resolves to these, so it
 * lands in the crew's monitored inbox regardless of which line claimed
 * the job. Bron's: their two business addresses (mirrors cart-vendors).
 */
const BEACH_TEAM_EMAILS: Record<string, string[]> = {
  brons: ["bron@bronsbeachcarts.com", "sales@bronsbeachcarts.com"],
};

/**
 * Resolve alert email(s) for a beach vendor — explicit per-vendor `emails`
 * win, else the crew's shared business inbox(es) via `team`. Returns an
 * empty array if neither is set (caller skips email cleanly).
 */
export function beachVendorEmails(v: BeachVendor): string[] {
  if (v.emails && v.emails.length > 0) return v.emails;
  if (v.team && BEACH_TEAM_EMAILS[v.team]) return BEACH_TEAM_EMAILS[v.team];
  return [];
}

/**
 * Vendors who should receive new-booking blast SMS.
 * Active + has phone + not flagged smsCapable:false.
 */
export function getBlastableBeachVendors(): BeachVendor[] {
  return beachVendors.filter(
    (v) =>
      v.active &&
      v.leadBlasts !== false &&
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

/**
 * Find a beach vendor by slug. Used by the inbound CLAIM webhook to look
 * up the winning vendor after a race-lost attemptClaim — so we can decide
 * whether the would-be claimer is on the same team as the winner and
 * suppress redundant race-lost SMS noise.
 */
export function findBeachVendorBySlug(slug: string): BeachVendor | null {
  return beachVendors.find((v) => v.slug === slug) ?? null;
}

/**
 * Two beach vendors are on the same team when both have a non-empty
 * `team` value and the values match. Returns false if either side has
 * no team set (standalone vendors are not in any team).
 */
export function beachVendorsAreTeammates(
  a: BeachVendor,
  b: BeachVendor,
): boolean {
  if (!a.team || !b.team) return false;
  return a.team === b.team;
}
