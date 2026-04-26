import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getActiveDriversDb,
  getDriverStatus,
  listCustomPayouts,
} from "@/data/delivery-store";
import CustomPayoutForm from "./CustomPayoutForm";

export const dynamic = "force-dynamic";

interface PayoutEligibleDriver {
  id: string;
  name: string;
  payoutsEnabled: boolean;
  hasStripeAccount: boolean;
}

/**
 * Wheelhouse-only admin page for sending one-off Stripe Connect transfers
 * to runners (bonuses, profit-share, mid-month settlements, etc).
 *
 * Auth: same cookie gate as the rest of /wheelhouse — wheelhouse_who must
 * be set or we redirect to /wheelhouse/login.
 */
export default async function WheelhousePayoutsPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) redirect("/wheelhouse/login");

  const drivers = await getActiveDriversDb();
  const driverStatuses: PayoutEligibleDriver[] = await Promise.all(
    drivers.map(async (d) => {
      const s = await getDriverStatus(d.id);
      return {
        id: d.id,
        name: d.name,
        payoutsEnabled: s.payoutsEnabled,
        hasStripeAccount: !!s.stripeAccountId,
      };
    }),
  );

  const recent = await listCustomPayouts(20);
  const driverNameById = new Map(drivers.map((d) => [d.id, d.name]));

  function fmt(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  return (
    <main className="min-h-screen bg-sand-50 text-navy-900">
      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/wheelhouse"
            className="text-xs text-navy-300 hover:text-coral-300"
          >
            ← Wheelhouse
          </Link>
          <p className="font-display font-bold text-sand-50">Custom Payouts</p>
          <span className="text-[11px] text-coral-300 hidden sm:inline">
            Signed in as {who}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold mb-2">
            Send a one-off Stripe transfer
          </h1>
          <p className="text-sm text-navy-600 mb-6 leading-relaxed">
            Sends money from PAL&apos;s Stripe balance directly to a
            runner&apos;s Connect account. Use for bonuses, tips,
            profit-share, mid-month settlements, gas reimbursement — anything
            outside the normal order-tied auto-payouts.
          </p>
          <CustomPayoutForm
            drivers={driverStatuses.filter((d) => d.payoutsEnabled)}
            allActive={driverStatuses}
          />
        </section>

        <section className="bg-white rounded-2xl border border-sand-300 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold mb-4">
            Recent custom payouts
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-navy-500">
              None yet. Custom payouts you send will appear here, separate
              from the regular order-tied auto-payouts.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[11px] uppercase tracking-widest text-navy-500 border-b border-sand-300">
                  <tr>
                    <th className="py-2 pr-3 font-bold">When</th>
                    <th className="py-2 pr-3 font-bold">Runner</th>
                    <th className="py-2 pr-3 font-bold text-right">Amount</th>
                    <th className="py-2 font-bold">Stripe transfer</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.customId} className="border-b border-sand-100">
                      <td className="py-2.5 pr-3 font-mono text-xs text-navy-600 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 pr-3">
                        {driverNameById.get(p.driverId) ?? p.driverId}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono">
                        {fmt(p.amountCents)}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-navy-500">
                        {p.transferId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-[11px] text-navy-400 text-center pt-2">
          Custom payouts are recorded in <code>delivery_driver_transfers</code>{" "}
          with a <code>custom-</code> prefix. Same idempotency machinery as
          order-tied transfers.
        </p>
      </div>
    </main>
  );
}
