import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

/**
 * Shared branded OG image generator.
 *
 * Every route-level opengraph-image.tsx calls this with its own content.
 * Guarantees consistent PAL identity across every shared link.
 *
 * COLOR SYSTEM (Collie 2026-05-06):
 * Each surface category maps to one of 4 card systems (seafoam · coral · navy · yellow).
 * Pages pass `category` and the system + tokens are derived automatically.
 * Source spec: PAL SOCIAL - LINK CARDS VISUAL IDENTITY & SYSTEMS.pdf (uid 294).
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export type LighthouseVariant = "full" | "standard" | "simple" | "icon";

export function loadLighthouse(variant: LighthouseVariant = "standard"): string {
  const file = `lighthouse-${variant}.svg`;
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

/* ------------------------------------------------------------------ */
/* Card systems — Collie's spec                                       */
/* ------------------------------------------------------------------ */

export type CardSystem = "seafoam" | "coral" | "navy" | "yellow" | "red";

interface CardTokens {
  background: string;
  pillBg: string;
  pillText: string;
  pillBullet: string;
  headline: string;
  subhead: string;
  body: string;
  wordmark: string;
  wordmarkSubtitle: string;
  meta: string;
}

const PALETTE = {
  seafoam: "#10B981",
  coral: "#E8656F",
  coralAlt: "#F28388",
  lightCoral: "#FFBABD",
  navyDeep: "#111D35",
  navyMid: "#1B2D4C",
  yellow: "#FFD687",
  white: "#FFFFFF",
  red: "#DC2626",
} as const;

export const CARD_SYSTEMS: Record<CardSystem, CardTokens> = {
  seafoam: {
    background: PALETTE.seafoam,
    pillBg: "rgba(27, 45, 76, 0.75)", // navy mid @ 75%
    pillText: PALETTE.white,
    pillBullet: PALETTE.coral,
    headline: PALETTE.navyMid,
    subhead: PALETTE.navyMid,
    body: PALETTE.white,
    wordmark: PALETTE.white,
    wordmarkSubtitle: PALETTE.navyMid,
    meta: PALETTE.navyMid,
  },
  coral: {
    background: PALETTE.coral,
    pillBg: "rgba(17, 29, 53, 0.75)", // navy deep @ 75%
    pillText: PALETTE.white,
    pillBullet: PALETTE.lightCoral,
    headline: PALETTE.lightCoral,
    subhead: PALETTE.navyMid,
    body: PALETTE.white,
    wordmark: PALETTE.white,
    wordmarkSubtitle: PALETTE.navyMid,
    meta: PALETTE.navyMid,
  },
  navy: {
    background: PALETTE.navyDeep,
    pillBg: "rgba(242, 131, 136, 0.75)", // coral alt @ 75%
    pillText: PALETTE.white,
    pillBullet: PALETTE.navyDeep,
    headline: PALETTE.lightCoral,
    subhead: PALETTE.white,
    body: PALETTE.coralAlt,
    wordmark: PALETTE.white,
    wordmarkSubtitle: PALETTE.white,
    meta: PALETTE.coralAlt,
  },
  yellow: {
    background: PALETTE.yellow,
    pillBg: "rgba(17, 29, 53, 1)", // navy deep @ 100%
    pillText: PALETTE.white,
    pillBullet: PALETTE.seafoam,
    headline: PALETTE.navyMid,
    subhead: PALETTE.seafoam,
    body: PALETTE.navyMid,
    wordmark: PALETTE.navyMid,
    wordmarkSubtitle: PALETTE.navyMid,
    meta: PALETTE.navyMid,
  },
  red: {
    background: PALETTE.red,
    pillBg: "rgba(255, 255, 255, 0.2)",
    pillText: PALETTE.white,
    pillBullet: PALETTE.white,
    headline: PALETTE.white,
    subhead: PALETTE.white,
    body: PALETTE.white,
    wordmark: PALETTE.white,
    wordmarkSubtitle: PALETTE.white,
    meta: PALETTE.white,
  },
};

/**
 * Surface category → card system mapping (Collie's spec, 2026-05-06).
 *
 * Categories not yet color-assigned by Collie default to seafoam (the
 * operations/transactional tier). When she fills in those gaps, update
 * this table — the rest of the app inherits automatically.
 */
