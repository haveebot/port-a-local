import { notFound } from "next/navigation";
import { getLocalsOffer } from "@/data/locals-store";
import { verifyLocalsToken } from "@/lib/locals-hmac";
import { CATEGORIES } from "@/data/locals-types";
import VendorConnectClient from "./VendorConnectClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendor — payouts setup — PAL Locals",
  robots: { index: false, follow: false },
};

const PAL_FEE_PCT = 0.1;

export default async function VendorPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{ s?: string; from?: string }>;
}) {
  const { offerId } = await params;
  const sp = await searchParams;
  const sig = sp.s ?? "";

  if (!verifyLocalsToken("vendor-connect", offerId, sig)) {
    notFound();
  }

  const offer = await getLocalsOffer(offerId);
  if (!offer || offer.mode !== "sell" || !offer.approvedAt) {
    notFound();
  }

  const cat = CATEGORIES.find((c) => c.id === offer.category);
  const priceDollars =
    offer.priceCents != null ? (offer.priceCents / 100).toFixed(2) : null;
  const palFeeDollars =
    offer.priceCents != null
      ? ((offer.priceCents * PAL_FEE_PCT) / 100).toFixed(2)
      : null;
  const customerTotalDollars =
    offer.priceCents != null
      ? ((offer.priceCents * (1 + PAL_FEE_PCT)) / 100).toFixed(2)
      : null;

  const justReturnedFromStripe = sp.from === "stripe-done";
  const displayName = offer.businessName || offer.name;

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30">
        <p className="text-[10px] tracking-widest uppercase text-coral-300">
          PAL Locals · Vendor
        </p>
        <p className="font-display text-lg font-bold mt-1">
          {displayName}
        </p>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-8 max-w-md mx-auto w-full space-y-6">
        <section className="bg-navy-800 border border-navy-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-sand-400 mb-2">
            Your listing
          </p>
          <p className="font-display text-base font-bold mb-1">
            {cat?.label ?? offer.category}
            {priceDollars ? ` · $${priceDollars}` : ""}
          </p>
          <p className="text-sm text-sand-300 font-light whitespace-pre-wrap">
            {offer.description}
          </p>
          {offer.fulfillmentNote && (
            <p className="text-xs text-sand-400 font-light mt-3">
              <span className="text-sand-500">Fulfillment:</span>{" "}
              {offer.fulfillmentNote}
            </p>
          )}
        </section>

        <VendorConnectClient
          offerId={offer.id}
          sig={sig}
          initialStripeAccountId={offer.stripeAccountId}
          initialPayoutsEnabled={offer.stripePayoutsEnabled}
          justReturnedFromStripe={justReturnedFromStripe}
        />

        {priceDollars && palFeeDollars && customerTotalDollars && (
          <section className="bg-navy-800/60 border border-navy-700 rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-sand-400 mb-3">
              What happens when you sell
            </p>
            <div className="space-y-2 text-sm font-light">
              <div className="flex justify-between text-sand-300">
                <span>Your price</span>
                <span className="text-sand-100 font-mono">
                  ${priceDollars}
                </span>
              </div>
              <div className="flex justify-between text-sand-300">
                <span>+ PAL platform fee (10%)</span>
                <span className="text-sand-100 font-mono">
                  ${palFeeDollars}
                </span>
              </div>
              <div className="flex justify-between text-sand-300 border-t border-navy-700 pt-2">
                <span>Customer pays</span>
                <span className="text-sand-50 font-mono font-bold">
                  ${customerTotalDollars}
                </span>
              </div>
              <div className="flex justify-between text-emerald-300 pt-2">
                <span className="font-bold">You keep</span>
                <span className="text-emerald-200 font-mono font-bold">
                  ${priceDollars}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-sand-400 font-light mt-4 leading-relaxed">
              Stripe handles the transfer automatically once payouts are
              live. PAL never deducts from your quote — the fee is on
              top of your price, paid by the customer.
            </p>
          </section>
        )}
      </div>

      <footer className="px-4 sm:px-6 py-4 text-center text-[11px] text-sand-500 font-light">
        Powered by Stripe Connect Express. PAL never sees your bank
        info — Stripe holds it. We trigger the transfer when a customer
        buys.
      </footer>
    </main>
  );
}
