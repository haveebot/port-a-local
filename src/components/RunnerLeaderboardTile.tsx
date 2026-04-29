import Link from "next/link";
import { getLeaderboard } from "@/data/delivery-store";
import { getLocalEarnings, fmtUsd } from "@/data/local-earnings";

/**
 * Homepage recruiting tile for PAL Delivery — appears between the
 * FeaturedEventBanner and the Gully section.
 *
 * Per Winston rule 2026-04-29: REAL demand-side metrics + REAL
 * local-earnings totals. Never fabricated leaderboards. Cold-start
 * uses an honest founder-story hook ("Be Driver #1") rather than fake
 * activity.
 *
 * Three states the tile renders:
 *   1. Cold-start (no runners + no PAL-wide local earnings yet) →
 *      "Be the first runner" framing
 *   2. Cold-start delivery + warm PAL-wide ($$ flowing in adjacent
 *      verticals) → "$X paid to local folks across PAL — be the
 *      first delivery runner"
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

  const top = board.entries.find((e) => e.weekCount > 0) ?? null;
  const palWideMonth = earnings.totals.monthCents;
  const deliveryAllTime = earnings.delivery.allTimeCents;
  const showRealLeaderboard = top && top.weekCents > 0;
  const palWideHasMomentum = palWideMonth >= 10000; // ≥ $100 across PAL last 30d

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

            {/* Real leaderboard if there's actual activity */}
            {showRealLeaderboard ? (
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-sand-300 font-light">
                <span>
                  Top runner this week:{" "}
                  <span className="font-mono font-bold text-emerald-300">
                    Driver #{top.signupNumber}
                  </span>{" "}
                  ·{" "}
                  <span className="font-mono font-bold text-emerald-300">
                    {fmtUsd(top.weekCents)}
                  </span>{" "}
                  over {top.weekCount} run{top.weekCount === 1 ? "" : "s"}
                </span>
                {board.weekTotalCents > 0 && (
                  <span className="text-sand-400">
                    · Paid out this week:{" "}
                    <span className="font-mono">{fmtUsd(board.weekTotalCents)}</span>
                  </span>
                )}
              </div>
            ) : (
              /* Cold-start delivery: lean on PAL-wide local earnings + founder hook */
              <div className="space-y-2">
                <p className="text-sm text-sand-300 font-light">
                  <span className="text-emerald-300 font-display font-bold text-base">
                    Be Driver #{(board.activeRunnerCount ?? 0) + 1}.
                  </span>{" "}
                  First runner to 10 deliveries gets <span className="text-emerald-300 font-bold">$100 + a shirt.</span>
                </p>
                {palWideHasMomentum && (
                  <p className="text-[13px] text-sand-400 font-light">
                    PAL has paid local Port A folks{" "}
                    <span className="font-mono font-bold text-emerald-300">
                      {fmtUsd(palWideMonth)}
                    </span>{" "}
                    in the last 30 days across cabana setups, vendor blasts, and locals
                    sales. Delivery is the open lane.
                  </p>
                )}
                {!palWideHasMomentum && deliveryAllTime > 0 && (
                  <p className="text-[13px] text-sand-400 font-light">
                    Local runners have earned{" "}
                    <span className="font-mono font-bold text-emerald-300">
                      {fmtUsd(deliveryAllTime)}
                    </span>{" "}
                    so far ({earnings.delivery.deliveriesPaidOutAllTime} deliver
                    {earnings.delivery.deliveriesPaidOutAllTime === 1 ? "y" : "ies"}). Be next.
                  </p>
                )}
              </div>
            )}
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
