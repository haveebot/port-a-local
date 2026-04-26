import { getDriverByToken } from "@/data/delivery-drivers";
import { getDriverStatus } from "@/data/delivery-store";
import OnlineToggle from "./OnlineToggle";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Driver — go online — PAL Delivery",
  robots: { index: false, follow: false },
};

export default async function DriverOnlinePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const driver = t ? await getDriverByToken(t) : null;
  if (!driver) {
    return (
      <main className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-display text-xl font-bold text-navy-900 mb-2">
            Invalid driver link
          </p>
          <p className="text-sm text-navy-500 font-light">
            This link doesn&apos;t match an active driver token.{" "}
            <a
              href="/deliver/driver/lookup"
              className="underline decoration-sand-400 hover:text-coral-600"
            >
              Look up your driver links →
            </a>
          </p>
        </div>
      </main>
    );
  }

  const status = await getDriverStatus(driver.id);

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30">
        <p className="text-[10px] tracking-widest uppercase text-coral-300">
          PAL Delivery · Driver
        </p>
        <p className="font-display text-lg font-bold mt-1">{driver.name}</p>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-sm w-full text-center">
          <OnlineToggle
            driverToken={driver.token}
            initialStatus={status}
          />
        </div>
      </div>

      <footer className="px-4 sm:px-6 py-4 text-center text-[11px] text-sand-500 font-light">
        Toggling online lets PAL dispatch new orders to your phone + email.
        Goes off automatically after 4 hours if you forget.
      </footer>
    </main>
  );
}
