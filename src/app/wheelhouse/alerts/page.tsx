import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getActiveAlert, getAlertHistory } from "@/data/alerts-store";
import AlertsAdminClient from "./AlertsAdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wheelhouse — Site banner",
  robots: { index: false, follow: false },
};

/**
 * `/wheelhouse/alerts` — admin trigger for the site-wide emergency
 * banner. Cookie-gated to wheelhouse users (matches /wheelhouse/payouts
 * pattern). Phase 1: manual create + dismiss; single-active invariant.
 *
 * Phase 2 (future): subscribe to CivicPlus + NWS feeds + auto-create
 * alerts; dedicated /emergency/[slug] pages with running updates;
 * SMS/email/push subscriber delivery.
 */
export default async function AlertsAdminPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) {
    redirect("/wheelhouse/login?next=/wheelhouse/alerts");
  }

  const [active, history] = await Promise.all([
    getActiveAlert(),
    getAlertHistory(20),
  ]);

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50">
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30">
        <Link
          href="/wheelhouse"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 hover:text-coral-200"
        >
          <LighthouseMark size={14} variant="light" detail="icon" />
          <span>The Wheelhouse · Site banner</span>
        </Link>
        <p className="font-display text-2xl font-bold mt-1">
          Site-wide banner
        </p>
        <p className="text-sm text-sand-300 font-light mt-1 max-w-xl">
          Pins a persistent strip to the top of every PAL page until
          dismissed or expired. Dual-use:
        </p>
        <ul className="text-sm text-sand-300 font-light mt-2 max-w-xl list-disc pl-5 space-y-1">
          <li>
            <span className="text-sand-100 font-semibold">Emergency</span>{" "}
            (warning / critical) — hurricanes, evacuations, road
            closures, water advisories, ferry shutdowns.
          </li>
          <li>
            <span className="text-sand-100 font-semibold">Community</span>{" "}
            (info) — fireworks, school graduations, ferry route
            changes, parade routes — anything visitors and locals
            should see at the top of the page.
          </li>
        </ul>
        <p className="text-[11px] text-sand-500 font-light mt-3 max-w-xl">
          For multi-update emergencies that need a running timeline
          (hurricane updates over days), use{" "}
          <Link
            href="/wheelhouse/emergency"
            className="underline decoration-coral-500/40 hover:decoration-coral-400 hover:text-coral-200"
          >
            Emergency events
          </Link>{" "}
          instead — same banner shows, but with a dedicated /emergency
          page and push to subscribers.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AlertsAdminClient
          initialActive={active}
          initialHistory={history}
          actor={who}
        />
      </div>
    </main>
  );
}
