import Link from "next/link";
import { getLeaderboard } from "@/data/delivery-store";
import { getLocalEarnings, fmtUsd } from "@/data/local-earnings";

/**
 * Homepage recruiting tile for PAL Delivery — appears between the
 * FeaturedEventBanner and the Gully section.
 *
 * Per Winston rule 2026-04-29: REAL demand-side metrics + REAL
 * local-earnings totals. Never fabricated leaderboards. Cold-start
 * uses honest demand-side framing rather than fake activity.
 *
 * Three states the tile renders:
 *   1. Cold-start (no runners + no PAL-wide local earnings yet) →
 *      "Apply to drive" with $5 welcome bonus call-out
 *   2. Cold-start delivery + warm PAL-wide ($$ flowing in adjacent
 *      verticals) → "$X paid to local folks across PAL — delivery
 *      is the open lane"
 *   3. Warm delivery → real top runner + real weekly stats
 */
export default async function RunnerLeaderboardTile() {
  let board;
  let earnings;
  try {
    [board, earnings] = await Promise.all([
      getLeaderboard(),
      getLocalEarnings(),
    ]);
  } catch {
    return null; // DB hiccup — fail closed, don't break the homepage
  }

  const palWideMonth = earnings.totals.monthCents;

  // Recruiting number tracks the SQL signup offset (CASE WHEN raw_num <= 1
  // THEN raw_num ELSE raw_num + 3). After Winston (#1) the next driver lands
  // at #5; subsequent drivers go #6, #7, etc. Computed dynamically so it
  // stays correct as the team grows.
  const nextDriverNumber =
    board.activeRunnerCount === 0
      ? 1
      : board.activeRunnerCount === 1
        ? 5
        : board.activeRunnerCount + 4;

  // Note: per Winston 2026-04-29 — homepage tile intentionally OMITS the
  // "Top runner this week: Driver #N · $X" line. With small early numbers
  // it reads as underwhelming social proof. The /deliver/runners page is
  // the right home for the actual leaderboard. Homepage gets the hybrid
  // stack: driver-hook headline + cross-vertical PAL momentum blurbs.

  return (
    <section className="bg-navy-950 border-y border-coral-500/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-coral-300 font-bold mb-2">
              PAL Delivery · Drive for us
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 mb-2 leading-tight">
              Real cash. Your schedule. Your bank, every delivery.
            </h2>
            <p className="text-sm text-emerald-300 font-bold mb-3">
              <span className="font-display text-base">+ $5</span> welcome
              bonus on your first delivery.
            </p>

            {/* Hybrid stack: driver-hook headline + cross-vertical PAL
                momentum blurbs (cart blasts + beach cabana setups +
                locals sales). The actual leaderboard lives at
                /deliver/runners — homepage stays uncluttered. */}
            <div className="space-y-3">
              <p className="text-sm text-sand-300 font-light">
                <span className="text-emerald-300 font-display font-bold text-base">
                  Be Driver #{nextDriverNumber}.
                </span>{" "}
                Apply now and catch the first orders that land.
              </p>
              <div className="text-[13px] text-sand-400 font-light space-y-1">
                {earnings.beach.allTimeCents > 0 ? (
                  <p>
                    🏖️{" "}
                    <span className="font-mono font-bold text-emerald-300">
                      {fmtUsd(earnings.beach.allTimeCents)}
                    </span>{" "}
                    paid to local cabana setup vendors (
                    {earnings.beach.bookingsPaidOutAllTime} booking
                    {earnings.beach.bookingsPaidOutAllTime === 1 ? "" : "s"})
                  </p>
                ) : (
                  <p>🏖️ Beach cabana setup launches across the season — vendor blasts already routing</p>
                )}
                <p>
                  🛺 Golf cart vendor blasts going out to{" "}
                  <span className="font-bold text-sand-300">14+ local cart cos</span>{" "}
                  on every booking — first to claim wins
                </p>
                {earnings.locals.allTimeCents > 0 && (
                  <p>
                    🛒{" "}
                    <span className="font-mono font-bold text-emerald-300">
                      {fmtUsd(earnings.locals.allTimeCents)}
                    </span>{" "}
                    paid to local sellers via PAL Locals (
                    {earnings.locals.salesAllTime} sale
                    {earnings.locals.salesAllTime === 1 ? "" : "s"})
                  </p>
                )}
                {palWideMonth >= 10000 && (
                  <p className="pt-1 border-t border-navy-800">
                    <span className="font-mono font-bold text-emerald-300">
                      {fmtUsd(palWideMonth)}
                    </span>{" "}
                    total to local Port A folks via PAL in the last 30 days. Delivery is the open lane.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 md:min-w-[200px]">
            <Link
              href="/deliver/runner"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-coral-500 hover:bg-coral-600 text-white text-center"
            >
              Apply to drive →
            </Link>
            <Link
              href="/deliver/runners"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-50 text-center"
            >
              See the leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
