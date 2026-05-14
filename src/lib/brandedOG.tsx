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
 *
 * LAYOUT REFRESH (Collie 2026-05-14):
 * Updated to match the OG Link Card Post Templates brand templates.
 * Icon moved from the pill to a large icon-in-circle on the right.
 * Pill now follows "WHERE • WHAT" structure; bottom-left lockup is
 * "PORT A LOCAL" wordmark + section/path with no lighthouse silhouette.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export type LighthouseVariant = "full" | "standard" | "simple" | "icon";

export function loadLighthouse(variant: LighthouseVariant = "standard"): string {
  const file = `lighthouse-${variant}.svg`;
  const buf = fs.readFileSync(path.join(process.cwd(), "public/logos", file));
  return `data:image/svg+xml;base64,${buf.toString("base64")}`;
}

/**
 * Load a PNG icon from public/icons/og/<name>.png as a base64 data URI.
 *
 * Use this for icons where satori's SVG renderer drifts the path — its
 * Bezier interpretation isn't 1:1 with browser SVG, so complex curves
 * (like the music-note flag) render visibly off-spec. Pre-rasterized PNG
 * is pixel-perfect because it skips satori's SVG path interpreter entirely.
 *
 * Trade-off: PNGs ship at a fixed color (light coral, in this case) and
 * can't currentColor-tint per card system. Acceptable for icons that only
 * appear in one card-color context (music → coral cards only).
 */
