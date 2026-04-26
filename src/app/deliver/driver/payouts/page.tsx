import { getDriverByToken } from "@/data/delivery-drivers";
import { getDriverStatus } from "@/data/delivery-store";
import PayoutsClient from "./PayoutsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Driver — payouts setup — PAL Delivery",
  robots: { index: false, follow: false },
};

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.t;
  const driver = token ? await getDriverByToken(token) : null;
  if (!driver) {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-display text-xl font-bold text-navy-900 mb-2">
            Invalid driver link
          </p>
          <p className="text-sm text-navy-500 font-light">
            This link doesn&apos;t match an active driver token. Ping Winston
            for a fresh link.
          </p>
        </div>
      </main>
    );
  }

  const status = await getDriverStatus(driver.id);
  const justReturnedFromStripe = sp.from === "stripe";

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30">
        <p className="text-[10px] tracking-widest uppercase text-coral-300">
          PAL Delivery · Driver
        </p>
        <p className="font-display text-lg font-bold mt-1">
          Auto-payouts setup — {driver.name}
        </p>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-8 max-w-md mx-auto w-full">
        <PayoutsClient
          driverToken={driver.token}
          initialStatus={status}
          justReturnedFromStripe={justReturnedFromStripe}
        />
      </div>

      <footer className="px-4 sm:px-6 py-4 text-center text-[11px] text-sand-500 font-light">
        Powered by Stripe Connect Express. PAL never sees your bank info —
        Stripe holds it. We just trigger the transfer when you complete a
        delivery.
      </footer>
    </main>
  );
}
