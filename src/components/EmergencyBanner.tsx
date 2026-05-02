import Link from "next/link";
import { getActiveAlert, type AlertSeverity } from "@/data/alerts-store";

/**
 * Site-wide emergency banner. Renders nothing when there's no active
 * alert (the dormant baseline state) — zero visual cost. Renders a
 * persistent top-of-page strip when an alert is active.
 *
 * Severity → color:
 *   spotlight — emerald-to-coral gradient (positive happenings, no urgency)
 *   info      — navy (general announcements)
 *   warning   — coral (advisories, road closures, watches)
 *   critical  — red (evacuations, life-safety)
 *
 * Used in src/app/layout.tsx so it shows on every PAL page.
 *
 * Phase 1 = manually triggered from /wheelhouse/alerts.
 * Phase 2 (later) = auto-feed from CivicPlus / NWS / TxDOT / Texas
 * Beach Watch + dedicated /emergency/[slug] pages.
 */
export default async function EmergencyBanner() {
  const alert = await getActiveAlert();
  if (!alert) return null;

  const styles = severityStyles(alert.severity);

  // Spotlight is celebratory, not emergency — use polite role + softer aria-live
  const isSpotlight = alert.severity === "spotlight";

  return (
    <aside
      role={isSpotlight ? "status" : "alert"}
      aria-live={isSpotlight ? "polite" : "assertive"}
      className={`fixed top-0 left-0 right-0 z-[55] w-full ${styles.bg} ${styles.text} border-b ${styles.border}`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {isSpotlight ? (
            <span
              className="shrink-0 mt-0.5 text-base"
              aria-hidden
            >
              ✨
            </span>
          ) : (
            <span
              className={`shrink-0 mt-0.5 inline-block w-2.5 h-2.5 rounded-full ${styles.dot} animate-pulse`}
              aria-hidden
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">
              {labelFor(alert.severity)}
            </p>
            <p className="text-sm sm:text-base font-medium leading-snug whitespace-pre-wrap">
              {alert.message}
            </p>
          </div>
        </div>
        {alert.linkUrl && (
          <Link
            href={alert.linkUrl}
            className={`${styles.cta} px-4 py-2 rounded-lg text-sm font-bold shrink-0 self-start sm:self-center transition-colors`}
          >
            {alert.linkLabel ?? "More info →"}
          </Link>
        )}
      </div>
    </aside>
  );
}

function severityStyles(severity: AlertSeverity): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  cta: string;
} {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-700",
        text: "text-white",
        border: "border-red-900",
        dot: "bg-red-200",
        cta: "bg-white text-red-900 hover:bg-red-50",
      };
    case "warning":
      return {
        bg: "bg-coral-500",
        text: "text-white",
        border: "border-coral-700",
        dot: "bg-coral-100",
        cta: "bg-white text-coral-700 hover:bg-coral-50",
      };
    case "spotlight":
      // Vibrant, warm — emerald-to-coral gradient feels celebratory
      // without being chaotic. Reads "look at this cool thing" not
      // "emergency." White text holds against the warmer coral side.
      return {
        bg: "bg-gradient-to-r from-emerald-500 via-teal-500 to-coral-500",
        text: "text-white",
        border: "border-emerald-700/40",
        dot: "bg-white",
        cta: "bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm",
      };
    case "info":
    default:
      return {
        bg: "bg-navy-900",
        text: "text-sand-100",
        border: "border-coral-500/30",
        dot: "bg-coral-300",
        cta: "bg-coral-500 text-white hover:bg-coral-600",
      };
  }
}

function labelFor(severity: AlertSeverity): string {
  switch (severity) {
    case "critical":
      return "Critical alert · Port Aransas";
    case "warning":
      return "Advisory · Port Aransas";
    case "spotlight":
      return "Right now · Port Aransas";
    case "info":
    default:
      return "Notice · Port Aransas";
  }
}
