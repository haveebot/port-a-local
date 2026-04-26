import Link from "next/link";
import { getLeaderboard } from "@/data/delivery-store";

/**
 * Homepage recruiting tile for PAL Delivery — appears between the
 * FeaturedEventBanner and the Gully section. Public social proof on
 * the runner economy + clear apply CTA.
 *
 * Server component (DB-backed). Returns null if there are no active
 * runners yet — keeps the homepage tight on cold-start days. Once
 * there's at least one runner with deliveries, the tile lights up.
 */
export default async function RunnerLeaderboardTile() {
  let board;
  try {
    board = await getLeaderboard();
  } catch {
    // DB hiccup — fail closed, don't break the homepage
    return null;
  }

  // Don't show a leaderboard with zero activity. The /deliver/runners
  // page handles the cold-start state; on the homepage we'd rather
  // hide than show "0 runners, $0 earned."
  if (board.runnersWithDeliveries === 0 && board.activeRunnerCount === 0) {
    return null;
  }

  const top = board.entries.find((e) => e.weekCount > 0) ?? null;
  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section className="bg-navy-950 border-y border-coral-500/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-coral-300 font-bold mb-2">
              PAL Delivery · Drive for us
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 mb-3 leading-tight">
              Real cash. Your schedule. Your bank, every delivery.
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-sand-300 font-light">
              {top && top.weekCents > 0 ? (
                <span>
                  Top runner this week:{" "}
                  <span className="font-display font-bold text-emerald-300">
                    {top.firstName}
                  </span>{" "}
                  ·{" "}
                  <span className="font-mono font-bold text-emerald-300">
                    {fmt(top.weekCents)}
                  </span>{" "}
                  over {top.weekCount} run{top.weekCount === 1 ? "" : "s"}
                </span>
              ) : (
                <span>
                  <span className="font-display font-bold text-sand-50">
                    {board.activeRunnerCount}
                  </span>{" "}
                  {board.activeRunnerCount === 1 ? "runner" : "runners"} on
                  the road. First deliveries this week.
                </span>
              )}
              {board.weekTotalCents > 0 && (
                <span className="text-sand-400">
                  · Paid out this week:{" "}
                  <span className="font-mono">
                    {fmt(board.weekTotalCents)}
                  </span>
                </span>
              )}
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
