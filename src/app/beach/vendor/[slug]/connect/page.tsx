import { notFound } from "next/navigation";
import Stripe from "stripe";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { beachVendors } from "@/data/beach-vendors";
import {
  getBeachVendorStatus,
  setBeachVendorPayoutsEnabled,
} from "@/data/beach-vendor-status";
import ConnectStartButton from "./ConnectStartButton";

export const dynamic = "force-dynamic";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

export const metadata = {
  title: "Stripe payouts setup — PAL Beach Vendors",
};

/**
 * /beach/vendor/[slug]/connect
 *
 * Vendor-facing page for John / Tyler / Danny to onboard their Stripe
 * Connect Express account, so PAL can auto-transfer their share when
 * they claim and fulfill a beach booking. Vendor receives a personal
 * link via SMS (Winston sends), clicks, completes the Stripe-hosted
 * onboarding form (identity + bank account), returns here for status.
 */
export default async function BeachVendorConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ onboarded?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { onboarded, error } = await searchParams;
  const vendor = beachVendors.find((v) => v.slug === slug);
  if (!vendor) notFound();

  let status = await getBeachVendorStatus(slug);

  // If we just bounced back from Stripe and have an account ID, sync
  // payouts_enabled so the page reflects the latest state.
  if (status.stripeAccountId && !status.payoutsEnabled) {
    try {
      const account = await getStripe().accounts.retrieve(status.stripeAccountId);
      if (account.payouts_enabled) {
        await setBeachVendorPayoutsEnabled(slug, true);
        status = await getBeachVendorStatus(slug);
      }
    } catch (err) {
      console.error("[beach/vendor/connect] retrieve failed:", err);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center gap-3">
          <LighthouseMark size={36} variant="light" />
          <p className="font-display font-bold text-sand-50 text-lg">
            Port A Local
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-coral-600 font-mono mb-2">
            Beach Vendor — Payout Setup
          </p>
          <h1 className="font-display text-3xl font-bold mb-3">
            Hi {vendor.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-navy-600 leading-relaxed mb-2">
            This is your one-time Stripe payouts setup for Port A Local
            beach bookings. Once you complete the form on Stripe&apos;s
            site (identity check + bank account), we&apos;ll auto-transfer
            your <strong>$275 cabana</strong> / <strong>$75 chair-set</strong>{" "}
            share to your bank whenever you claim and fulfill a booking.
          </p>
          <p className="text-xs text-navy-500 italic">
            Stripe handles the form — PAL never sees your bank info or SSN.
          </p>
        </section>

        {status.payoutsEnabled ? (
          <section className="bg-emerald-50 rounded-2xl border-2 border-emerald-300 p-6">
            <p className="font-display text-xl font-bold text-emerald-800 mb-2">
              ✓ Payouts enabled
            </p>
            <p className="text-sm text-emerald-900 leading-relaxed mb-4">
              You&apos;re all set. Future beach bookings you claim will
              auto-transfer your share to your bank account on the schedule
              Stripe defaults to (typically 1-2 business days).
            </p>
            <p className="text-xs text-emerald-800">
              If you ever need to update bank info, contact Winston and
              he&apos;ll send you a fresh dashboard link.
            </p>
          </section>
        ) : (
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            {onboarded === "1" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-900">
                Stripe processed your submission but payouts aren&apos;t enabled
                yet. This usually means there&apos;s one more step (extra
                verification, ID upload, etc.) — click below to continue.
              </div>
            )}
            {error === "1" && (
              <div className="bg-coral-50 border border-coral-300 rounded-lg p-3 mb-4 text-sm text-coral-900">
                Something went wrong with the link. Try again — the button
                below will issue a fresh one.
              </div>
            )}
            <p className="text-sm text-navy-700 mb-4 leading-relaxed">
              {status.stripeAccountId
                ? "Pick up where you left off in the Stripe form:"
                : "Click below to start. You'll be redirected to Stripe's secure form."}
            </p>
            <ConnectStartButton
              slug={slug}
              alreadyStarted={!!status.stripeAccountId}
            />
            <p className="text-[11px] text-navy-500 mt-4 text-center">
              Questions? Text Port A Local at <a href="sms:+13614281706" className="text-coral-600">(361) 428-1706</a>
              {" "}or email <a href="mailto:hello@theportalocal.com" className="text-coral-600">hello@theportalocal.com</a>.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
