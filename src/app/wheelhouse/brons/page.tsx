import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Bron's Digital Operations — read-only dashboard mock.
 *
 * Phase 1 scope: digital revenue only. Two streams (carts + beach).
 * In-person ops (Cojilio walk-ups, Clover bar POS, phone bookings) are
 * out of scope — HeyeLab does NOT see those flows.
 *
 * HeyeLab is the principal in this relationship. PAL is the affiliate
 * surface that lists Bron's rentals on its local guide. The dashboard
 * itself lives in PAL's wheelhouse for now (Winston operates from
 * here); future refactor may move to a HeyeLab-tier admin portal.
 *
 * Mock data designed to look real for the walk-in. Replaces with live
 * queries after Stripe Connect onboarding + deal sign-off.
 */
export default async function BronsDashboardPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

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
            Bron's Digital Operations
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
          Live data wires up after Stripe Connect onboarding + deal
          sign-off. Replaces each metric below with its real query.
        </div>

        {/* Phase context */}
        <div className="rounded-xl bg-white border border-sand-300 px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-coral-700 font-bold mb-1">
              Phase 1 — Digital revenue only
            </p>
            <p className="text-sm text-navy-800">
              <strong>{todayLabel}</strong> · 2 active streams: cart rentals + beach rentals
            </p>
            <p className="text-[11px] text-navy-500 mt-1">
              In-person walk-ups, phone bookings, and bar / F&B sales aren&apos;t
              tracked here — those run on your existing systems, untouched.
            </p>
          </div>
        </div>

        {/* Top stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Today's online bookings" value="9" sub="+3 vs avg" tone="emerald" />
          <Stat label="Today's online revenue" value="$1,452" sub="net to you: $1,278" tone="navy" />
          <Stat label="This week's payout" value="$8,294" sub="Stripe → bank Mon AM" tone="navy" />
          <Stat label="Online conversion" value="11.2%" sub="visitors → bookings" tone="navy" />
        </section>

        {/* Two streams */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream 1: Cart rentals */}
          <div className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-xl font-bold">🛺 Cart rentals</h2>
              <span className="text-[10px] uppercase tracking-widest text-navy-500">
                online stream
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <SubStat label="Bookings today" value="6" />
              <SubStat label="Revenue today" value="$978" />
              <SubStat label="Avg ticket" value="$163" />
              <SubStat label="Multi-day rate" value="68%" />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-navy-500 font-semibold mb-2">
              Today's cart bookings
            </p>
            <div className="divide-y divide-sand-200 text-xs">
              {SAMPLE_CART_BOOKINGS.map((b) => (
                <div key={b.id} className="py-2 flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-navy-500">{b.time}</span>
                  <span className="font-bold text-navy-900">{b.customer}</span>
                  <span className="text-navy-600">{b.product}</span>
                  <span className="ml-auto font-mono font-bold">${b.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stream 2: Beach rentals */}
          <div className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-xl font-bold">🏖 Beach rentals</h2>
              <span className="text-[10px] uppercase tracking-widest text-navy-500">
                online stream
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <SubStat label="Bookings today" value="3" />
              <SubStat label="Revenue today" value="$474" />
              <SubStat label="Avg ticket" value="$158" />
              <SubStat label="Multi-day rate" value="42%" />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-navy-500 font-semibold mb-2">
              Today's beach bookings
            </p>
            <div className="divide-y divide-sand-200 text-xs">
              {SAMPLE_BEACH_BOOKINGS.map((b) => (
                <div key={b.id} className="py-2 flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-navy-500">{b.time}</span>
                  <span className="font-bold text-navy-900">{b.customer}</span>
                  <span className="text-navy-600">{b.product}</span>
                  <span className="ml-auto font-mono font-bold">${b.total}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stripe payouts panel */}
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Stripe payouts</h2>
            <span className="text-[10px] uppercase tracking-widest text-navy-500">
              digital revenue · 88% to your account
            </span>
          </div>
          <div className="space-y-2">
            {SAMPLE_PAYOUTS.map((p) => (
              <div key={p.date} className="flex items-baseline justify-between border-b border-sand-200 pb-2">
                <div>
                  <p className="text-sm font-bold text-navy-900">{p.date}</p>
                  <p className="text-[11px] text-navy-500">
                    {p.bookings} online booking{p.bookings !== 1 ? "s" : ""} · gross ${p.gross}
                  </p>
                </div>
                <p className="font-mono font-bold text-emerald-700">
                  +${p.net}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-navy-500 mt-4 italic">
            Auto-transfer to your bank account every weekday morning. No invoices,
            no waiting — your 88% lands daily.
          </p>
        </section>

        {/* Phase 2 tease */}
        <section className="bg-navy-900 text-sand-100 rounded-2xl p-6 sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-coral-300 font-bold mb-2">
            Phase 1 → Phase 2
          </p>
          <h2 className="font-display text-2xl font-bold mb-3">
            What we add to your digital ops over the next 60 days
          </h2>
          <p className="text-sm text-sand-200/85 mb-5 leading-relaxed">
            Phase 1 scope is digital-only. Everything below extends what you
            see on this dashboard — no in-person changes.
          </p>
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
              <span>Auto-post weekly highlights to your FB + IG</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Email blast to past customers when peak weekends near</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Customer e-sign for digital rental agreements</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Lead-flow integration with PAL local-guide rentals</span>
            </li>
            <li className="flex gap-3">
              <span className="text-coral-300">→</span>
              <span>Off-season promo automation (low-utilization weeks fill themselves)</span>
            </li>
          </ul>
          <p className="text-xs text-sand-200/70 mt-6 italic border-t border-sand-200/20 pt-4">
            <strong>Phase 2 conversation</strong> — when digital is performing,
            we talk about extending into your in-person flow. Different
            scope, different conversation. We&apos;ll have real numbers to
            inform that one.
          </p>
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

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sand-50 rounded-lg px-3 py-2">
      <p className="font-display text-lg font-bold text-navy-900">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-navy-500">
        {label}
      </p>
    </div>
  );
}

const SAMPLE_CART_BOOKINGS = [
  { id: 1, time: "8:30am", customer: "Mendoza family", product: "6-pass · 3 days", total: "486" },
  { id: 2, time: "10:30am", customer: "B. Holloway", product: "4-pass · 1 day", total: "156" },
  { id: 3, time: "11:15am", customer: "Reyes party", product: "6-pass · 2 days", total: "364" },
  { id: 4, time: "1:00pm", customer: "Davis bachelor (6)", product: "6-pass · 2 days", total: "364" },
  { id: 5, time: "2:30pm", customer: "Garcia bachelorette", product: "6-pass · 1 day", total: "182" },
  { id: 6, time: "3:45pm", customer: "K. Williams", product: "4-pass · 1 day", total: "156" },
];

const SAMPLE_BEACH_BOOKINGS = [
  { id: 1, time: "9:00am", customer: "K. Williams", product: "Cabana setup", total: "175" },
  { id: 2, time: "9:30am", customer: "T. Patterson", product: "Chair & umbrella", total: "45" },
  { id: 3, time: "10:00am", customer: "Sandcastle group", product: "Beach tent + cooler", total: "90" },
];

const SAMPLE_PAYOUTS = [
  { date: "Tomorrow (Mon)", bookings: 9, gross: "1,452", net: "1,278" },
  { date: "Last Fri", bookings: 14, gross: "2,238", net: "1,969" },
  { date: "Last Thu", bookings: 8, gross: "1,156", net: "1,017" },
  { date: "Last Wed", bookings: 6, gross: "892", net: "785" },
];
