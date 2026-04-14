import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

/**
 * Shared branded OG image generator.
 *
 * Every route-level opengraph-image.tsx calls this with its own content.
 * Guarantees consistent PAL identity across every shared link.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export type LighthouseVariant = "full" | "standard" | "simple" | "icon";

export function loadLighthouse(variant: LighthouseVariant = "standard"): string {
  const file = `lighthouse-${variant}.svg`;
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

interface BrandedOGProps {
  /** Small pill at the top — e.g. "Heritage · 12 min read" */
  badge?: string;
  /** Headline — the biggest piece of type. Required. */
  title: string;
  /** Sub-headline / dek */
  subtitle?: string;
  /** Lighthouse variant for the bottom-left lockup */
  lockupVariant?: LighthouseVariant;
  /** Optional right-side meta, e.g. ISO date */
  meta?: string;
  /** Overrides — rarely needed */
  background?: string;
  titleColor?: string;
  subtitleColor?: string;
}

/** Generate a consistent, branded 1200×630 OG image. */
export function brandedOG({
  badge,
  title,
  subtitle,
  lockupVariant = "standard",
  meta,
  background = "#0b1120",
  titleColor = "#f5f0e8",
  subtitleColor = "#8896ab",
}: BrandedOGProps): ImageResponse {
  const lighthouse = loadLighthouse(lockupVariant);
  const titleFontSize =
    title.length > 60 ? 52 : title.length > 30 ? 66 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: background,
          padding: "60px 70px",
        }}
      >
        {/* Top — badge + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {badge ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(232, 101, 111, 0.4)",
                backgroundColor: "rgba(232, 101, 111, 0.12)",
                color: "#f0a0a6",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </div>
          ) : (
            <div />
          )}
          {meta && (
            <span style={{ color: "#4a5568", fontSize: 14, fontFamily: "monospace" }}>
              {meta}
            </span>
          )}
        </div>

        {/* Center — title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              color: titleColor,
              lineHeight: 1.05,
              maxWidth: 1060,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 24,
                color: subtitleColor,
                lineHeight: 1.35,
                maxWidth: 960,
                fontWeight: 300,
              }}
            >
              {subtitle.length > 180 ? subtitle.slice(0, 180) + "..." : subtitle}
            </div>
          )}
        </div>

        {/* Bottom — PAL lockup + coordinates */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lighthouse} width={54} height={54} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#e8656f",
                  letterSpacing: "0.05em",
                }}
              >
                PORT A LOCAL
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#4a5568",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Port Aransas, TX
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
    { ...ogSize }
  );
}
