import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getLeaderboard } from "@/data/delivery-store";
import RestaurantSignupForm from "./RestaurantSignupForm";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Apply — PAL Delivery Restaurant Pipeline",
  description:
    "Local restaurant in Port Aransas? PAL handles delivery, our drivers pick up, you keep your full menu price on every order. Free to apply, never a commission, no subscription.",
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * `/deliver/restaurant` — restaurant signup page for PAL Delivery.
 *
 * Marketing-first; form below the fold. Lead pitch: "Your menu price.
 * Period." (Winston-locked.) Three-layer clarity stack at top:
 *   1. "Free to apply" banner
 *   2. "How PAL makes money" — customer-side fees only
 *   3. "What we look for" — sets curation bar
 * Form carries the closed-loop runner opt-in toggle with a collapsible
 * explainer so restaurants self-educate before opting in (Strategy
 * Notes Batch 2 §4 recommended UX (c)).
 *
 * Pulls live runner stats from getLeaderboard() for the social-proof
 * strip — agnostic stats only (no specific restaurant logos).
 */
export default async function RestaurantSignupPage() {
  const board = await getLeaderboard();

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* HERO */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/deliver"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Delivery · Restaurant signup
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight">
            Your menu price.
            <br />
            <span className="text-coral-400">Period.</span>
          </h1>
          <p className="text-lg text-navy-200 mt-5 font-light max-w-2xl leading-relaxed">
            PAL delivers from your restaurant. We don&apos;t take a
            commission. Your menu price is your revenue, every order. We
            mark up the customer side for delivery + service — never
            your side. Local runners pick up. We dispatch. You make the
            food.
          </p>
        </div>
      </section>

      {/* FREE TO APPLY BANNER + REVENUE DISCLOSURE */}
      <section className="bg-emerald-50 border-b border-emerald-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-1.5">
                Free to apply
              </p>
              <p className="text-sm text-emerald-900 font-light leading-relaxed">
                PAL never charges your restaurant — no commission, no
                subscription, no platform fee, no monthly cost. We
                curate by quality, never by who pays.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-1.5">
                How PAL makes money
              </p>
              <p className="text-sm text-emerald-900 font-light leading-relaxed">
                Customer-side delivery + service fees marked up on top
                of your menu price. <strong>Your menu price stays your
                revenue</strong> — full stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECEIPT-STYLE MATH BREAKDOWN */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            The math
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-2">
            Same menu, same price you charge at the counter.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            Sample order — $14 menu item:
          </p>

          <div className="bg-sand-50 border border-sand-200 rounded-2xl p-6 font-mono text-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-navy-700">
                <span>Menu item (your price)</span>
                <span className="tabular-nums">$14.00</span>
              </div>
              <div className="flex justify-between text-navy-700">
                <span>+ Delivery fee (customer pays)</span>
                <span className="tabular-nums">$5.00</span>
              </div>
              <div className="flex justify-between text-navy-700">
                <span>+ Service fee (customer pays)</span>
                <span className="tabular-nums">$2.00</span>
              </div>
              <div className="flex justify-between text-navy-700 border-t border-sand-200 pt-2">
                <span>Customer total</span>
                <span className="tabular-nums font-bold">$21.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 pt-2 border-t-2 border-emerald-300">
                <span className="font-bold">You keep</span>
                <span className="tabular-nums font-bold text-lg">$14.00</span>
              </div>
            </div>
            <p className="text-[11px] text-navy-500 font-light mt-4 leading-relaxed text-center">
              Tip goes 100% to the runner. Every fee on this receipt is
              what the customer pays — never deducted from your menu price.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE STATS — AGNOSTIC SOCIAL PROOF */}
      {(board.weekTotalCount > 0 || board.activeRunnerCount > 0) && (
        <section className="bg-navy-900 text-sand-100 border-y border-coral-500/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2 text-center">
              The runner network
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-7">
              Real drivers. Real cash. Real local.
            </h2>
            <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
              <Stat
                label="On the road"
                value={String(board.activeRunnerCount)}
                detail={
                  board.activeRunnerCount === 1 ? "runner" : "runners"
                }
              />
              <Stat
                label="Paid out · 7 days"
                value={fmt(board.weekTotalCents)}
                detail={`${board.weekTotalCount} ${board.weekTotalCount === 1 ? "delivery" : "deliveries"}`}
              />
              <Stat
                label="All time"
                value={fmt(board.allTimeTotalCents)}
                detail={`${board.allTimeTotalCount} ${board.allTimeTotalCount === 1 ? "delivery" : "deliveries"}`}
              />
            </div>
            <p className="text-[11px] text-sand-400 font-light text-center mt-5">
              Live · numbers update as runners deliver
            </p>
          </div>
        </section>
      )}

      {/* WHAT WE LOOK FOR */}
      <section className="bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            What we look for
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
            Licensed, local, ready to ticket.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Bullet
              title="Licensed food service"
              body="Active TX food-service license + health permits. Standard stuff — we don't deliver from someone's backyard."
            />
            <Bullet
              title="Reachable + reliable"
              body="A real phone we can text during service hours. Order tickets land via your existing POS, email, or printed."
            />
            <Bullet
              title="Menu we can route"
              body="Web menu URL works. Photo of a printed menu works. We'll digitize if needed — that part is on us."
            />
          </div>

          <p className="text-xs text-navy-500 font-light mt-8 text-center max-w-md mx-auto">
            We curate based on these. Not on who pays us — that doesn&apos;t happen.
          </p>
        </div>
      </section>

      {/* THE FORM */}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            Apply
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-2">
            Tell us about your restaurant.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            We&apos;ll review and reach out within a day or two for a
            fit chat. Real humans on our end — no automated processing.
          </p>
          <RestaurantSignupForm />
        </div>
      </section>

      {/* CROSS-LINKS */}
      <section className="bg-sand-50 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <p className="text-sm text-navy-500 font-light">
              Looking to <em>order</em> from a PAL restaurant?{" "}
              <Link
                href="/deliver"
                className="text-coral-600 underline decoration-coral-300 hover:decoration-coral-500 font-medium"
              >
                Place an order →
              </Link>
            </p>
            <p className="text-sm text-navy-500 font-light">
              Want to <em>drive</em> for PAL?{" "}
              <Link
                href="/deliver/runner"
                className="text-coral-600 underline decoration-coral-300 hover:decoration-coral-500 font-medium"
              >
                Apply to drive →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl p-5">
      <p className="font-display font-bold text-navy-900 text-base mb-2">
        {title}
      </p>
      <p className="text-sm text-navy-600 font-light leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 text-center">
      <p className="text-[9px] font-bold tracking-widest uppercase text-coral-300 mb-1">
        {label}
      </p>
      <p className="font-display text-2xl font-bold tabular-nums text-emerald-300">
        {value}
      </p>
      <p className="text-[10px] text-sand-400 font-mono">{detail}</p>
    </div>
  );
}
