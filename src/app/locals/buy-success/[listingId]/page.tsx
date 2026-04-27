import { notFound } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getListingById } from "@/data/locals-listings";
import {
  createOrGetLocalsPurchase,
  markLocalsPurchaseEmailsSent,
  type LocalsPurchaseRecord,
} from "@/data/locals-store";
import {
  sendVendorSaleEmail,
  sendCustomerSaleEmail,
  sendAdminSaleEmail,
} from "@/lib/localsBuyEmails";
import { mirrorLocalsInquiryToWheelhouse } from "@/lib/localsDispatch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order placed — PAL Locals",
};

function getStripe(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

interface VerifiedDetails {
  paid: boolean;
  totalCents: number;
  vendorAmountCents?: number;
  palFeeCents?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerMessage?: string;
  paymentIntentId?: string;
}

/**
 * Server-side Stripe verification on success-page load. Read the
 * Checkout session, return the totals + customer info to render
 * the receipt-style confirmation. Email cascade + DB upsert happen
 * separately so this stays a pure read.
 */
async function verifySession(
  sessionId: string | undefined,
): Promise<VerifiedDetails | null> {
  if (!sessionId) return null;
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    return {
      paid: true,
      totalCents: session.amount_total ?? 0,
      vendorAmountCents: session.metadata?.vendor_amount_cents
        ? Number(session.metadata.vendor_amount_cents)
        : undefined,
      palFeeCents: session.metadata?.pal_fee_cents
        ? Number(session.metadata.pal_fee_cents)
        : undefined,
      customerName: session.metadata?.customer_name ?? undefined,
      customerEmail: session.customer_email ?? undefined,
      customerPhone: session.metadata?.customer_phone ?? undefined,
      customerMessage: session.metadata?.customer_message ?? undefined,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? undefined),
    };
  } catch (err) {
    console.error("[locals buy success] Stripe verify failed:", err);
    return null;
  }
}

/**
 * Idempotent email cascade — runs once per Stripe session.
 *
 * Flow:
 *   1. Upsert purchase row keyed by Stripe session ID (race-safe).
 *   2. `markLocalsPurchaseEmailsSent` returns `true` only on the
 *      first successful claim — subsequent refreshes return `false`
 *      and skip sends.
 *   3. Fire all three emails (vendor / customer / admin) + Wheelhouse
 *      mirror in parallel. Failures log but don't block the page.
 */
async function fireSaleCascadeIfNeeded(
  listingId: string,
  verified: VerifiedDetails,
  sessionId: string,
): Promise<LocalsPurchaseRecord | null> {
  const listing = getListingById(listingId);
  if (!listing) return null;
  if (
    !verified.customerName ||
    !verified.customerEmail ||
    !verified.customerPhone ||
    verified.vendorAmountCents == null ||
    verified.palFeeCents == null
  ) {
    // Missing metadata — bail rather than write a half-row. Stripe
    // session has the source of truth; if metadata is missing, we
    // can re-run from a backfill script.
    console.warn(
      "[locals buy success] missing metadata, skipping cascade",
      sessionId,
    );
    return null;
  }

  let purchase: LocalsPurchaseRecord;
  try {
    purchase = await createOrGetLocalsPurchase({
      stripeSessionId: sessionId,
      listingId: listing.id,
      customerName: verified.customerName,
      customerEmail: verified.customerEmail,
      customerPhone: verified.customerPhone,
      customerMessage: verified.customerMessage,
      vendorAmountCents: verified.vendorAmountCents,
      palFeeCents: verified.palFeeCents,
      totalCents: verified.totalCents,
      stripePaymentIntentId: verified.paymentIntentId,
    });
  } catch (err) {
    console.error("[locals buy success] purchase upsert failed:", err);
    return null;
  }

  const claimed = await markLocalsPurchaseEmailsSent(sessionId);
  if (!claimed) return purchase; // already fired, just render

  // Run sends in parallel — each handler swallows its own errors.
  await Promise.all([
    sendVendorSaleEmail(listing, purchase),
    sendCustomerSaleEmail(listing, purchase),
    sendAdminSaleEmail(listing, purchase),
    mirrorLocalsInquiryToWheelhouse({
      kind: "offer", // closest existing kind; emits a "fyi" thread message
      name: `${purchase.customerName} → ${listing.provider}`,
      phone: purchase.customerPhone,
      email: purchase.customerEmail,
      category: listing.category,
      mode: "sell",
      listingId: listing.id,
      pricing: `$${(purchase.totalCents / 100).toFixed(2)} (vendor: $${(purchase.vendorAmountCents / 100).toFixed(2)} + PAL fee: $${(purchase.palFeeCents / 100).toFixed(2)})`,
      details: `**Sale closed** — ${listing.title}\n${purchase.customerMessage ? `\nCustomer message:\n${purchase.customerMessage}` : ""}`,
    }),
  ]);

  return purchase;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function BuySuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { listingId } = await params;
  const sp = await searchParams;
  const listing = getListingById(listingId);
  if (!listing) notFound();

  const verified = await verifySession(sp.session_id);
  const isPaid = verified?.paid === true;

  // Fire the email cascade exactly once per Stripe session. This
  // notifies the vendor (they made a sale!), confirms with the
  // customer, alerts admin, and mirrors to Wheelhouse. Refreshes
  // are no-ops thanks to the emails_sent_at gate.
  if (isPaid && sp.session_id) {
    await fireSaleCascadeIfNeeded(listingId, verified!, sp.session_id);
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/locals"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={14} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Locals
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold">
            {isPaid ? "Order placed ✓" : "Almost there"}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
            Status
          </p>
          <p className="font-display text-xl font-bold text-navy-900">
            {isPaid
              ? `Paid — ${listing.provider} will reach out`
              : "Processing payment…"}
          </p>
          <p className="text-xs text-navy-500 font-light mt-1">
            {isPaid
              ? `${listing.provider} got the order notification and will be in touch with you directly to coordinate ${listing.fulfillmentNote ? "fulfillment" : "shipping or pickup"}. PAL is just the booking layer.`
              : "If your card was charged but you don't see this confirmed, refresh the page or email hello@theportalocal.com."}
          </p>
        </div>

        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            Your order
          </p>
          <ul className="text-sm text-navy-700 space-y-1.5">
            <Row label="Item" value={listing.title} />
            <Row label="Vendor" value={listing.provider} />
            {listing.fulfillmentNote && (
              <Row
                label="How you'll get it"
                value={listing.fulfillmentNote}
              />
            )}
            {verified?.vendorAmountCents !== undefined && (
              <>
                <hr className="border-sand-200 my-2" />
                <Row
                  label="Vendor's price"
                  value={fmt(verified.vendorAmountCents)}
                />
                {verified.palFeeCents !== undefined && (
                  <Row
                    label="PAL platform fee"
                    value={fmt(verified.palFeeCents)}
                  />
                )}
                <Row
                  label="Total charged"
                  value={fmt(verified.totalCents)}
                  bold
                />
              </>
            )}
          </ul>
        </div>

        <p className="text-xs text-navy-500 font-light text-center">
          Reach the vendor directly through their listing — or hit{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-sand-400 hover:text-coral-600"
          >
            hello@theportalocal.com
          </a>{" "}
          if anything goes sideways.
        </p>

        <div className="text-center">
          <Link
            href="/locals"
            className="text-sm text-coral-600 underline decoration-coral-300"
          >
            ← Back to Locals
          </Link>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <li
      className={`flex justify-between gap-3 ${
        bold ? "font-bold text-navy-900" : "text-navy-600"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums text-right">{value}</span>
    </li>
  );
}
