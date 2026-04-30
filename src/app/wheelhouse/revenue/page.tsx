import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const getStripe = () =>
  new Stripe((process.env.STRIPE_SECRET_KEY ?? "").trim(), {
    apiVersion: "2026-03-25.dahlia",
  });

interface Bucket {
  gross: number;
  count: number;
}

interface VerticalBucket extends Bucket {
  label: string;
}

interface ReportData {
  today: Bucket;
  last7: Bucket;
  last30: Bucket;
  byVertical: VerticalBucket[];
  totalChargesScanned: number;
  errored: boolean;
  errorMsg?: string;
}

const VERTICAL_LABELS: Record<string, string> = {
  beach: "🏖️ Beach setup",
  cart: "🛺 Cart rental",
  delivery: "🚐 Delivery",
  housekeeping: "🧹 Housekeeping",
  maintenance: "🔧 Maintenance",
  locals: "🛒 Locals purchase",
  unknown: "Untagged",
};

function ctMidnightUnix(daysAgo: number): number {
  // CT (America/Chicago) midnight, X days ago. We approximate via UTC offset
  // -5 (CDT) since most of PAL's operating window is CDT. For precision-
  // sensitive reporting, swap to a tz library; for headline stats this is fine.
  const now = new Date();
  const ctMidnightToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0),
  );
  return Math.floor(ctMidnightToday.getTime() / 1000) - daysAgo * 24 * 60 * 60;
}

function inferVertical(charge: Stripe.Charge): string {
  // Prefer explicit metadata.type from the underlying Checkout Session
  // (set by our /api/checkout/* endpoints). Fall back to product
  // description sniffing for charges where metadata didn't propagate.
  const meta = charge.metadata?.type;
  if (meta && VERTICAL_LABELS[meta]) return meta;
  const desc = (charge.description ?? "").toLowerCase();
  if (desc.includes("beach")) return "beach";
  if (desc.includes("cart") || desc.includes("golf")) return "cart";
  if (desc.includes("delivery") || desc.includes("deliver")) return "delivery";
  if (desc.includes("housekeep") || desc.includes("clean")) return "housekeeping";
  if (desc.includes("maintenance") || desc.includes("dispatch")) return "maintenance";
  if (desc.includes("locals")) return "locals";
  return "unknown";
}

async function buildReport(): Promise<ReportData> {
  const stripeKey = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!stripeKey) {
    return {
      today: { gross: 0, count: 0 },
      last7: { gross: 0, count: 0 },
      last30: { gross: 0, count: 0 },
      byVertical: [],
      totalChargesScanned: 0,
      errored: true,
      errorMsg: "STRIPE_SECRET_KEY not set",
    };
  }
  const stripe = getStripe();
  const thirtyDaysAgo = ctMidnightUnix(29);
  const todayStart = ctMidnightUnix(0);
  const sevenDaysAgo = ctMidnightUnix(6);

  const buckets = {
    today: { gross: 0, count: 0 } as Bucket,
    last7: { gross: 0, count: 0 } as Bucket,
    last30: { gross: 0, count: 0 } as Bucket,
  };
  const byVertical: Record<string, Bucket> = {};
  let totalScanned = 0;

  try {
    // Pagination — small business volume should be one page max, but
    // loop defensively up to 5 pages (500 charges = ~16/day for 30 days).
    let starting_after: string | undefined = undefined;
    for (let i = 0; i < 5; i++) {
      const list: Stripe.Response<Stripe.ApiList<Stripe.Charge>> =
        await stripe.charges.list({
          created: { gte: thirtyDaysAgo },
          limit: 100,
          ...(starting_after ? { starting_after } : {}),
        });
      for (const ch of list.data) {
        if (!ch.paid || ch.refunded) continue;
        // Successful, non-refunded charge
        const amount = ch.amount;
        const created = ch.created;
        if (created >= thirtyDaysAgo) {
          buckets.last30.gross += amount;
          buckets.last30.count += 1;
        }
        if (created >= sevenDaysAgo) {
          buckets.last7.gross += amount;
          buckets.last7.count += 1;
        }
        if (created >= todayStart) {
          buckets.today.gross += amount;
          buckets.today.count += 1;
        }
        const v = inferVertical(ch);
        if (!byVertical[v]) byVertical[v] = { gross: 0, count: 0 };
        byVertical[v].gross += amount;
        byVertical[v].count += 1;
      }
      totalScanned += list.data.length;
      if (!list.has_more) break;
      starting_after = list.data[list.data.length - 1]?.id;
      if (!starting_after) break;
    }
  } catch (err) {
    return {
      today: buckets.today,
      last7: buckets.last7,
      last30: buckets.last30,
      byVertical: [],
      totalChargesScanned: totalScanned,
      errored: true,
      errorMsg: err instanceof Error ? err.message : String(err),
    };
  }

  const verticalRows: VerticalBucket[] = Object.entries(byVertical)
    .map(([k, v]) => ({ label: VERTICAL_LABELS[k] ?? k, ...v }))
    .sort((a, b) => b.gross - a.gross);

  return {
    today: buckets.today,
    last7: buckets.last7,
    last30: buckets.last30,
    byVertical: verticalRows,
    totalChargesScanned: totalScanned,
    errored: false,
  };
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function RevenuePage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const r = await buildReport();

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/wheelhouse" className="text-xs text-navy-300 hover:text-coral-300">
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">Revenue</p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="font-display text-2xl font-bold">Revenue snapshot</h1>
            <p className="text-[11px] text-navy-400 font-mono">
              Source: Stripe Charges · {r.totalChargesScanned} scanned · CT day windows
            </p>
          </div>
          {r.errored && (
            <div className="bg-coral-50 border border-coral-300 rounded-lg p-3 mb-4 text-sm text-coral-900">
              Couldn&apos;t fetch from Stripe: {r.errorMsg}
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <BigStat label="Today" gross={r.today.gross} count={r.today.count} tone="emerald" />
            <BigStat label="Last 7 days" gross={r.last7.gross} count={r.last7.count} />
            <BigStat label="Last 30 days" gross={r.last30.gross} count={r.last30.count} />
          </div>
        </section>

        {r.byVertical.length > 0 && (
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-4">By vertical (last 30 days)</h2>
            <div className="space-y-2">
              {r.byVertical.map((v) => (
                <div key={v.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-navy-700">{v.label}</span>
                  <span className="text-navy-500 text-xs">{v.count} charge{v.count === 1 ? "" : "s"}</span>
                  <span className="font-semibold text-navy-900 font-mono">{fmtUsd(v.gross)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="text-[11px] text-navy-400 text-center">
          Gross collected across all paid Stripe charges. Refunded charges
          excluded. Vertical inferred from <code>metadata.type</code> on the
          checkout session (or sniffed from description as fallback).
        </p>
      </div>
    </main>
  );
}

function BigStat({
  label,
  gross,
  count,
  tone = "navy",
}: {
  label: string;
  gross: number;
  count: number;
  tone?: "navy" | "emerald";
}) {
  const valueClass = tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-sand-100 rounded-lg p-4">
      <p className={`font-display text-3xl font-bold ${valueClass}`}>{fmtUsd(gross)}</p>
      <p className="text-[11px] uppercase tracking-widest text-navy-500 mt-1">{label}</p>
      <p className="text-[10px] text-navy-500 mt-1">
        {count} charge{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}
