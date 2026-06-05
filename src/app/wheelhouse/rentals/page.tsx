import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listRentals, fmtRentalDate, type UnifiedRental } from "@/data/rentals-calendar";
import { cartVendors } from "@/data/cart-vendors";
import RentalRow from "./RentalRow";

export const dynamic = "force-dynamic";

type View = "upcoming" | "archived" | "all";

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const sp = await searchParams;
  const view: View =
    sp.view === "archived" ? "archived" : sp.view === "all" ? "all" : "upcoming";

  const rentals = await listRentals();
  const cartVendorOptions = cartVendors
    .filter((v) => v.active)
    .map((v) => ({ slug: v.slug, name: v.name }));

  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (local)
  // A rental auto-archives once its last active day is in the past — for beach
  // that's the setup date, for carts the return date. No manual step needed.
  const effectiveEnd = (r: UnifiedRental) => r.endDate ?? r.startDate ?? "9999-99-99";
  const isArchived = (r: UnifiedRental) => effectiveEnd(r) < todayStr;

  const upcomingCount = rentals.filter((r) => !isArchived(r)).length;
  const archivedCount = rentals.filter((r) => isArchived(r)).length;

  const filtered =
    view === "archived"
      ? rentals.filter(isArchived)
      : view === "all"
        ? rentals
        : rentals.filter((r) => !isArchived(r));
  // Past rentals read most-recent-first; upcoming stay soonest-first.
  const shown = view === "archived" ? [...filtered].reverse() : filtered;

  // Group by start date (list already in calendar order).
  const groups: { date: string; items: UnifiedRental[] }[] = [];
  for (const r of shown) {
    const key = r.startDate ?? "Undated";
    const last = groups[groups.length - 1];
    if (last && last.date === key) last.items.push(r);
    else groups.push({ date: key, items: [r] });
  }

  const viewTile =
    view === "archived"
      ? { label: "Archived", value: archivedCount }
      : view === "all"
        ? { label: "All", value: rentals.length }
        : { label: "Upcoming", value: upcomingCount };
  const tiles = [
    viewTile,
    { label: "Assigned", value: shown.filter((r) => r.status === "assigned").length },
    { label: "🏖️ Beach", value: shown.filter((r) => r.source === "beach").length },
    { label: "🛺 Cart", value: shown.filter((r) => r.source === "cart").length },
  ];

  const tabs: { key: View; label: string }[] = [
    { key: "upcoming", label: `Upcoming (${upcomingCount})` },
    { key: "archived", label: `Archived (${archivedCount})` },
    { key: "all", label: "All" },
  ];

  const emptyMsg =
    view === "archived"
      ? "No past rentals."
      : view === "all"
        ? "No rentals yet."
        : "No upcoming rentals.";

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/wheelhouse" className="text-xs text-navy-400 hover:text-coral-600">
              ← Wheelhouse
            </Link>
            <h1 className="font-display text-2xl font-bold text-navy-900 mt-1">
              Rentals
            </h1>
            <p className="text-xs text-navy-500">
              Beach + cart bookings · vendor + status · send updates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {tiles.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-sand-200 p-3 text-center">
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-navy-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 mb-5">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/wheelhouse/rentals?view=${t.key}`}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                view === t.key
                  ? "bg-coral-500 text-white border-coral-500"
                  : "bg-white text-navy-600 border-sand-200 hover:border-coral-300"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-navy-500 text-center py-10">{emptyMsg}</p>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => {
              const isPast = g.date !== "Undated" && g.date < todayStr;
              return (
                <section key={g.date}>
                  <h2
                    className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${
                      isPast ? "text-navy-300" : "text-coral-600"
                    }`}
                  >
                    {g.date === "Undated" ? "Undated" : fmtRentalDate(g.date)}
                    {g.date === todayStr && " · Today"}
                  </h2>
                  <div className="bg-white rounded-2xl border border-sand-200 px-4 py-2 divide-y divide-sand-100">
                    {g.items.map((r) => (
                      <RentalRow
                        key={`${r.source}-${r.sessionId}`}
                        rental={r}
                        cartVendorOptions={cartVendorOptions}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