export function loadPngIcon(name: string): string {
  const buf = fs.readFileSync(
    path.join(process.cwd(), "public/icons/og", `${name}.png`),
  );
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/* ------------------------------------------------------------------ */
/* Fonts — Inter (body / pill / headline) + Playfair Display (wordmark) */
/* Per Collie's spec, every Link Card uses Inter except "PORT A LOCAL" */
/* which uses Playfair Display.                                         */
/* ------------------------------------------------------------------ */

const FONTS_DIR = path.join(process.cwd(), "public/fonts");

const interRegular = fs.readFileSync(path.join(FONTS_DIR, "Inter-Regular.ttf"));
const interSemiBold = fs.readFileSync(path.join(FONTS_DIR, "Inter-SemiBold.ttf"));
const interExtraBold = fs.readFileSync(path.join(FONTS_DIR, "Inter-ExtraBold.ttf"));
const playfairBold = fs.readFileSync(path.join(FONTS_DIR, "PlayfairDisplay-Bold.ttf"));

const OG_FONTS = [
  { name: "Inter", data: interRegular, weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: interSemiBold, weight: 600 as const, style: "normal" as const },
  { name: "Inter", data: interExtraBold, weight: 800 as const, style: "normal" as const },
  { name: "Playfair Display", data: playfairBold, weight: 700 as const, style: "normal" as const },
];

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
  iconCircle: string;
  iconColor: string;
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
    iconCircle: PALETTE.navyMid,
    iconColor: PALETTE.lightCoral,
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
    iconCircle: PALETTE.navyDeep,
    iconColor: PALETTE.lightCoral,
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
    iconCircle: PALETTE.coralAlt,
    iconColor: PALETTE.lightCoral,
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
    iconCircle: PALETTE.seafoam,
    iconColor: PALETTE.navyMid,
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
    iconCircle: PALETTE.white,
    iconColor: PALETTE.red,
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

  // Surfaces not in Collie's spec — best-fit defaults
  "beach": "seafoam", // transactional booking
  "services": "seafoam", // operational booking + provider directory
  "essentials": "coral", // visitor-guidance editorial, sibling to guides
  "where-to-stay": "coral", // lodging directory-style listing

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
  /**
   * Pill — pre-2026-05-14 single-string form. New code prefers `where` + `what`.
   * If `where`/`what` are provided, `badge` is ignored.
   */
  badge?: string;
  /** Pill — left half (e.g. "DISCOVER", "PLAN", "ORDER"). */
  where?: string;
  /** Pill — right half (e.g. "HERITAGE", "LIVE MUSIC"). */
  what?: string;
  /** Big icon-in-circle on the right side of the card. */
  badgeIcon?: PortalIconName;
  /**
   * PNG-backed icon — loaded from public/icons/og/<name>.png. Use when
   * satori's SVG renderer drifts a complex path (e.g. music-note). The PNG
   * already carries its color, so no `iconColor` tint is applied.
   * Mutually exclusive with badgeIcon; if both are set, pngIcon wins.
   */
  pngIcon?: string;
  /** Headline — the biggest piece of type. Required. */
  title: string;
  /** Sub-headline / dek (subhead position per the brand templates). */
  subtitle?: string;
  /** Body / pull quote line shown between the headline and the subheading. */
  body?: string;
  /** Top-right supporting text (tracked uppercase). */
  bodyTopRight?: string;
  /** Bottom-right supporting text (tracked uppercase). */
  bodyBottomRight?: string;
  /**
   * Bottom-left URL path under the PORT A LOCAL wordmark, e.g. "/heritage".
   * Rendered as "DISCOVER • theportalocal.com{path}".
   */
  path?: string;
  /** Optional right-side meta, e.g. ISO date — falls back as bodyTopRight. */
  meta?: string;
  /**
   * Lighthouse silhouette variant — retained for back-compat with v1 callers;
   * the new layout (2026-05-14) doesn't render the lighthouse in the lockup.
   */
  lockupVariant?: LighthouseVariant;
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
  where,
  what,
  badgeIcon,
  pngIcon,
  title,
  subtitle,
  body,
  bodyTopRight,
  bodyBottomRight,
  path,
  meta,
  category,
  cardSystem,
  background,
  titleColor,
  subtitleColor,
}: BrandedOGProps): ImageResponse {
  const titleFontSize =
    title.length > 60 ? 56 : title.length > 30 ? 68 : 78;

  const system = cardSystem ?? categoryCardSystem(category);
  const tokens = CARD_SYSTEMS[system];

  const bg = background ?? tokens.background;
  const headlineColor = titleColor ?? tokens.headline;
  const subColor = subtitleColor ?? tokens.subhead;

  const pillWhere = (where ?? "DISCOVER").toUpperCase();
  const pillWhat = (what ?? badge ?? "").toUpperCase();
  const showPill = Boolean(pillWhat);
  const topRight = bodyTopRight ?? meta;
  const displayPath = path ? `theportalocal.com${path}` : "theportalocal.com";

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
          padding: "50px 60px",
          fontFamily: "Inter",
        }}
      >
        {/* Top row: WHERE • WHAT pill + top-right supporting text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {showPill ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 26px",
                borderRadius: 999,
                backgroundColor: tokens.pillBg,
                color: tokens.pillText,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span>{pillWhere}</span>
              <div
                style={{
                  display: "flex",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: tokens.pillBullet,
                }}
              />
              <span>{pillWhat}</span>
            </div>
          ) : (
            <div />
          )}
          {topRight ? (
            <span
              style={{
                color: tokens.body,
                fontSize: 14,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {topRight}
            </span>
          ) : null}
        </div>

        {/* Middle row: headline column + icon-in-circle */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 40,
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 800,
                color: headlineColor,
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                maxWidth: 720,
              }}
            >
              {title}
            </div>
            {body ? (
              <div
                style={{
                  fontSize: 16,
                  color: tokens.body,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  maxWidth: 700,
                }}
              >
                {body}
              </div>
            ) : null}
            {subtitle ? (
              <div
                style={{
                  fontSize: 28,
                  color: subColor,
                  lineHeight: 1.3,
                  fontWeight: 700,
                  maxWidth: 700,
                  marginTop: 4,
                }}
              >
                {subtitle.length > 140
                  ? subtitle.slice(0, 140) + "…"
                  : subtitle}
              </div>
            ) : null}
          </div>

          {pngIcon || badgeIcon ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 300,
                height: 300,
                borderRadius: 999,
                backgroundColor: tokens.iconCircle,
                color: tokens.iconColor,
                flexShrink: 0,
              }}
            >
              {pngIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loadPngIcon(pngIcon)}
                  width={200}
                  height={200}
                  alt=""
                />
              ) : (
                <PortalIcon name={badgeIcon!} width={170} height={170} />
              )}
            </div>
          ) : null}
        </div>

        {/* Bottom row: PORT A LOCAL + path (left), bottom-right body (right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "Playfair Display",
                fontSize: 30,
                fontWeight: 700,
                color: tokens.wordmark,
                letterSpacing: "0.02em",
              }}
            >
              PORT A LOCAL
            </span>
            <span
              style={{
                fontSize: 13,
                color: tokens.wordmarkSubtitle,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {pillWhere} • {displayPath}
            </span>
          </div>
          {bodyBottomRight ? (
            <span
              style={{
                color: tokens.body,
                fontSize: 14,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {bodyBottomRight}
            </span>
          ) : null}
        </div>
      </div>
    ),
    { ...ogSize, fonts: OG_FONTS }
  );
}