export const CATEGORY_TO_SYSTEM: Record<string, CardSystem> = {
  // Browse / transact
  "pal-delivery": "seafoam",
  "pal-carts": "seafoam",
  "pal-locals": "yellow",
  "pal-housekeeping": "seafoam", // not specified by Collie — defaulting
  "maintenance": "seafoam", // not specified by Collie — defaulting
  "gully": "seafoam",
  "directory": "coral",
  "featured": "coral",
  "map": "seafoam",
  "my-trip": "coral",
  "live-conditions": "seafoam",

  // Read / plan / react
  "heritage": "navy",
  "dispatch": "navy",
  "live-music": "coral",
  "events": "coral",
  "tournament-season": "coral",
  "fishing": "seafoam",
  "fishing-report": "seafoam",
  "photos": "navy",
  "photos-archive": "navy",
  "archives": "navy",
  "birding": "seafoam",
  "guides": "coral",

  // Operator pipelines
  "cart-vendor": "seafoam",
  "runner": "seafoam",
  "locals-offers": "yellow",
  "restaurant-partnerships": "seafoam", // not specified by Collie — defaulting
  "event-organizer": "coral",

  // Banner alert tiers (separate concept)
  "alert-critical": "red",
  "alert-advisory": "yellow",
  "alert-community": "coral",
  "alert-council-watch": "navy",

  // Hub / fallback
  "emergency": "red",
  "home": "navy",
  "default": "navy",
};

export function categoryCardSystem(category?: string): CardSystem {
  if (!category) return "navy";
  return CATEGORY_TO_SYSTEM[category] ?? "navy";
}

/* ------------------------------------------------------------------ */
/* Generator                                                           */
/* ------------------------------------------------------------------ */

interface BrandedOGProps {
  /** Small pill at the top — text of the badge */
  badge?: string;
  /** Optional silhouette icon rendered inside the badge, before the text */
  badgeIcon?: PortalIconName;
  /** Headline — the biggest piece of type. Required. */
  title: string;
  /** Sub-headline / dek */
  subtitle?: string;
  /** Lighthouse variant for the bottom-left lockup */
  lockupVariant?: LighthouseVariant;
  /** Optional right-side meta, e.g. ISO date */
  meta?: string;
  /**
   * Surface category — drives color system per Collie's spec.
   * Use `categoryCardSystem(category)` keys (e.g. "live-music", "dispatch").
   */
  category?: string;
  /**
   * Direct system override — bypasses CATEGORY_TO_SYSTEM map. Use rarely;
   * prefer passing `category` so future spec changes propagate automatically.
   */
  cardSystem?: CardSystem;
  /** Per-element overrides — rarely needed */
  background?: string;
  titleColor?: string;
  subtitleColor?: string;
}

/** Generate a consistent, branded 1200×630 OG image. */
export function brandedOG({
  badge,
  badgeIcon,
  title,
  subtitle,
  lockupVariant = "standard",
  meta,
  category,
  cardSystem,
  background,
  titleColor,
  subtitleColor,
}: BrandedOGProps): ImageResponse {
  const lighthouse = loadLighthouse(lockupVariant);
  const titleFontSize =
    title.length > 60 ? 52 : title.length > 30 ? 66 : 78;

  const system = cardSystem ?? categoryCardSystem(category);
  const tokens = CARD_SYSTEMS[system];

  // Per-element overrides win over system tokens
  const bg = background ?? tokens.background;
  const headlineColor = titleColor ?? tokens.headline;
  const subColor = subtitleColor ?? tokens.subhead;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: bg,
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
                backgroundColor: tokens.pillBg,
                color: tokens.pillText,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: tokens.pillBullet,
                }}
              />
              {badgeIcon && (
                <div style={{ display: "flex", width: 20, height: 20 }}>
                  <PortalIcon name={badgeIcon} width={20} height={20} />
                </div>
              )}
              {badge}
            </div>
          ) : (
            <div />
          )}
          {meta && (
            <span style={{ color: tokens.meta, fontSize: 14, fontFamily: "monospace" }}>
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
              color: headlineColor,
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
                color: subColor,
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
                  color: tokens.wordmark,
                  letterSpacing: "0.05em",
                }}
              >
                PORT A LOCAL
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: tokens.wordmarkSubtitle,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Discover · theportalocal.com
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 14,
              color: tokens.meta,
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
