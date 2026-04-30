/**
 * Super-admin SMS roster — the people who get pinged on every revenue
 * event PAL processes. Distinct from `insiders.ts` (which gates the
 * inbound SMS bridge to admin@) — these are the OUTBOUND notification
 * targets for $$$ events.
 *
 * Default model: every super-admin sees every revenue event. Per-kind
 * opt-out is supported (e.g., Collie may not want maintenance pings,
 * Nick may want only delivery for CityDeploy template metrics). For
 * v1, opt-outs are static — flip flags here. v2 adds an admin UI +
 * SMS-keyword opt-out (STOP-CART, STOP-BEACH, etc.).
 *
 * Compliance: super-admins are PAL principals (insiders), not third
 * parties. The A2P 10DLC campaign sample messages cover transactional
 * notifications to the operator. STOP keyword still honored.
 */

export type RevenueKind =
  | "cart-rental"
  | "beach-rental"
  | "delivery-order"
  | "locals-purchase"
  | "housekeeping-booking"
  | "maintenance-priority";

export interface SuperAdmin {
  slug: string;
  name: string;
  phoneE164: string;
  /**
   * Opt-out set — pings of these kinds are skipped. Empty (default) =
   * receives all kinds. Add specific kinds per super-admin's preference.
   */
  optOut?: RevenueKind[];
  notes?: string;
}

export const superAdmins: SuperAdmin[] = [
  {
    slug: "winston",
    name: "Winston",
    phoneE164: "+15125681725",
    notes: "Operator — sees everything",
  },
  {
    slug: "nick",
    name: "Nick",
    phoneE164: "+15122015353",
    notes: "Heye Lab founder — platform pulse / CityDeploy template signal",
  },
  {
    slug: "collie",
    name: "Collie",
    phoneE164: "+12107095771",
    notes: "PAL marketing partner — sees sales for attribution context",
  },
];

/**
 * Recipients for a given revenue kind. Filters out anyone who opted
 * out of that kind. Always returns a stable order (definition order).
 */
export function getSuperAdminsFor(kind: RevenueKind): SuperAdmin[] {
  return superAdmins.filter((sa) => !(sa.optOut ?? []).includes(kind));
}

/**
 * Emoji prefix per revenue kind — fast lock-screen scan. Stays
 * consistent across PAL admin SMS so super-admins develop muscle
 * memory for "what did I just sell".
 */
export const REVENUE_EMOJI: Record<RevenueKind, string> = {
  "cart-rental": "🛺",
  "beach-rental": "🏖️",
  "delivery-order": "🚐",
  "locals-purchase": "🛒",
  "housekeeping-booking": "🧹",
  "maintenance-priority": "🔧",
};

export const REVENUE_LABEL: Record<RevenueKind, string> = {
  "cart-rental": "Cart rental",
  "beach-rental": "Beach setup",
  "delivery-order": "Delivery order",
  "locals-purchase": "Locals purchase",
  "housekeeping-booking": "Housekeeping",
  "maintenance-priority": "Maintenance Priority",
};
