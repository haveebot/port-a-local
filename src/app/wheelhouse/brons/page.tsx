import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Bron's operator dashboard — read-only mock.
 *
 * Live snapshot of what Bron + crew would see in their Wheelhouse
 * after closing the deal. Mock data designed to look real for the
 * walk-in demo. Replace with live data wiring after sign-off.
 *
 * Wheelhouse-gated. Demo audience: Winston (in-person walk-in),
 * eventually Bron + Kristen as wheelhouse users post-deal.
 */
export default async function BronsDashboardPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  // Mock data — live wiring lands post-deal
  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">
            Bron's Operations
          </p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Demo banner */}
        <div className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-amber-800 text-xs">
          <strong>Demo surface:</strong> mock data for walk-in preview.
          Live data wires up after Bron's Stripe Connect onboarding +
          deal sign-off. Replace each metric below with its real query.
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          {todayLabel}
        </h1>

        {/* Top stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Today's bookings" value="14" sub="+3 vs avg" tone="emerald" />
          <Stat label="Today's revenue" value="$2,184" sub="net to Bron's: $1,922" tone="navy" />
          <Stat label="This week's payout" value="$11,427" sub="Stripe → bank Mon AM" tone="navy" />
          <Stat label="Calendar load" value="73%" sub="14 of 19 carts out" tone="navy" />
        </section>

        {/* Today's bookings */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Today's bookings</h2>
            <span className="text-[11px] uppercase tracking-widest text-navy-500">
              14 active
            </span>
          </div>
          <div className="divide-y divide-sand-200">
            {SAMPLE_BOOKINGS.map((b) => (
              <div key={b.id} className="py-3 flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-[11px] text-navy-500">
                  {b.time}
                </span>
                <span className="font-bold text-navy-900">{b.customer}</span>
                <span className="text-xs text-navy-600">{b.product}</span>
                <span className="text-xs text-navy-500">{b.location}</span>
                <span className="ml-auto font-mono text-sm text-navy-800">
                  ${b.total}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    b.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-800"
                      : b.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-sand-200 text-navy-700"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Two-column row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stripe payout panel */}
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-4">
              Stripe payouts
            </h2>
            <div className="space-y-2">
              {SAMPLE_PAYOUTS.map((p) => (
                <div key={p.date} className="flex items-baseline justify-between border-b border-sand-200 pb-2">
                  <div>
                    <p className="text-sm font-bold text-navy-900">{p.date}</p>
                    <p className="text-[11px] text-navy-500">
                      {p.bookings} booking{p.bookings !== 1 ? "s" : ""} · gross ${p.gross}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-emerald-700">
                    +${p.net}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-navy-500 mt-4 italic">
              Auto-transfer to bank account ending in 4421 every weekday morning.
            </p>
          </section>

          {/* Inventory snapshot */}
          <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold mb-4">
              Fleet snapshot
            </h2>
            <div className="space-y-3">
              <InventoryRow label="6-pass golf carts" total={12} out={9} />
              <InventoryRow label="4-pass golf carts" total={7} out={5} />
              <InventoryRow label="Cabana setups" total={8} out={4} />
              <InventoryRow label="Chair & umbrella sets" total={20} out={14} />
              <InventoryRow label="Coolers" total={15} out={6} />
              <InventoryRow label="Beach shade tents" total={10} out={3} />
            </div>
          </section>
        </div>

        {/* What's coming next */}
        <section className="bg-navy-900 text-sand-100 rounded-2xl p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-coral-300 font-bold mb-2">
            Coming next
          </p>
          <h2 className="font-display text-2xl font-bold mb-4">
            What we're rolling out for you over the next 60 days
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Auto-reminder text to customer the day before pickup</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Customer-portal logins (rebook in one tap, view past rentals)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Brand-pack generator (logos, brand sheets, PDF menus on demand)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Auto-post weekly highlights to Bron's FB + IG</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Damage report + photo upload from the crew's phone</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Email blast to past customers when peak weekends near</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>One-click cross-promo with PAL events / live music nights at Backyard</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Direct integration with PAL's lead-flow (already partially live)</span>
            </li>
          </ul>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/wheelhouse/brons/agreement"
            className="bg-coral-500 text-white rounded-xl p-4 font-bold text-sm uppercase tracking-widest hover:bg-coral-600 text-center"
          >
            New rental agreement
          </Link>
          <Link
            href="/wheelhouse/cart-vendors-sms"
            className="bg-white border border-sand-300 rounded-xl p-4 font-bold text-sm hover:border-navy-400 text-navy-800 text-center"
          >
            View first-look queue →
          </Link>
          <Link
            href="https://bronsbeach.com"
            target="_blank"
            rel="noopener"
            className="bg-white border border-sand-300 rounded-xl p-4 font-bold text-sm hover:border-navy-400 text-navy-800 text-center"
          >
            View bronsbeach.com →
          </Link>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "navy",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "navy" | "emerald";
}) {
  const valueClass =
    tone === "emerald" ? "text-emerald-700" : "text-navy-900";
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-4">
      <p className={`font-display text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-navy-500 mt-1">
        {label}
      </p>
      {sub && (
        <p className="text-[10px] text-navy-400 mt-1">{sub}</p>
      )}
    </div>
  );
}

function InventoryRow({
  label,
  total,
  out,
}: {
  label: string;
  total: number;
  out: number;
}) {
  const pct = Math.round((out / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="text-navy-800">{label}</span>
        <span className="font-mono text-navy-600 text-xs">
          {out} / {total} out
        </span>
      </div>
      <div className="h-1.5 bg-sand-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-coral-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const SAMPLE_BOOKINGS = [
  { id: 1, time: "8:30am", customer: "Mendoza family", product: "6-pass cart · 3 days", location: "Cinnamon Shore", total: "486", status: "confirmed" },
  { id: 2, time: "9:00am", customer: "K. Williams", product: "Cabana setup", location: "Access Rd 1A", total: "175", status: "confirmed" },
  { id: 3, time: "9:15am", customer: "Reyes party (8)", product: "Cabana + 6-pass cart", location: "Marker 5", total: "357", status: "confirmed" },
  { id: 4, time: "9:30am", customer: "T. Patterson", product: "Chair & umbrella", location: "Access Rd 1A", total: "45", status: "confirmed" },
  { id: 5, time: "10:00am", customer: "Garcia bachelorette (10)", product: "2× cabanas + cooler", location: "Marker 7", total: "375", status: "pending" },
  { id: 6, time: "10:30am", customer: "B. Holloway", product: "4-pass cart · 1 day", location: "self-pickup", total: "156", status: "confirmed" },
  { id: 7, time: "11:00am", customer: "Sandcastle group (Smith)", product: "Beach tent + cooler", location: "Marker 3", total: "90", status: "confirmed" },
  { id: 8, time: "1:00pm", customer: "Davis bachelor (6)", product: "6-pass cart · 2 days", location: "self-pickup", total: "364", status: "completed" },
];

const SAMPLE_PAYOUTS = [
  { date: "Tomorrow (Mon)", bookings: 14, gross: "2,184", net: "1,922" },
  { date: "Last Fri", bookings: 19, gross: "2,816", net: "2,478" },
  { date: "Last Thu", bookings: 11, gross: "1,640", net: "1,443" },
  { date: "Last Wed", bookings: 8, gross: "1,224", net: "1,077" },
];
