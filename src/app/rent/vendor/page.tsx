import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import VendorSignupForm from "./VendorSignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply — PAL Carts Vendor Pipeline",
  description:
    "Local cart-rental operation in Port Aransas? PAL sends pre-booked renters straight to you — free to apply, no subscription, no commission. We collect a small reservation fee from the customer. You keep 100% of your rate.",
};

/**
 * `/rent/vendor` — golf cart vendor signup page.
 *
 * Marketing-first; form lives below the fold. Page leads with "We send
 * the bookings. Claim what you want." per Winston's locked pitch
 * (queue-mechanic stance — vendors take what fits, the rest goes to
 * the next in line). Three explicit clarity layers up top:
 *   1. "Free to apply" banner — stops pay-to-play confusion
 *   2. "How PAL makes money" — transparent disclosure
 *   3. "What we look for" — sets the curation bar
 * Form below carries the locked v1 field set, 18+/legit-business
 * attestation, and routes to /api/rent/vendor (admin email +
 * Wheelhouse mirror; no DB persistence in v1).
 */
export default function VendorSignupPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* HERO */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/rent"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Carts · Vendor signup
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight">
            We send the bookings.
            <br />
            <span className="text-coral-400">Claim what you want.</span>
          </h1>
          <p className="text-lg text-navy-200 mt-5 font-light max-w-2xl leading-relaxed">
            Customers book carts on PAL knowing they&apos;re getting <strong className="text-sand-100">$20 off your standard daily rate</strong>. We blast each booking out to our vendor network — first to confirm wins. Skip it if you&apos;re full; someone else will take it. No bad blood, that&apos;s just how the queue works.
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
                PAL doesn&apos;t charge vendors anything — ever. No
                subscription, no commission, no monthly fee, no listing
                tier. We curate by quality, never by who pays.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-1.5">
                How PAL makes money
              </p>
              <p className="text-sm text-emerald-900 font-light leading-relaxed">
                A small <strong>$10/day reservation fee</strong> the
                customer pays at booking. That&apos;s how we keep the
                lights on — never anything from your side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE FULL PITCH */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            The deal
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-8">
            You set the rate. We send the renters.
          </h2>

          <div className="space-y-5 max-w-2xl mx-auto text-base text-navy-700 font-light leading-relaxed">
            <p>
              Customers book carts on PAL knowing they&apos;re getting
              $20 off your standard daily rate. We blast each booking
              out to our vendor network — first to confirm wins. Skip
              it if you&apos;re full; someone else will take it. No
              bad blood, that&apos;s just how the queue works.
            </p>
            <p>
              PAL collects a small $10/day reservation fee from the
              customer at booking. That&apos;s how we keep the lights
              on — never anything from your side.
            </p>
            <p>
              You set your rate. You take the bookings that fit your
              schedule. You keep 100% of what the customer pays you.
            </p>
            <p className="text-sm text-navy-500 italic">
              No subscription. No commission. No monthly fee.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE LOOK FOR */}
      <section className="bg-navy-900 text-sand-100 border-y border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2 text-center">
            What we look for
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            Vetted, locally-owned, properly insured.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Bullet
              title="Locally owned"
              body="Operating in or based out of Mustang Island / Aransas Pass / the Coastal Bend. Locals know carts, locals know customers."
            />
            <Bullet
              title="Properly insured"
              body="Active commercial liability coverage on your fleet. We confirm the carrier — never the policy doc."
            />
            <Bullet
              title="Reliable + reachable"
              body="A real phone we can text during the cart-logistics window. Clean carts, on-time delivery, professional handoff."
            />
          </div>

          <p className="text-xs text-sand-400 font-light mt-8 text-center max-w-md mx-auto">
            We curate based on these. Not on who pays us — that doesn&apos;t happen.
          </p>
        </div>
      </section>

      {/* THE FORM */}
      <section className="bg-sand-50 border-t border-sand-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2 text-center">
            Apply
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-2">
            Tell us about your fleet.
          </h2>
          <p className="text-sm text-navy-600 font-light text-center mb-8 max-w-xl mx-auto">
            We&apos;ll review and reach out within a day or two for a
            fit chat. Real humans on our end — no automated processing.
          </p>
          <VendorSignupForm />
        </div>
      </section>

      {/* CROSS-LINK BACK TO /rent */}
      <section className="bg-white border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <p className="text-sm text-navy-500 font-light">
            Looking to <em>rent</em> a cart, not list one?{" "}
            <Link
              href="/rent"
              className="text-coral-600 underline decoration-coral-300 hover:decoration-coral-500 font-medium"
            >
              Reserve a cart on PAL →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-5">
      <p className="font-display font-bold text-coral-300 text-base mb-2">
        {title}
      </p>
      <p className="text-sm text-sand-300 font-light leading-relaxed">
        {body}
      </p>
    </div>
  );
}
