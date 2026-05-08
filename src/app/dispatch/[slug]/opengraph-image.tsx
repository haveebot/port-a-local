import { getDispatchBySlug } from "@/data/dispatches";
import { brandedOG, ogSize, ogContentType, loadLighthouse } from "@/lib/brandedOG";
import { ImageResponse } from "next/og";

export const alt = "Port A Dispatch";
export const size = ogSize;
export const contentType = ogContentType;
// Force fresh render so post-publish edits to ogHighlight + content
// land immediately. FB caches its scrape but rescrapes on debug + on
// re-share.
export const dynamic = "force-dynamic";

/**
 * Dispatch OG image.
 *
 * If the dispatch carries an `ogHighlight` (stat or pull quote),
 * renders an attention-getting "highlight" layout — big coral stat
 * or quote on a navy ground, designed to stop the scroll on social.
 *
 * If no ogHighlight is set, falls back to the standard branded OG
 * (consistent across the rest of the site).
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dispatch = getDispatchBySlug(slug);

  if (!dispatch) {
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
          Port A Dispatch
        </div>
      ),
      { ...size },
    );
  }

  const date = new Date(dispatch.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // No highlight set → fall back to standard branded OG
  if (!dispatch.ogHighlight) {
    return brandedOG({
      badge: `Dispatch · ${dispatch.category}`,
      badgeIcon: "dispatch",
      title: dispatch.title,
      subtitle: dispatch.subtitle,
      meta: `${dispatch.readTime} · ${date}`,
      lockupVariant: "standard",
      category: "dispatch",
    });
  }

  const lighthouse = loadLighthouse("standard");
  // Title sized to fit comfortably in the right column (~520px wide
  // after the stat column + divider + gap). 38px fits ~3 lines for
  // long titles; longer titles auto-shrink further.
  const titleFontSize =
    dispatch.title.length > 50 ? 38 : dispatch.title.length > 32 ? 44 : 54;

  // STAT layout — big coral number anchors the left, title + meta right
  if (dispatch.ogHighlight.type === "stat") {
    const { text, label } = dispatch.ogHighlight;
    // Stat font sized inversely to length so 1-char ("$") ≈ 240, 4-char
    // ("8.7%") ≈ 200, 6-char ("$1.3B") ≈ 160. Keeps it always huge but
    // never crowds out the title.
    const statFontSize = text.length <= 2 ? 240 : text.length <= 5 ? 200 : 160;
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "#0b1120",
            backgroundImage:
              "radial-gradient(circle at 25% 50%, rgba(232, 101, 111, 0.18) 0%, transparent 55%)",
            padding: "56px 64px",
          }}
        >
          {/* Top row — badge + meta */}
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
                border: "1px solid rgba(232, 101, 111, 0.5)",
                backgroundColor: "rgba(232, 101, 111, 0.15)",
                color: "#f0a0a6",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              DISPATCH · {dispatch.category}
            </div>
            <span
              style={{
                color: "#8896ab",
                fontSize: 16,
                fontFamily: "monospace",
                letterSpacing: "0.18em",
              }}
            >
              {dispatch.readTime.toUpperCase()} · {date.toUpperCase()}
            </span>
          </div>

          {/* Center — split: stat left, content right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 48,
              flexGrow: 1,
              marginTop: 16,
            }}
          >
            {/* Stat column — fixed width so the title column gets a
                predictable ~520px to wrap into without clipping */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                flexShrink: 0,
                width: 420,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#8896ab",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                The number
              </div>
              <div
                style={{
                  fontSize: statFontSize,
                  fontWeight: 900,
                  color: "#e8656f",
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                  textShadow: "0 0 80px rgba(232, 101, 111, 0.4)",
                }}
              >
                {text}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#a3b0c2",
                  lineHeight: 1.3,
                  fontWeight: 400,
                  marginTop: 4,
                  maxWidth: 480,
                }}
              >
                {label}
              </div>
            </div>

            {/* Vertical divider */}
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                backgroundColor: "rgba(232, 101, 111, 0.2)",
              }}
            />

            {/* Title column — explicit width so next/og wraps the
                title text instead of overflowing the canvas. Total
                row: 1200 - 128 padding - 420 stat - 48 gap - 1
                divider - 48 gap = 555 → safe round-down to 540. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: 540,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: titleFontSize,
                  fontWeight: 800,
                  color: "#f5f0e8",
                  lineHeight: 1.08,
                  width: 540,
                }}
              >
                {dispatch.title}
              </div>
              {dispatch.subtitle && (
                <div
                  style={{
                    fontSize: 18,
                    color: "#8896ab",
                    lineHeight: 1.4,
                    fontWeight: 300,
                    width: 540,
                  }}
                >
                  {dispatch.subtitle.length > 130
                    ? dispatch.subtitle.slice(0, 130) + "…"
                    : dispatch.subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Bottom — PAL lockup */}
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
                  Dispatch · theportalocal.com
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: 14,
                color: "#4a5568",
                fontFamily: "monospace",
              }}
            >
              27°50′N · 97°03′W
            </span>
          </div>
        </div>
      ),
      { ...size },
    );
  }

  // QUOTE layout — pull quote anchors center, title + meta below
  const { text, attribution } = dispatch.ogHighlight;
  const quoteFontSize = text.length > 80 ? 38 : text.length > 50 ? 50 : 64;
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0b1120",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(232, 101, 111, 0.12) 0%, transparent 60%)",
          padding: "56px 64px",
        }}
      >
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
              border: "1px solid rgba(232, 101, 111, 0.5)",
              backgroundColor: "rgba(232, 101, 111, 0.15)",
              color: "#f0a0a6",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            DISPATCH · {dispatch.category}
          </div>
          <span
            style={{
              color: "#8896ab",
              fontSize: 16,
              fontFamily: "monospace",
              letterSpacing: "0.18em",
            }}
          >
            {dispatch.readTime.toUpperCase()} · {date.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            flexGrow: 1,
            justifyContent: "center",
            paddingLeft: 40,
            borderLeft: "4px solid #e8656f",
            marginLeft: 8,
          }}
        >
          <div
            style={{
              fontSize: quoteFontSize,
              fontWeight: 700,
              color: "#f5f0e8",
              lineHeight: 1.15,
              fontStyle: "italic",
              maxWidth: 980,
              textShadow: "0 0 60px rgba(232, 101, 111, 0.3)",
            }}
          >
            “{text}”
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#f0a0a6",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            — {attribution}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#a3b0c2",
              lineHeight: 1.25,
              marginTop: 12,
              maxWidth: 1020,
            }}
          >
            {dispatch.title}
          </div>
        </div>

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
                Dispatch · theportalocal.com
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: "#4a5568",
              fontFamily: "monospace",
            }}
          >
            27°50′N · 97°03′W
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
