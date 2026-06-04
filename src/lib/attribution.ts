/**
 * First-party attribution capture.
 *
 * When a paid ad sends a visitor to PAL, Meta appends `fbclid` to the
 * landing URL (always, even when we don't add UTMs ourselves). This
 * module grabs that click ID + any `utm_*` params on the first paid /
 * campaign touch and stashes them in a first-party cookie so the signal
 * survives the multi-page journey to checkout.
 *
 * The cookie rides along on the eventual /api/checkout/* request, where
 * the server folds it into Stripe session metadata → the booking record
 * → the Meta Conversions API Purchase event. That closes the loop from
 * "ad click" to "paid booking" so we can compute cost-per-booking and
 * Meta can attribute robustly (server-side, iOS/cookie-loss resilient).
 *
 * Semantics: LAST paid/campaign touch wins. A later organic/direct visit
 * does NOT overwrite a stored ad touch (we only write when a tracking
 * param is actually present), but a fresh ad click DOES update it — which
 * is the attribution most useful for "which ad drove this booking."
 *
 * Privacy: first-party, functional. We store click IDs + campaign tags
 * we ourselves put on the URL — no cross-site profile, no PII. Mirrors
 * the existing Meta Pixel posture already live in layout.tsx.
 */

export const ATTRIBUTION_COOKIE = "pal_attrib";
const MAX_AGE_DAYS = 90;

/** The tracking params we lift off the landing URL. */
const PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  /** path the tracked click landed on, e.g. "/beach" */
  landing?: string;
  /** ISO timestamp of capture */
  ts?: string;
}

/** Cap a value's length so a hostile URL can't bloat the cookie. */
function clamp(v: string): string {
  return v.slice(0, 256);
}

/**
 * Parse a query string for tracking params. Returns null when none are
 * present (so callers know not to overwrite an existing stored touch).
 */
export function parseAttributionParams(
  search: string,
  landingPath?: string,
): Attribution | null {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  let found = false;
  for (const k of PARAM_KEYS) {
    const val = params.get(k);
    if (val) {
      out[k] = clamp(val);
      found = true;
    }
  }
  if (!found) return null;
  if (landingPath) out.landing = clamp(landingPath);
  return out;
}

/** Serialize Attribution for cookie / metadata storage. */
export function encodeAttribution(a: Attribution): string {
  return JSON.stringify(a);
}

/** Parse a stored cookie value back into Attribution (lenient). */
export function decodeAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(raw));
    return obj && typeof obj === "object" ? (obj as Attribution) : null;
  } catch {
    return null;
  }
}

/* ----------------------- client-side capture ----------------------- */

/** Read the current pal_attrib cookie in the browser. */
export function readAttributionCookie(): Attribution | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`));
  if (!match) return null;
  return decodeAttribution(match.slice(ATTRIBUTION_COOKIE.length + 1));
}

/**
 * Capture tracking params from the current URL and persist them.
 * No-op (returns false) when the URL carries no tracking params — so
 * an organic page view never clobbers a previously-stored ad touch.
 * Called once on mount by <AttributionCapture/>.
 */
export function captureAttributionFromLocation(): boolean {
  if (typeof window === "undefined") return false;
  const fresh = parseAttributionParams(
    window.location.search,
    window.location.pathname,
  );
  if (!fresh) return false;

  // Preserve the first-seen timestamp if we already have a touch, but
  // let the newer ad click win the actual attribution fields.
  const existing = readAttributionCookie();
  fresh.ts = existing?.ts ?? new Date().toISOString();

  const value = encodeURIComponent(encodeAttribution(fresh));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  // SameSite=Lax so the cookie persists through the top-level navigation
  // that brings the visitor in from the ad. Not HttpOnly — the client
  // writes it; the server only ever reads it.
  document.cookie = `${ATTRIBUTION_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  return true;
}
