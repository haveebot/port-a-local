import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import EnablePushButton from "@/components/push/EnablePushButton";
import {
  getEventList,
  type EmergencyEvent,
  type EventSeverity,
  type EventStatus,
} from "@/data/emergency-store";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Emergency — Port A Local",
  description:
    "Port Aransas emergency information hub. Active hurricanes, evacuation orders, road closures, water advisories — and the running updates as they unfold. PAL is the single page residents and visitors check first.",
};

/**
 * `/emergency` — index of emergency events.
 *
 * Active + watching events at the top; resolved events archived
 * underneath. Each event links to its dedicated page with running
 * updates. Cold-state shows a calm "no active events" card with
 * subscribe-for-future hooks.
 *
 * The site-wide pal_alerts banner (top of every page) handles the
 * "we have an active emergency right now" UX. This index handles
 * the "where's the consolidated detail" UX.
 */
export default async function EmergencyIndexPage() {
  const events = await getEventList(50);
  const active = events.filter((e) => e.status === "active");
  const watching = events.filter((e) => e.status === "watching");
  const resolved = events.filter((e) => e.status === "resolved");

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Emergency
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight">
            Emergency information hub.
          </h1>
          <p className="text-lg text-navy-200 mt-5 font-light max-w-2xl leading-relaxed">
            Active hurricanes, evacuation orders, road closures, water
            advisories — and the running updates as they unfold. PAL
            consolidates the city, the National Weather Service, the
            ferry, and TxDOT into one page so you don&apos;t bounce
            between five tabs during a storm.
          </p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-12">
          {/* Subscribe — instant push when something hits PAL.
              Persistent regardless of cold/warm state because the
              moment to subscribe is BEFORE the next storm AND
              between fireworks shows, not during one. */}
          <div className="bg-navy-900 border border-coral-500/30 rounded-2xl p-6 text-sand-50">
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="text-3xl shrink-0">📍</div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg font-bold mb-1">
                  Get the call before everyone else.
                </p>
                <p className="text-sm text-navy-300 font-light leading-relaxed">
                  Fireworks tonight, parade routes, school graduations,
                  ferry route changes — and when it counts, hurricane
                  warnings and evacuation orders too. Pushed straight
                  to your phone. No account, no spam, off in one tap.
                  Install PAL via <em>Add to Home Screen</em> on
                  iPhone for the most reliable delivery.
                </p>
                <div className="mt-4 max-w-xs">
                  <EnablePushButton
                    subscriberKind="customer-topic"
                    subscriberId="emergencies"
                    enableLabel="Enable PAL alerts"
                    onLabel="Alerts on"
                    dark
                  />
                </div>
              </div>
            </div>
          </div>

          {active.length === 0 && watching.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
              <p className="font-display text-xl font-bold text-emerald-900 mb-2">
                Nothing active right now.
              </p>
              <p className="text-sm text-emerald-800 font-light leading-relaxed max-w-md mx-auto">
                The island is operating normally. We update this page
                live during weather events, evacuation windows, and
                road closures.
              </p>
              <p className="text-xs text-emerald-700 font-light mt-4 max-w-md mx-auto">
                Authoritative sources outside an active event:{" "}
                <a
                  href="https://www.weather.gov/crp/"
                  className="underline decoration-emerald-400 hover:text-emerald-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  NWS Corpus Christi
                </a>
                {" · "}
                <a
                  href="https://drivetexas.org/"
                  className="underline decoration-emerald-400 hover:text-emerald-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  TxDOT DriveTexas
                </a>
                {" · "}
                <a
                  href="https://portal.civicplus.com/TX-PortAransas/notifications"
                  className="underline decoration-emerald-400 hover:text-emerald-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  City of Port A alerts
                </a>
                .
              </p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-4">
                    Active now
                  </p>
                  <div className="space-y-3">
                    {active.map((e) => (
                      <EventCard key={e.id} e={e} />
                    ))}
                  </div>
                </div>
              )}
              {watching.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-navy-600 mb-4">
                    Watching
                  </p>
                  <div className="space-y-3">
                    {watching.map((e) => (
                      <EventCard key={e.id} e={e} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {resolved.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-navy-500 mb-4">
                Recent — resolved
              </p>
              <div className="space-y-3">
                {resolved.slice(0, 12).map((e) => (
                  <EventCard key={e.id} e={e} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function EventCard({
  e,
  compact = false,
}: {
  e: EmergencyEvent;
  compact?: boolean;
}) {
  const statusChip = statusStyle(e.status, e.severity);
  const dateStr = new Date(e.startedAt ?? e.createdAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  return (
    <Link
      href={`/emergency/${e.slug}`}
      className={
        compact
          ? "block bg-white border border-sand-200 rounded-lg p-4 hover:border-navy-400 transition-colors"
          : "block bg-white border-2 border-coral-300 rounded-xl p-5 hover:border-coral-500 transition-colors"
      }
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${statusChip}`}
        >
          {labelFor(e.status, e.severity)}
        </span>
        <p className="text-xs text-navy-500 font-mono shrink-0">
          {dateStr}
        </p>
      </div>
      <p
        className={
          compact
            ? "font-display text-base font-bold text-navy-900 leading-tight"
            : "font-display text-lg font-bold text-navy-900 leading-tight mb-2"
        }
      >
        {e.title}
      </p>
      {!compact && (
        <p className="text-sm text-navy-600 font-light leading-relaxed">
          {e.summary}
        </p>
      )}
      <p className="text-xs text-coral-600 mt-3">Read updates →</p>
    </Link>
  );
}

function statusStyle(status: EventStatus, severity: EventSeverity): string {
  if (status === "resolved") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (status === "watching") {
    return "bg-navy-50 text-navy-800 border-navy-200";
  }
  // active
  if (severity === "critical") {
    return "bg-red-50 text-red-800 border-red-300";
  }
  if (severity === "warning") {
    return "bg-coral-50 text-coral-800 border-coral-300";
  }
  return "bg-navy-50 text-navy-800 border-navy-200";
}

function labelFor(status: EventStatus, severity: EventSeverity): string {
  if (status === "resolved") return "Resolved";
  if (status === "watching") return "Watching";
  if (severity === "critical") return "Critical · Active";
  if (severity === "warning") return "Active";
  return "Notice · Active";
}
