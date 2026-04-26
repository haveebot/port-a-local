import { redirect } from "next/navigation";
import { getCurrentRunner } from "@/lib/runnerSession";
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
  if (sp.t) {
    redirect(
      `/api/deliver/driver/login?t=${encodeURIComponent(sp.t)}&next=/deliver/driver/payouts${sp.from ? `?from=${sp.from}` : ""}`,
    );
  }
  const driver = await getCurrentRunner();
  if (!driver) {
    redirect("/deliver/driver/lookup?from=no-session");
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
