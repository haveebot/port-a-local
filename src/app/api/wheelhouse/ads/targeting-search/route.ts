import { NextRequest, NextResponse } from "next/server";
import { searchTargeting } from "@/lib/metaAds";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Look up Meta Marketing API targeting options by type + query string.
 *
 *   GET /api/wheelhouse/ads/targeting-search?type=X&q=Y&limit=N
 *
 * Supported types:
 *   - `adinterest`        — text search for interest categories
 *   - `adgeolocation`     — text search for geo entities (city, region, zip)
 *   - `adlocale`          — text search for language locales
 *   - `behaviors`         — browse-all behaviors (use `q` to client-filter)
 *   - `demographics`      — browse-all demographics (income brackets etc.)
 *   - `income`            — browse-all income brackets
 *   - `family_statuses`   — browse-all family/relationship statuses
 *   - `life_events`       — browse-all life-event categories
 *   - `industries`        — browse-all industry categories
 *
 * Returns the raw Meta `data` array — operator picks IDs by name.
 * Used to build `customTargeting` JSON for `/api/wheelhouse/ads/create`
 * without pre-building a Saved Audience in Meta UI.
 *
 * Examples:
 *   GET ?type=adinterest&q=Port+Aransas
 *   GET ?type=behaviors&q=engaged+shop
 *   GET ?type=demographics&q=household+income
 *
 * Auth: Wheelhouse middleware (cookie or bearer).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "").trim();
  const q = (url.searchParams.get("q") ?? "").trim();
  const limitRaw = Number(url.searchParams.get("limit") ?? "25");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, limitRaw), 100)
    : 25;

  if (!type) {
    return NextResponse.json(
      {
        error: "missing_type",
        detail:
          "Required ?type= param. Supported: adinterest, adgeolocation, behaviors, demographics, income, life_events, industries, family_statuses, adlocale.",
      },
      { status: 400 },
    );
  }

  const result = await searchTargeting({ type, q, limit });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "unknown_error" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    type,
    q: q || null,
    count: result.results?.length ?? 0,
    results: result.results ?? [],
  });
}
