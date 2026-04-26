import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentRunner } from "@/lib/runnerSession";
import { getDriverStatus } from "@/data/delivery-store";
import RunnerHub from "./RunnerHub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Runner home — PAL Delivery",
  robots: { index: false, follow: false },
};

export default async function RunnerHomePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;

  // If they arrived with a token in the URL, do the token→cookie
  // exchange via the login route, then come back clean.
  if (sp.t) {
    redirect(`/api/deliver/driver/login?t=${encodeURIComponent(sp.t)}&next=/deliver/driver`);
  }

  const driver = await getCurrentRunner();
  if (!driver) {
    // No session — send them to the lookup recovery flow
    redirect("/deliver/driver/lookup?from=no-session");
  }

  const status = await getDriverStatus(driver.id);

  return (
    <RunnerHub
      driverId={driver.id}
      driverName={driver.name}
      initialStatus={{
        isOnline: status.isOnline,
        onlineUntil: status.onlineUntil,
        payoutsEnabled: status.payoutsEnabled,
        hasStripeAccount: !!status.stripeAccountId,
      }}
    />
  );
}
