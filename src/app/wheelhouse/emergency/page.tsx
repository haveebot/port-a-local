import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getEventList } from "@/data/emergency-store";
import EmergencyAdminClient from "./EmergencyAdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wheelhouse — Emergency events",
  robots: { index: false, follow: false },
};

/**
 * `/wheelhouse/emergency` — admin for /emergency event pages.
 * Cookie-gated like the rest of the wheelhouse. Pairs with
 * /wheelhouse/alerts (the site-wide banner trigger) — this page
 * manages the LONGER-LIVED dedicated event pages with running updates.
 *
 * Recommended workflow:
 *   1. Create event here when situation begins
 *   2. Post updates as the situation evolves
 *   3. Trigger the site-wide banner via /wheelhouse/alerts with
 *      linkUrl = /emergency/[event-slug]
 *   4. Flip event status to 'resolved' when over; banner gets
 *      dismissed separately
 */
export default async function EmergencyAdminPage() {
  const cookieStore = await cookies();
  const who = cookieStore.get("wheelhouse_who")?.value;
  if (!who) {
    redirect("/wheelhouse/login?next=/wheelhouse/emergency");
  }
  const events = await getEventList(50);

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50">
      <header className="px-4 sm:px-6 py-4 border-b border-coral-500/30">
        <Link
          href="/wheelhouse"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 hover:text-coral-200"
        >
          <LighthouseMark size={14} variant="light" detail="icon" />
          <span>The Wheelhouse · Emergency events</span>
        </Link>
        <p className="font-display text-2xl font-bold mt-1">
          Emergency event pages
        </p>
        <p className="text-sm text-sand-300 font-light mt-1 max-w-xl">
          Dedicated multi-day situation pages at /emergency/[slug] with
          running updates. Pairs with the site-wide banner at
          /wheelhouse/alerts — banner is the top-of-page state, this
          page is the consolidated detail with timeline.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <EmergencyAdminClient initialEvents={events} actor={who} />
      </div>
    </main>
  );
}
