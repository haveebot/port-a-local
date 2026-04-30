import { getEventBySlug } from "@/data/events";
import { ogSize, ogContentType, loadLighthouse } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";

export const alt = "Port A Local — Event";
export const size = ogSize;
export const contentType = ogContentType;
// Force fresh render each scrape so the countdown + status reflect
// current state. FB will still cache its scrape — refresh via the
// Sharing Debugger when the countdown rolls over to a milestone.
export const dynamic = "force-dynamic";

/**
 * Compute the countdown unit + status for the OG.
 *   - past:    "WRAPPED"
 *   - live:    "LIVE NOW"
 *   - today:   "TODAY"
 *   - 1d:      "TOMORROW"
 *   - 2-30d:   "N DAYS"
 *   - 31d+:    show full date instead
 */
function countdownLabel(startISO: string, endISO: string): {
  big: string;
  status: "future" | "today" | "live" | "past";
} {
  const now = Date.now();
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (now > end) return { big: "WRAPPED", status: "past" };
  if (now >= start) return { big: "LIVE NOW", status: "live" };
  const msToStart = start - now;
  const days = Math.ceil(msToStart / (24 * 60 * 60 * 1000));
  if (days <= 0) return { big: "TODAY", status: "today" };
  if (days === 1) return { big: "TOMORROW", status: "future" };
  if (days <= 30) return { big: `${days} DAYS`, status: "future" };
  return {
    big: new Date(startISO).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }).toUpperCase(),
    status: "future",
  };
}

/**
 * Per-status accent palette. Live = emerald (urgency), today = coral
 * (action), future = sky-blue (anticipation), past = navy (archive).
 */
function paletteFor(status: "future" | "today" | "live" | "past") {
  switch (status) {
    case "live":
      return { accent: "#10b981", accentSoft: "rgba(16, 185, 129, 0.15)", glow: "#34d39a" };
    case "today":
      return { accent: "#e8656f", accentSoft: "rgba(232, 101, 111, 0.15)", glow: "#f0a0a6" };
    case "past":
      return { accent: "#4a5568", accentSoft: "rgba(74, 85, 104, 0.15)", glow: "#8896ab" };
    case "future":
    default:
      return { accent: "#f0a0a6", accentSoft: "rgba(232, 101, 111, 0.10)", glow: "#fcd5ce" };
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0b1120",
            color: "#f5f0e8",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Port A Local — Events
        </div>
      ),
      { ...size },
    );
  }

  const { big, status } = countdownLabel(event.startISO, event.endISO);
  const palette = paletteFor(status);
  const lighthouse = loadLighthouse("standard");

  // Headline date — short weekday + month-day, e.g. "SAT MAY 9"
  const startDate = new Date(event.startISO);
  const headlineDate = startDate
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  // Title-fit logic — long names shrink so they don't wrap onto 4 lines
  const titleFontSize =
    event.name.length > 50 ? 48 : event.name.length > 32 ? 58 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0b1120",
          backgroundImage: `radial-gradient(circle at 85% 25%, ${palette.accentSoft} 0%, transparent 55%)`,
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {/* Top row — badge + date label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 20px",
              borderRadius: 999,
              border: `1px solid ${palette.accent}66`,
              backgroundColor: palette.accentSoft,
              color: palette.glow,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            EVENT · {event.cost.toUpperCase()}
          </div>
          <span
            style={{
              color: "#8896ab",
              fontSize: 16,
              fontFamily: "monospace",
              letterSpacing: "0.18em",
            }}
          >
            {headlineDate}
          </span>
        </div>

        {/* Center — countdown + icon side by side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 50,
            flexGrow: 1,
            marginTop: 20,
          }}
        >
          {/* Left column — countdown + name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              gap: 14,
              maxWidth: 760,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#8896ab",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {status === "live"
                ? "Happening now"
                : status === "today"
                  ? "Today"
                  : status === "past"
                    ? "Wrapped"
                    : "Until kickoff"}
            </div>
            <div
              style={{
                fontSize: big.length > 8 ? 110 : 140,
                fontWeight: 900,
                color: palette.accent,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                textShadow: `0 0 60px ${palette.accentSoft}`,
              }}
            >
              {big}
            </div>
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 800,
                color: "#f5f0e8",
                lineHeight: 1.05,
                marginTop: 12,
              }}
            >
              {event.name}
            </div>
            {event.headlineTime && (
              <div
                style={{
                  fontSize: 22,
                  color: "#8896ab",
                  fontWeight: 400,
                  marginTop: 4,
                }}
              >
                {event.headlineTime}
              </div>
            )}
          </div>

          {/* Right column — event icon as visual focal point */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 240,
              height: 240,
              borderRadius: "50%",
              border: `2px solid ${palette.accent}33`,
              backgroundColor: palette.accentSoft,
              fontSize: 140,
              flexShrink: 0,
            }}
          >
            {event.icon || "📅"}
          </div>
        </div>

        {/* Bottom — PAL lockup + venue */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lighthouse} width={44} height={44} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#e8656f",
                  letterSpacing: "0.05em",
                }}
              >
                PORT A LOCAL
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#4a5568",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Event hub · theportalocal.com/events
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "#4a5568",
              fontFamily: "monospace",
              maxWidth: 460,
              textAlign: "right",
            }}
          >
            {event.venueName}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
