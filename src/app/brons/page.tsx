import { getBronsOwedCents, getBronsJobs, type BronsJob } from "@/data/brons-dashboard";
import { getBeachProductLabel } from "@/data/beach-products";

export const dynamic = "force-dynamic";

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const STATUS_STYLE: Record<BronsJob["status"], string> = {
  upcoming: "bg-amber-500/20 text-amber-200",
  fulfilled: "bg-sky-500/20 text-sky-200",
  paid: "bg-emerald-500/20 text-emerald-200",
};

export default async function BronsDashboardPage() {
  const [owedCents, jobs] = await Promise.all([getBronsOwedCents(), getBronsJobs()]);

  return (
    <main className="min-h-screen bg-sky-950 text-sky-50">
      <header className="border-b border-sky-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏖️</span>
          <div>
            <h1 className="font-bold leading-tight">Bron&apos;s Beach</h1>
            <p className="text-sky-400 text-xs">Team Dashboard</p>
          </div>
        </div>
        <form action="/api/brons/logout" method="post">
          <button type="submit" className="text-sky-300 text-sm hover:text-sky-100">
            Sign out
          </button>
        </form>
      </header>

      <section className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        {/* Owed counter — the one number, no history, no percentages */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 mb-8">
          <p className="text-emerald-100 text-sm">Current balance owed to you</p>
          <p className="text-4xl sm:text-5xl font-bold mt-1">{usd(owedCents)}</p>
          <p className="text-emerald-200/80 text-xs mt-2">
            Updates as new setups are completed. Payouts are settled directly.
          </p>
        </div>

        {/* Forward jobs */}
        <h2 className="font-semibold mb-3">Your upcoming &amp; recent setups</h2>
        {jobs.length === 0 ? (
          <p className="text-sky-400 text-sm">No setups yet. New bookings will appear here.</p>
        ) : (
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.bookingId} className="rounded-xl bg-sky-900/50 border border-sky-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{fmtDate(j.setupDate)}</p>
                    <p className="text-sky-300 text-sm">
                      {getBeachProductLabel(j.product ?? "")}
                      {j.qty && j.qty > 1 ? ` × ${j.qty}` : ""}
                      {j.numDays && j.numDays > 1 ? ` · ${j.numDays} days` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{usd(j.payoutCents)}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[j.status]}`}>
                      {j.status}
                    </span>
                  </div>
                </div>

                {/* Customer contact — gated until 24h before setup */}
                <div className="mt-3 pt-3 border-t border-sky-800 text-sm">
                  {j.contactUnlocked ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sky-200">
                      <span>{j.customerName ?? "—"}</span>
                      <span>{j.customerPhone ?? "—"}</span>
                      <span>{j.setupLocation ?? "—"}</span>
                    </div>
                  ) : (
                    <p className="text-sky-500 italic">
                      Customer details unlock 24 hours before setup
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
