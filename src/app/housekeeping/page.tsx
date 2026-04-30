import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import HousekeepingForm from "./HousekeepingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Housekeeping — Port A Local",
  description:
    "Book a Port Aransas vacation rental cleaning at $100/hr. 1-hour minimum, ~1 hour per 1,000 sqft. Local team, fully insured.",
};

/**
 * `/housekeeping` — book a cleaning. PAL-owned shell-entity dispatch
 * (placeholder brand: Local Girls Cleaning). Customer pays upfront via
 * Stripe Checkout; PAL handles coordination + payout to cleaning team
 * out of band for v1. Marketplace blast pattern arrives in v2.
 *
 * Brand placeholder note: "Local Girls Cleaning" is Winston's working
 * name pending Collie review. Surfaced consistently across page,
 * Stripe checkout product description, and admin email.
 */
export default function HousekeepingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Housekeeping
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight">
            Book a cleaning.
            <br />
            <span className="text-coral-400">$100/hour. Local team.</span>
          </h1>
          <p className="text-lg text-navy-200 mt-5 font-light max-w-2xl">
            Vacation rental, beach house, or your own front porch.
            One-hour minimum, ~1 hour per 1,000 square feet. Pay upfront,
            we dispatch, you come home to clean.
          </p>

          <div className="mt-8 inline-flex items-baseline gap-3 px-6 py-3 rounded-2xl bg-coral-500/15 border border-coral-500/40">
            <span className="font-display text-2xl font-bold text-coral-300">
              $100
            </span>
            <span className="text-sand-300 font-light text-base">
              per hour · 1-hour minimum
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            How it works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
            Four steps, no calls.
          </h2>

          <ol className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <Step
              n="1"
              title="Tell us the place"
              body="Address + square footage. We auto-calculate hours."
            />
            <Step
              n="2"
              title="Pay upfront"
              body="Secure Stripe checkout. $100/hr × estimated hours."
            />
            <Step
              n="3"
              title="We dispatch"
              body="Local Girls Cleaning takes it from here — confirmed timing, key handoff, the works."
            />
            <Step
              n="4"
              title="Walk in clean"
              body="Done by your preferred date. Reply with feedback any time."
            />
          </ol>
        </div>
      </section>

      {/* THE FORM */}
      <section className="bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            Book it
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-2">
            Book a cleaning.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            Auto-priced as you type. Pay through Stripe; we handle dispatch
            + scheduling.
          </p>
          <HousekeepingForm />
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="bg-navy-900 text-sand-100 border-t border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2 text-center">
            What we cover
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            Standard cleaning, top to bottom.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-sm">
            <Bullet>Kitchen — counters, appliances, sink, floor</Bullet>
            <Bullet>Bathrooms — toilets, showers, mirrors, floor</Bullet>
            <Bullet>Bedrooms — bed strip + remake, dust, vacuum</Bullet>
            <Bullet>Living areas — dust, vacuum, surfaces</Bullet>
            <Bullet>Trash out, recycling sorted</Bullet>
            <Bullet>Quick exterior porch sweep</Bullet>
          </div>

          <p className="text-xs text-sand-400 font-light mt-8 text-center max-w-md mx-auto">
            Deep cleans, move-out cleans, post-storm cleanup —
            email <a href="mailto:hello@theportalocal.com" className="underline decoration-sand-500 hover:decoration-coral-400">hello@theportalocal.com</a> for custom quotes.
          </p>
        </div>
      </section>

      <Footer />
    </main>
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
    <li className="bg-white border border-sand-200 rounded-2xl p-5 list-none">
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-coral-500 mb-2">
        Step {n}
      </div>
      <p className="font-display font-bold text-navy-900 text-base mb-1.5">
        {title}
      </p>
      <p className="text-xs text-navy-500 font-light leading-relaxed">
        {body}
      </p>
    </li>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-coral-400 font-bold mt-0.5">→</span>
      <span className="text-sand-200 font-light">{children}</span>
    </div>
  );
}
