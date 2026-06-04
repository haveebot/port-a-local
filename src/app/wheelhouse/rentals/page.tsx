import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listRentals, fmtRentalDate, type UnifiedRental } from "@/data/rentals-calendar";
import { cartVendors } from "@/data/cart-vendors";
import RentalRow from "./RentalRow";

export const dynamic = "force-dynamic";

export default async function RentalsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const rentals = await listRentals();
  const cartVendorOptions = cartVendors
    .filter((v) => v.active)
    .map((v) => ({ slug: v.slug, name: v.name }));

  // Group by start date (calendar order — list already sorted ascending).
  const groups: { date: string; items: UnifiedRental[] }[] = [];
  for (const r of rentals) {
    const key = r.startDate ?? "Undated";
    const last = groups[groups.length - 1];
    if (last && last.date === key) last.items.push(r);
    else groups.push({ date: key, items: [r] });
  }

  const total = rentals.length;
  const assigned = rentals.filter((r) => r.status === "assigned").length;
  const beach = rentals.filter((r) => r.source === "beach").length;
  const cart = rentals.filter((r) => r.source === "cart").length;
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (local)

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
              All beach + cart bookings · vendor + status · send updates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: "Total", value: total },
            { label: "Assigned", value: assigned },
            { label: "🏖️ Beach", value: beach },
            { label: "🛺 Cart", value: cart },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-sand-200 p-3 text-center">
              <p className="text-xl font-bold text-navy-900">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-navy-400">{s.label}</p>
            </div>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-navy-500 text-center py-10">No rentals yet.</p>
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
