/**
 * Funnel-stats helper — middle-of-funnel visibility for paid surfaces.
 *
 * Cross-references PAL's own pageview analytics with Stripe Checkout
 * session data to give a real read on:
 *   - pageviews on the landing page (top)
 *   - Stripe sessions created (middle — operator hit "Book & Pay Now")
 *   - Stripe sessions completed paid (bottom — purchase)
 *   - abandoned sessions (open or expired, not paid)
 *
 * Same shape across /beach, /rent, /locals — and the pattern lifts to
 * any future paid surface that goes through Stripe Checkout with a
 * `metadata.type` (or `metadata.product` for legacy locals).
 *
 * Notes:
 *   - We list at most 100 Stripe sessions per window (Stripe API per-page
 *     cap; safe for normal PAL volume). Bump pagination later if needed.
 *   - Stripe session count > PAL pageviews can happen if a customer
 *     starts a session on /beach but reaches the page via deep link
 *     (e.g. emailed share) — analytics drain may miss the pageview.
 *     Not a bug; just a measurement quirk.
 *   - Conversion rates are 0 when denominators are 0 (avoids NaN).
 */

import Stripe from "stripe";
import { sql } from "@vercel/postgres";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

/** Supported surface keys + how to identify their Stripe sessions. */
export const FUNNEL_SURFACES = {
  beach: {
    paths: ["/beach"],
    matchSession: (s: Stripe.Checkout.Session): boolean =>
      s.metadata?.type === "beach",
  },
  rent: {
    paths: ["/rent"],
    matchSession: (s: Stripe.Checkout.Session): boolean =>
      s.metadata?.type === "rent",
  },
  locals: {
    paths: ["/locals"],
    // Legacy convention: locals/buy uses `metadata.product = "locals-sell"`
    // (other surfaces use metadata.type). Worth unifying later.
    matchSession: (s: Stripe.Checkout.Session): boolean =>
      s.metadata?.product === "locals-sell",
  },
} as const;

export type FunnelSurface = keyof typeof FUNNEL_SURFACES;

export interface FunnelStats {
  surface: FunnelSurface;
  windowHours: number;
  pageviews: number;
  checkoutStarts: number;
  checkoutCompleted: number;
  checkoutAbandoned: number;
  rates: {
    startPerView: number;
    completePerStart: number;
    completePerView: number;
  };
  generatedAt: string;
}

/**
 * Count pageviews against the given paths within the time window.
 * Uses the existing wheelhouse_analytics_events table populated by the
 * Vercel Web Analytics drain.
 */
async function countPageviews(
  paths: readonly string[],
  windowHours: number,
): Promise<number> {
  // Cast to text[] so sql tagged template handles the ANY() bind cleanly.
  const pathsArr = [...paths];
  const { rows } = await sql`
    SELECT COUNT(*)::int AS n
    FROM wheelhouse_analytics_events
    WHERE path = ANY(${pathsArr as unknown as string})
      AND event_type = 'pageview'
      AND ts >= NOW() - (${windowHours} || ' hours')::interval
  `;
  return (rows[0]?.n as number) ?? 0;
}

/**
 * List Stripe Checkout sessions created within the window, filtered
 * client-side by the surface's session-matcher (since Stripe's API
 * doesn't expose a `metadata.type=` filter directly).
 */
async function listSessionsForSurface(
  surface: FunnelSurface,
  windowHours: number,
): Promise<Stripe.Checkout.Session[]> {
  const sinceUnix = Math.floor(Date.now() / 1000) - windowHours * 3600;
  const matcher = FUNNEL_SURFACES[surface].matchSession;
  const stripe = getStripe();
  const out: Stripe.Checkout.Session[] = [];
  // Single page (cap 100) — safe for current PAL volume. If we ever
  // exceed 100 sessions in a 24h window for any one surface that's a
  // very nice problem to have AND we'd want pagination here.
  const page = await stripe.checkout.sessions.list({
    created: { gte: sinceUnix },
    limit: 100,
  });
  for (const s of page.data) {
    if (matcher(s)) out.push(s);
  }
  return out;
}

/** Build a complete funnel-stats payload for a surface. */
export async function getFunnelStats(
  surface: FunnelSurface,
  windowHours: number,
): Promise<FunnelStats> {
  const conf = FUNNEL_SURFACES[surface];
  const [pageviews, sessions] = await Promise.all([
    countPageviews(conf.paths, windowHours),
    listSessionsForSurface(surface, windowHours),
  ]);

  const completed = sessions.filter((s) => s.payment_status === "paid").length;
  const starts = sessions.length;
  const abandoned = starts - completed;

  const startPerView = pageviews > 0 ? starts / pageviews : 0;
  const completePerStart = starts > 0 ? completed / starts : 0;
  const completePerView = pageviews > 0 ? completed / pageviews : 0;

  return {
    surface,
    windowHours,
    pageviews,
    checkoutStarts: starts,
    checkoutCompleted: completed,
    checkoutAbandoned: abandoned,
    rates: {
      startPerView: round4(startPerView),
      completePerStart: round4(completePerStart),
      completePerView: round4(completePerView),
    },
    generatedAt: new Date().toISOString(),
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
