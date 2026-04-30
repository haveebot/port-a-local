import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import {
  getEventBySlug,
  getUpdatesForEvent,
  type EventSeverity,
  type EventStatus,
  type UpdateKind,
} from "@/data/emergency-store";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Not found" };
  return {
    title: `${event.title} — Port A Local Emergency`,
    description: event.summary.slice(0, 160),
  };
}

/**
 * `/emergency/[slug]` — single emergency event with running updates.
 *
 * Renders the consolidated situation: status pill, summary, timeline
 * of updates (newest-first), source links per update. Auto-refreshes
 * via revalidate=30 so reloads pick up new updates without a redeploy.
 *
 * Page architecture supports any event kind — hurricanes, evacuation
 * windows, road closures, water advisories, fires. The kind field
 * drives icon + chip styling but the structure is uniform.
 */
export default async function EmergencyEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const updates = await getUpdatesForEvent(event.id);
  const isActive = event.status === "active" || event.status === "watching";
  const startedStr = event.startedAt
    ? new Date(event.startedAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const resolvedStr = event.resolvedAt
    ? new Date(event.resolvedAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="min-h-screen">
      <Navigation />

      <section
        className={
          event.severity === "critical" && isActive
            ? "pt-28 pb-12 bg-red-700 text-white relative"
            : event.severity === "warning" && isActive
              ? "pt-28 pb-12 bg-coral-600 text-white relative"
              : "pt-28 pb-12 hero-gradient relative"
        }
      >
        {!isActive && (
          <>
            <div className="absolute bottom-0 left-0 right-0 coral-line" />
            <div className="absolute inset-0 palm-pattern opacity-15" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/emergency"
            className={
              isActive
                ? "inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/80 mb-3 hover:text-white transition-colors"
                : "inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
            }
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span>Port A Local · Emergency</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${chipFor(event.status, event.severity, isActive)}`}
            >
              {labelFor(event.status, event.severity)}
            </span>
            <span
              className={
                isActive
                  ? "text-[10px] tracking-widest uppercase text-white/80"
                  : "text-[10px] tracking-widest uppercase text-coral-300"
              }
            >
              {kindLabel(event.kind)}
            </span>
          </div>

          <h1
            className={
              isActive
                ? "font-display text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight text-white"
                : "font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight"
            }
          >
            {event.title}
          </h1>
          <p
            className={
              isActive
                ? "text-lg mt-5 font-light max-w-2xl leading-relaxed text-white/95"
                : "text-lg text-navy-200 mt-5 font-light max-w-2xl leading-relaxed"
            }
          >
            {event.summary}
          </p>

          {(startedStr || resolvedStr) && (
            <div
              className={
                isActive
                  ? "flex flex-wrap gap-x-4 gap-y-1 mt-5 text-[11px] font-mono text-white/80"
                  : "flex flex-wrap gap-x-4 gap-y-1 mt-5 text-[11px] font-mono text-navy-300"
              }
            >
              {startedStr && <span>Started: {startedStr}</span>}
              {resolvedStr && <span>Resolved: {resolvedStr}</span>}
            </div>
          )}
        </div>
      </section>

      <article className="py-12 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
              Updates ({updates.length})
            </p>
            {isActive && (
              <p className="text-[11px] text-navy-500 font-light">
                Auto-refreshes · pull-to-refresh on mobile
              </p>
            )}
          </div>

          {updates.length === 0 ? (
            <div className="bg-white border border-sand-200 rounded-xl p-8 text-center">
              <p className="text-sm text-navy-600 font-light">
                No updates yet. Check back as the situation develops.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/emergency"
              className="text-sm text-coral-600 underline decoration-coral-300 hover:decoration-coral-500"
            >
              ← All emergency events
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

function UpdateCard({
  update,
}: {
  update: Awaited<ReturnType<typeof getUpdatesForEvent>>[number];
}) {
  const ts = new Date(update.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const styles = updateKindStyle(update.kind);
  return (
    <div
      className={`bg-white border-l-4 ${styles.borderL} border-y border-r border-sand-200 rounded-r-xl rounded-l-sm p-5`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${styles.chip}`}
        >
          {update.kind.replace("-", " ")}
        </span>
        <p className="text-xs text-navy-500 font-mono shrink-0">{ts}</p>
      </div>
      {update.title && (
        <p className="font-display font-bold text-base text-navy-900 leading-tight mb-2">
          {update.title}
        </p>
      )}
      <p className="text-sm text-navy-700 font-light leading-relaxed whitespace-pre-wrap">
        {update.body}
      </p>
      {update.sourceUrl && (
        <p className="mt-3 text-[11px] text-navy-500">
          Source:{" "}
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-coral-600 underline decoration-coral-300"
          >
            {update.sourceLabel ?? update.sourceUrl}
          </a>
        </p>
      )}
    </div>
  );
}

function chipFor(
  status: EventStatus,
  severity: EventSeverity,
  isActive: boolean,
): string {
  if (status === "resolved") {
    return "bg-emerald-100 text-emerald-800 border border-emerald-300";
  }
  if (!isActive) {
    return "bg-navy-100 text-navy-800 border border-navy-300";
  }
  // active hero — light chip on dark hero
  if (severity === "critical") {
    return "bg-white text-red-800 border border-white/40";
  }
  if (severity === "warning") {
    return "bg-white text-coral-700 border border-white/40";
  }
  return "bg-white text-navy-800 border border-white/40";
}

function labelFor(status: EventStatus, severity: EventSeverity): string {
  if (status === "resolved") return "Resolved";
  if (status === "watching") return "Watching";
  if (severity === "critical") return "Critical · Active";
  if (severity === "warning") return "Active";
  return "Notice · Active";
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "weather":
      return "Weather event";
    case "evacuation":
      return "Evacuation";
    case "road-closure":
      return "Road closure";
    case "water-advisory":
      return "Water advisory";
    case "fire":
      return "Fire";
    case "general":
    default:
      return "General";
  }
}

function updateKindStyle(kind: UpdateKind): {
  borderL: string;
  chip: string;
} {
  switch (kind) {
    case "warning":
      return {
        borderL: "border-l-coral-500",
        chip: "bg-coral-50 text-coral-800 border-coral-300",
      };
    case "decision":
      return {
        borderL: "border-l-navy-700",
        chip: "bg-navy-50 text-navy-800 border-navy-300",
      };
    case "all-clear":
      return {
        borderL: "border-l-emerald-500",
        chip: "bg-emerald-50 text-emerald-800 border-emerald-300",
      };
    case "conditions":
      return {
        borderL: "border-l-sand-400",
        chip: "bg-sand-50 text-navy-700 border-sand-300",
      };
    case "info":
    default:
      return {
        borderL: "border-l-navy-400",
        chip: "bg-navy-50 text-navy-700 border-navy-200",
      };
  }
}
