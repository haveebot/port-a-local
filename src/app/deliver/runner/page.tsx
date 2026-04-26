import type { Metadata } from "next";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import RunnerSignupForm from "./RunnerSignupForm";
import {
  DELIVERY_FEE_CENTS,
  DRIVER_DELIVERY_SHARE,
  DRIVER_MARKUP_SHARE,
  formatUSD,
} from "@/data/delivery-pricing";
import { RESTAURANTS } from "@/data/delivery-restaurants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drive for PAL — make beach-day money on the island",
  description:
    "Local runners only. Earn $20-35/hour running food from Port A spots to vacation rentals. Half our markup is yours, plus 100% of every tip, paid daily.",
};

/**
 * Compute the typical-delivery economics example from live constants so
 * the marketing math never goes stale when we change pricing knobs.
 *
 * Anchor on a "typical" $25 base order (avg of the seed menus).
 */
function exampleEconomics() {
  const baseCents = 2500; // typical order
  const restaurant = RESTAURANTS[0]; // anchor on the higher-markup restaurant
  const markupPct = restaurant?.markupPct ?? 45;
  const customerSubtotal = Math.round(baseCents * (1 + markupPct / 100));
  const markup = customerSubtotal - baseCents;
  const driverMarkupShare = Math.round(markup * DRIVER_MARKUP_SHARE);
  const driverDeliveryShare = Math.round(
    DELIVERY_FEE_CENTS * DRIVER_DELIVERY_SHARE,
  );
  const tipCents = 500; // typical $5 tip
  const driverTotal = driverMarkupShare + driverDeliveryShare + tipCents;
  return {
    markupPct,
    customerSubtotal,
    markup,
    driverMarkupShare,
    driverDeliveryShare,
    tipCents,
    driverTotal,
  };
}

