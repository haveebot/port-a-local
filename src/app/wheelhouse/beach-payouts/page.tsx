import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import { beachVendors, beachVendorPhone } from "@/data/beach-vendors";
import {
  getBeachVendorStatus,
  type BeachVendorStatus,
} from "@/data/beach-vendor-status";
import VendorRow from "./VendorRow";
import ClaimRow from "./ClaimRow";

export const dynamic = "force-dynamic";

interface ClaimRow {
  stripe_session_id: string;
  claimed_by_slug: string | null;
  claimed_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  product: string | null;
  qty: number | null;
  setup_date: string | null;
  num_days: number | null;
  vendor_amount_cents: number | null;
  paid_out_at: string | null;
  transfer_id: string | null;
}

export default async function BeachPayoutsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  // Vendor statuses (onboarded / payouts enabled)
  const vendorStatuses: Array<{
    slug: string;
    name: string;
    role?: string;
    phone: string;
    status: BeachVendorStatus;
  }> = await Promise.all(
    beachVendors.map(async (v) => ({
      slug: v.slug,
      name: v.name,
      role: v.role,
      phone: beachVendorPhone(v),
      status: await getBeachVendorStatus(v.slug),
    })),
  );

  // Recent claims (last 20)
  let claims: ClaimRow[] = [];
  try {
    const result = await sql<ClaimRow>`
      SELECT stripe_session_id, claimed_by_slug, claimed_at, customer_name,
             customer_phone, product, qty, setup_date, num_days,
             vendor_amount_cents, paid_out_at, transfer_id
      FROM beach_booking_claims
      ORDER BY blasted_at DESC
      LIMIT 20
    `;
    claims = result.rows;
  } catch {
    claims = [];
  }

  const onboardedCount = vendorStatuses.filter((v) => v.status.payoutsEnabled).length;
  const claimedNotPaid = claims.filter(
    (c) => c.claimed_at && !c.paid_out_at,
  ).length;
  const paidCount = claims.filter((c) => c.paid_out_at).length;

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/wheelhouse" className="text-xs text-navy-300 hover:text-coral-300">
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">Beach Payouts</p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">Beach vendor payouts</h1>
          <p className="text-sm text-navy-600 leading-relaxed mb-4">
            Beach bookings auto-pay vendors at the 72-hour-before-setup mark
            (cancellation window closes → vendor portion releases). Hourly
            cron handles eligible payouts automatically. This page is for
            onboarding management + manual payout overrides.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Onboarded" value={`${onboardedCount}/${vendorStatuses.length}`} tone="emerald" />
            <Stat label="Awaiting payout" value={claimedNotPaid} tone="navy" />
            <Stat label="Paid out (recent)" value={paidCount} tone="navy" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-4">Vendor onboarding</h2>
          <div className="divide-y divide-sand-200">
            {vendorStatuses.map((v) => (
              <VendorRow key={v.slug} vendor={v} />
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-4">Recent claims</h2>
          {claims.length === 0 ? (
            <p className="text-sm text-navy-500">
              No claims yet. New beach bookings appear here as vendors claim them.
            </p>
          ) : (
            <div className="divide-y divide-sand-200">
              {claims.map((c) => (
                <ClaimRow key={c.stripe_session_id} claim={c} />
              ))}
            </div>
          )}
        </section>

        <p className="text-[11px] text-navy-400 text-center">
          Auto-payout cron at <code>/api/cron/beach-payouts</code> · runs hourly · fires
          when claim is past 72hr-before-setup AND vendor has Stripe Connect
          payouts enabled. Manual triggers via the buttons above bypass the timing
          gate but still respect Stripe-side onboarding state.
        </p>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  tone?: "navy" | "emerald";
}) {
  const valueClass = tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-3">
      <p className={`font-display text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-navy-500 mt-1">
        {label}
      </p>
    </div>
  );
}
