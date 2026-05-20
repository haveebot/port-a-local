import { NextRequest, NextResponse } from "next/server";
import {
  getFunnelStats,
  FUNNEL_SURFACES,
  type FunnelSurface,
} from "@/lib/funnelStats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Funnel-stats diagnostic — middle-of-funnel visibility for paid surfaces.
 *
 *   GET /api/wheelhouse/funnel-stats?surface=beach&hours=24
 *
 *   query:
 *     surface  one of: beach | rent | locals   (required)
 *     hours    1..168 (default 24)              (optional)
 *
 *   returns:
 *     {
 *       surface, windowHours,
 *       pageviews, checkoutStarts, checkoutCompleted, checkoutAbandoned,
 *       rates: { startPerView, completePerStart, completePerView },
 *       generatedAt
 *     }
 *
 * Wheelhouse-authed (cookie OR `Authorization: Bearer <agent token>`).
 * Cross-references PAL's own pageview analytics with Stripe Checkout
 * session data — see src/lib/funnelStats.ts for the data sources +
 * matcher logic.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const surfaceParam = url.searchParams.get("surface") ?? "";
  const hoursParam = url.searchParams.get("hours");

  const validSurfaces = Object.keys(FUNNEL_SURFACES) as FunnelSurface[];
  if (!validSurfaces.includes(surfaceParam as FunnelSurface)) {
    return NextResponse.json(
      {
        error: "invalid_surface",
        detail: `surface must be one of: ${validSurfaces.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let windowHours = 24;
  if (hoursParam != null) {
    const n = Number(hoursParam);
    if (!Number.isFinite(n) || n < 1 || n > 168) {
      return NextResponse.json(
        { error: "invalid_hours", detail: "hours must be 1..168" },
        { status: 400 },
      );
    }
    windowHours = Math.round(n);
  }

  try {
    const stats = await getFunnelStats(
      surfaceParam as FunnelSurface,
      windowHours,
    );
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[funnel-stats] failed:", err);
    return NextResponse.json(
      {
        error: "stats_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
