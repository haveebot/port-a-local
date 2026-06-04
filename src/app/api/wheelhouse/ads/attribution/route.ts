import { NextRequest, NextResponse } from "next/server";
import { getBookingsBySource } from "@/data/beach-claim-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/wheelhouse/ads/attribution?days=30
 *
 * Bearer/cookie-authed (middleware) JSON view of beach bookings grouped
 * by ad source + campaign — the first-party, ground-truth conversion
 * side of cost-per-booking. Pair each row's `bookings` against the
 * matching campaign's spend from /api/wheelhouse/ads/list:
 *
 *   cost_per_booking = campaign.insights.spendCents / bookings
 *
 * Mirrors the ads/list contract so an agent session can pull both and
 * compute ROI without scraping a page. Cart rentals attribute on Meta's
 * side via the Conversions API (their store is vendor-orchestration, not
 * a booking record); beach is the first-party-tracked flow here.
 */
export async function GET(req: NextRequest) {
  const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const sinceDays = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : 30;

  const bookingsBySource = await getBookingsBySource(sinceDays);
  const totalBookings = bookingsBySource.reduce((n, r) => n + r.bookings, 0);
  const attributedBookings = bookingsBySource
    .filter((r) => r.utmSource || r.utmCampaign)
    .reduce((n, r) => n + r.bookings, 0);

  return NextResponse.json({
    ok: true,
    fetchedAt: new Date().toISOString(),
    sinceDays,
    totalBookings,
    attributedBookings,
    organicOrUntracked: totalBookings - attributedBookings,
    bookingsBySource,
  });
}
