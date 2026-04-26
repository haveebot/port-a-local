import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getLeaderboard } from "@/data/delivery-store";

export const dynamic = "force-dynamic";
export const revalidate = 60; // public page; cache 60s to soften DB hits

export const metadata: Metadata = {
  title: "Drive for PAL — Runner Leaderboard",
  description:
    "PAL Delivery is run by locals making real money on their own schedule. See what runners are earning this week — and apply to drive.",
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function RunnersLeaderboardPage() {
  const board = await getLeaderboard();
  const ranked = board.entries
    .filter((e) => e.weekCount > 0 || e.totalCount > 0)
    .slice(0, 20);

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-coral-500/20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-coral-300 mb-4">
            PAL Delivery · Runners
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 mb-5">
            The runners powering Port A.
          </h1>
          <p className="text-lg text-sand-300 font-light max-w-2xl mx-auto leading-relaxed">
            PAL Delivery runs on locals. Real cash, on your schedule, paid to
            your bank by Stripe. No app downloads, no quotas, no algorithm
            screwing you on a bad week.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/deliver/runner"
              className="px-7 py-4 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white"
            >
              Apply to drive →
            </Link>
            <Link
              href="/deliver"
              className="px-7 py-4 rounded-xl text-base font-bold bg-navy-800 border border-navy-700 hover:border-coral-500/50 hover:bg-navy-700 text-sand-50"
            >
              Place an order
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-navy-800 bg-navy-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              On the road
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-sand-50">
              {board.activeRunnerCount}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {board.activeRunnerCount === 1 ? "runner" : "runners"}
            </p>
          </div>
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              Today
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-emerald-300">
              {fmt(board.todayTotalCents)}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {board.todayTotalCount}{" "}
              {board.todayTotalCount === 1 ? "delivery" : "deliveries"}
            </p>
          </div>
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              7 days
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-emerald-300">
              {fmt(board.weekTotalCents)}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {board.weekTotalCount}{" "}
              {board.weekTotalCount === 1 ? "delivery" : "deliveries"}
            </p>
          </div>
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 text-center">
            <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              All time
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-emerald-300">
              {fmt(board.allTimeTotalCents)}
            </p>
            <p className="text-[10px] text-sand-400 font-mono">
              {board.allTimeTotalCount}{" "}
              {board.allTimeTotalCount === 1 ? "delivery" : "deliveries"}
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50">
              This week&apos;s leaderboard
            </h2>
            <p className="text-[10px] tracking-widest uppercase text-coral-300 font-mono">
              First name shown
            </p>
          </div>

          {ranked.length === 0 ? (
            <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 text-center">
              <p className="font-display text-xl font-bold text-sand-50 mb-2">
                The board is fresh.
              </p>
              <p className="text-sm text-sand-300 max-w-md mx-auto leading-relaxed">
                PAL Delivery is brand-new. The first runners on the road are
                charting these numbers. Want your name up here?
              </p>
              <Link
                href="/deliver/runner"
                className="inline-block mt-5 px-5 py-3 rounded-xl text-sm font-bold bg-coral-500 hover:bg-coral-600 text-white"
              >
                Apply to drive →
              </Link>
            </div>
          ) : (
            <div className="bg-navy-800 border border-navy-700 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_repeat(2,minmax(0,1fr))] sm:grid-cols-[60px_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 sm:px-6 py-3 bg-navy-900 border-b border-navy-700 text-[10px] tracking-widest uppercase font-bold text-coral-300">
                <div>#</div>
                <div>Runner</div>
                <div className="text-right">7d</div>
                <div className="text-right">Today</div>
                <div className="hidden sm:block text-right">All time</div>
              </div>
              {ranked.map((e, i) => {
                const isLeader = i === 0 && e.weekCents > 0;
                return (
                  <div
                    key={e.driverId}
                    className={
                      isLeader
                        ? "grid grid-cols-[40px_1fr_repeat(2,minmax(0,1fr))] sm:grid-cols-[60px_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 sm:px-6 py-4 border-b border-navy-700 bg-coral-500/10"
                        : "grid grid-cols-[40px_1fr_repeat(2,minmax(0,1fr))] sm:grid-cols-[60px_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 sm:px-6 py-4 border-b border-navy-700 last:border-b-0"
                    }
                  >
                    <div
                      className={
                        isLeader
                          ? "font-display font-bold text-coral-300"
                          : "font-display font-bold text-sand-300"
                      }
                    >
                      {i + 1}
                    </div>
                    <div className="font-display font-bold text-base text-sand-50 truncate">
                      {e.firstName}
                      {isLeader && (
                        <span className="ml-2 text-[10px] tracking-widest uppercase text-coral-300 font-mono">
                          ← leader
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold tabular-nums text-emerald-300">
                        {fmt(e.weekCents)}
                      </p>
                      <p className="text-[10px] text-sand-400 font-mono">
                        {e.weekCount} run{e.weekCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono tabular-nums text-sand-200">
                        {fmt(e.todayCents)}
                      </p>
                      <p className="text-[10px] text-sand-400 font-mono">
                        {e.todayCount} run{e.todayCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="font-mono tabular-nums text-sand-200">
                        {fmt(e.totalCents)}
                      </p>
                      <p className="text-[10px] text-sand-400 font-mono">
                        {e.totalCount} run{e.totalCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-sand-500 text-center mt-4 font-light">
            Updated continuously. Earnings = runner take-home (50% markup +
            50% delivery + 100% tips). Excludes tax + service fee.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-navy-800 bg-navy-950 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 text-center mb-10">
            How driving for PAL works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
                01
              </p>
              <p className="font-display font-bold text-base text-sand-50 mb-2">
                Apply
              </p>
              <p className="text-sm text-sand-300 font-light leading-relaxed">
                Quick form — name, phone, vehicle. We approve fast (often
                same day) and email a sign-in link.
              </p>
            </div>
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
                02
              </p>
              <p className="font-display font-bold text-base text-sand-50 mb-2">
                Set up payouts
              </p>
              <p className="text-sm text-sand-300 font-light leading-relaxed">
                Stripe Connect Express — same flow Lyft + DoorDash use. Bank
                account in five minutes. We never see your numbers.
              </p>
            </div>
            <div className="bg-navy-900 border border-navy-800 rounded-xl p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
                03
              </p>
              <p className="font-display font-bold text-base text-sand-50 mb-2">
                Toggle on. Drive.
              </p>
              <p className="text-sm text-sand-300 font-light leading-relaxed">
                Order pings hit your phone via SMS + email. First to claim
                wins. Auto-payout the moment you mark delivered.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/deliver/runner"
              className="inline-block px-8 py-4 rounded-xl text-base font-bold bg-coral-500 hover:bg-coral-600 text-white"
            >
              Apply to drive PAL →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
