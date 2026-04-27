import { notFound } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import LighthouseMark from "@/components/brand/LighthouseMark";
import {
  getHousekeepingBooking,
  markHousekeepingPaid,
  formatUSD,
} from "@/data/housekeeping-store";
import { sendHousekeepingAdminEmail } from "@/lib/housekeepingEmails";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking confirmed — PAL Housekeeping",
};

function getStripe(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

/**
 * Server-side Stripe verify on success-page load. If the booking is
 * still 'placed' and we have a session_id, retrieve the session, mark
 * paid, fire admin email. Idempotent — early return if already paid.
 */
async function verifyAndConfirmIfNeeded(
  bookingId: string,
  sessionId: string | undefined,
): Promise<void> {
  if (!sessionId) return;
  const booking = await getHousekeepingBooking(bookingId);
  if (!booking) return;
  if (booking.status !== "placed") return;
  const stripe = getStripe();
  if (!stripe) return;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const updated = await markHousekeepingPaid(
        bookingId,
        (session.payment_intent as string) ?? "",
      );
      if (updated) {
        await sendHousekeepingAdminEmail(updated);
      }
    }
  } catch (err) {
    console.error("[housekeeping success] Stripe verify failed:", err);
  }
}

export default async function HousekeepingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { bookingId } = await params;
  const sp = await searchParams;
  await verifyAndConfirmIfNeeded(bookingId, sp.session_id);

  const booking = await getHousekeepingBooking(bookingId);
  if (!booking) notFound();

  return (
    <main className="min-h-screen bg-sand-50">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={14} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Housekeeping
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Thanks!</h1>
          <p className="text-sand-300 font-light text-sm mt-1">
            Booking ID <span className="font-mono">{booking.id}</span>
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-2">
            Status
          </p>
          <p className="font-display text-xl font-bold text-navy-900">
            {booking.status === "paid"
              ? "Paid · awaiting dispatch"
              : booking.status === "dispatched"
                ? "Dispatched · cleaner assigned"
                : booking.status === "in_progress"
                  ? "In progress"
                  : booking.status === "completed"
                    ? "Cleaning complete ✓"
                    : "Booking received"}
          </p>
          <p className="text-xs text-navy-500 font-light mt-1">
            We&apos;ll text or email to confirm exact timing within a
            day. Reply to your receipt with anything we should know.
          </p>
        </div>

        <div className="bg-white border border-sand-200 rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
            Your booking
          </p>
          <ul className="text-sm text-navy-700 space-y-1.5">
            <Row label="Address" value={booking.propertyAddress} />
            <Row label="Square footage" value={`${booking.propertySqft} sqft`} />
            <Row
              label="Estimated hours"
              value={`${booking.estimatedHours} hr`}
            />
            {booking.preferredDate && (
              <Row label="Preferred date" value={booking.preferredDate} />
            )}
            {booking.preferredTime && (
              <Row label="Time window" value={booking.preferredTime} />
            )}
            <hr className="border-sand-200 my-2" />
            <Row
              label="Total paid"
              value={formatUSD(booking.totalCents)}
              bold
            />
          </ul>
        </div>

        <p className="text-xs text-navy-500 font-light text-center">
          Booked with{" "}
          <strong className="text-navy-700">Local Girls Cleaning</strong>,
          a PAL service. Issue with your booking? Email{" "}
          <a
            href="mailto:hello@theportalocal.com"
            className="underline decoration-sand-400 hover:text-coral-600"
          >
            hello@theportalocal.com
          </a>
          . We&apos;ll make it right.
        </p>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-coral-600 underline decoration-coral-300"
          >
            ← Back to Port A Local
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