export default function RunnerSignup() {
  const ex = exampleEconomics();

  return (
    <main className="min-h-screen bg-sand-50">
      {/* HERO */}
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Run for PAL
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
            Make beach-day money
            <br />
            <span className="text-coral-400">running local food.</span>
          </h1>
          <p className="text-sand-300 font-light mt-5 max-w-2xl text-base sm:text-lg">
            Pick up at Crazy Cajun. Drop off at a rental on Beach Access 1.
            Be on a beer at sunset. We pay you daily.
          </p>

          {/* The big number */}
          <div className="mt-8 inline-flex items-baseline gap-3 px-6 py-4 rounded-2xl bg-coral-500/15 border border-coral-500/40">
            <span className="font-display text-5xl sm:text-6xl font-bold text-coral-300 tabular-nums">
              {formatUSD(ex.driverTotal)}
            </span>
            <span className="text-sand-300 font-light text-base">
              typical run · {formatUSD(ex.tipCents)} tip
            </span>
          </div>
          <p className="text-xs text-sand-400 mt-3 max-w-md">
            Average $25 order, $5 tip. Bigger orders, bigger tips, more
            money. Two runs an hour and you&apos;re at $30+/hour.
          </p>

          {/* $5 first-delivery welcome bonus — auto-fires on first run. */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
            <span className="font-display text-xl font-bold text-emerald-300">
              + $5
            </span>
            <span className="text-sm text-emerald-100 font-light">
              welcome bonus on your first delivery — auto to your bank
            </span>
          </div>
        </div>
      </header>

      {/* WHY PAL — the actual differentiation */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            Why PAL beats DoorDash for Port A locals
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
            We pay you like a partner.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reason
              big="50/50"
              title="We split the markup with you."
              body="Every order has a markup baked in. DoorDash keeps 100% of theirs. We split ours with you, half-and-half. Real money in your pocket per delivery — not just delivery fee + tip."
            />
            <Reason
              big="100%"
              title="100% of every tip is yours."
              body="Pre-tip, post-tip, surprise cash on the doorstep — all yours. We don't touch tips. Ever."
            />
            <Reason
              big="🏖️"
              title="Vacation rentals, not random houses."
              body="You're delivering to people on vacation, drinking on the porch, ready to tip. Not stressed-out office workers in a high-rise. Different vibe, better tips."
            />
            <Reason
              big="$0"
              title="No app to download. No fees."
              body="One link in your text messages, one bookmark. We never charge you a platform fee, monthly fee, gear fee — anything. You drive, you earn."
            />
            <Reason
              big="📍"
              title="Your neighborhood. Your hours."
              body="You set when you go on duty. You drive the routes you already know. PA is small — most deliveries are sub-2 miles."
            />
            <Reason
              big="⏱️"
              title="Daily payouts to your bank."
              body="Stripe handles your bank info. Cash hits 1-2 days after each delivery (instant for $0.50). No waiting two weeks for a paycheck."
            />
          </div>
        </div>
      </section>

      {/* THE BREAKDOWN — visual money math */}
      <section className="bg-sand-100 border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            How the money works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-2">
            Every dollar tracked. No surprises.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            Example: a {formatUSD(2500)} food order with a {formatUSD(ex.tipCents)} tip from the customer.
          </p>

          <div className="bg-white border border-sand-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <BreakRow
              label={`${ex.markupPct}% markup, split 50/50 with you`}
              detail="(half is yours, half is PAL's)"
              value={formatUSD(ex.driverMarkupShare)}
              accent
            />
            <BreakRow
              label="Delivery fee, split 50/50 with you"
              detail="(half is yours, half is PAL's)"
              value={formatUSD(ex.driverDeliveryShare)}
              accent
            />
            <BreakRow
              label="Customer's tip"
              detail="(100% yours)"
              value={formatUSD(ex.tipCents)}
              accent
            />
            <hr className="border-sand-200 my-4" />
            <div className="flex items-baseline justify-between">
              <span className="font-display font-bold text-navy-900 text-lg">
                You take home, this run
              </span>
              <span className="font-display font-bold text-coral-600 text-2xl tabular-nums">
                {formatUSD(ex.driverTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-6">
            <Stat
              top="2/hr"
              bot={`= ${formatUSD(ex.driverTotal * 2)}/hour`}
            />
            <Stat
              top="3/hr"
              bot={`= ${formatUSD(ex.driverTotal * 3)}/hour`}
            />
            <Stat
              top="40 a week"
              bot={`= ${formatUSD(ex.driverTotal * 40)}/week`}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            How it works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
            Five steps, one phone.
          </h2>

          <ol className="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-3xl mx-auto">
            <Step n="1" title="Sign up" body="Form below. We text you for a quick fit chat." />
            <Step n="2" title="Get a ping" body="New order? Every on-duty runner gets text + email." />
            <Step n="3" title="Tap to claim" body="First runner wins. No bidding, no surge games." />
            <Step n="4" title="Pickup + drop" body="PAL pays the restaurant. You drive." />
            <Step n="5" title="Cash in" body="Stripe drops your payout to your bank. Daily." />
          </ol>
        </div>
      </section>

      {/* WHO WE'RE LOOKING FOR */}
      <section className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2 text-center">
            What it takes
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            Local. Reliable. Knows the island.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Need title="You actually live here" body="Or close enough that &quot;I'll be there in 10&quot; is honest. We're not hiring outside Mustang Island." />
            <Need title="Vehicle that runs" body="Car, truck, golf cart — your call. PA's small and flat, anything works." />
            <Need title="Phone you answer" body="Smart enough to read text. Charged enough to last a Saturday." />
            <Need title="You can read a vibe" body="Vacation deliveries aren't Uber Eats. Be friendly. Carry a smile to the door." />
          </div>

          <p className="text-xs text-sand-400 font-light mt-8 text-center max-w-md mx-auto">
            We&apos;re intentionally small at first. A handful of runners we
            trust, then we grow as PAL Delivery does. Quality over volume.
          </p>
        </div>
      </section>

      {/* THE FORM */}
      <section className="bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            Ready?
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-2">
            Get on the runner list.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            Two minutes. We text or call within a day. Once you&apos;re vetted,
            we send you the dispatch link + the Stripe payout setup. Done.
          </p>
          <div className="max-w-md mx-auto">
            <RunnerSignupForm />
          </div>
        </div>
      </section>

      {/* TINY FOOTER STRIP */}
      <section className="bg-navy-950 text-sand-400 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <span>
            Already a runner?{" "}
            <Link
              href="/deliver/driver/lookup"
              className="text-coral-300 underline decoration-coral-500/40"
            >
              Find your driver links →
            </Link>
          </span>
          <span className="text-sand-500">
            Questions?{" "}
            <a
              href="mailto:hello@theportalocal.com"
              className="text-coral-300 underline decoration-coral-500/40"
            >
              hello@theportalocal.com
            </a>
          </span>
        </div>
      </section>
    </main>
  );
}

function Reason({
  big,
  title,
  body,
}: {
  big: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-sand-50 border border-sand-200 rounded-xl p-5">
      <div className="font-display text-3xl font-bold text-coral-600 mb-1 tracking-tight">
        {big}
      </div>
      <p className="font-display font-bold text-navy-900 text-base mb-1">
        {title}
      </p>
      <p className="text-sm text-navy-600 font-light">{body}</p>
    </div>
  );
}

function BreakRow({
  label,
  detail,
  value,
  accent,
}: {
  label: string;
  detail?: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-sand-100 last:border-b-0">
      <div className="min-w-0 flex-1 pr-3">
        <p className={`text-sm ${accent ? "text-navy-900 font-semibold" : "text-navy-600"}`}>
          {label}
        </p>
        {detail && (
          <p className="text-[11px] text-navy-400 font-light">{detail}</p>
        )}
      </div>
      <span
        className={`font-mono tabular-nums flex-shrink-0 ${accent ? "text-emerald-700 font-bold" : "text-navy-700"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ top, bot }: { top: string; bot: string }) {
  return (
    <div className="bg-white border border-sand-200 rounded-lg p-4 text-center">
      <p className="font-display text-xl font-bold text-navy-900">{top}</p>
      <p className="text-xs text-navy-500 font-mono mt-1">{bot}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="text-center">
      <div className="font-display text-3xl font-bold text-coral-500 mb-1">
        {n}
      </div>
      <p className="font-display font-bold text-navy-900 text-sm">{title}</p>
      <p className="text-xs text-navy-500 font-light mt-1">{body}</p>
    </li>
  );
}

function Need({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-coral-400 pl-4">
      <p className="font-display font-bold text-sand-50 text-base">{title}</p>
      <p className="text-sm text-sand-300 font-light mt-1">{body}</p>
    </div>
  );
}
