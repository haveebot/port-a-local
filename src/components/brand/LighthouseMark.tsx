/**
 * Port A Local — Lighthouse Mark
 *
 * Inspired by the actual Lydia Ann Lighthouse (1857) across the channel on
 * Harbor Island. Short, stocky, octagonal, white body, dark dome. The literal
 * heritage anchor PAL owns editorially.
 *
 * One component, four detail levels — progressively simpler for progressively
 * smaller / noisier contexts. Use `detail="standard"` (the default) for nav and
 * most web usage. Step up to `"full"` only when the mark has room to breathe
 * (hero, OG image). Step down to `"simple"` or `"icon"` for button chips,
 * favicons, and inline contexts where clarity beats detail.
 */

export type LighthouseDetail = "full" | "standard" | "simple" | "icon";

interface LighthouseMarkProps {
  size?: number | string;
  /** "dark" for light backgrounds, "light" for dark backgrounds */
  variant?: "dark" | "light";
  /** How much detail to render. Default: "standard" */
  detail?: LighthouseDetail;
  /** Force a single-color silhouette (no coral light). Useful for monochrome prints. */
  monochrome?: boolean;
  className?: string;
}

export default function LighthouseMark({
  size = 64,
  variant = "dark",
  detail = "standard",
  monochrome = false,
  className,
}: LighthouseMarkProps) {
  const ink = variant === "dark" ? "#0b1120" : "#f5f0e8";
  const shadow = variant === "dark" ? "#1e3a5f" : "#d4c9b8";
  const paper = variant === "dark" ? "#f5f0e8" : "#0b1120";
  const accent = monochrome ? ink : "#e8656f";

  // Detail gating
  const showBeam = detail === "full";
  const showFinial = detail === "full";
  const showWindows = detail === "full" || detail === "standard";
  const showShading = detail === "full" || detail === "standard";
  const showGalleryDetail = detail !== "icon";
  const showBasePlatform = detail !== "icon";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Port A Local lighthouse mark"
    >
      {/* Beam rays — only at full detail */}
      {showBeam && (
        <g opacity="0.55">
          <path d="M 24 16 L 4 8 L 4 16 Z" fill={accent} />
          <path d="M 40 16 L 60 8 L 60 16 Z" fill={accent} />
        </g>
      )}

      {/* Base ground */}
      <rect x="8" y="58" width="48" height="3" fill={ink} />
      {/* Base platform upper lip (only when we have room) */}
      {showBasePlatform && (
        <rect x="11" y="54" width="42" height="4" fill={shadow} />
      )}

      {/* Tower shaft */}
      {showShading ? (
        // 3-panel shading — gives octagonal illusion without literal geometry
        <>
          <path d="M 17 54 L 20 24 L 22 24 L 20 54 Z" fill={ink} />
          <path d="M 20 54 L 22 24 L 42 24 L 44 54 Z" fill={shadow} />
          <path d="M 44 54 L 42 24 L 44 24 L 47 54 Z" fill={ink} />
        </>
      ) : (
        // Flat single-color shaft
        <path d="M 17 58 L 20 24 L 44 24 L 47 58 Z" fill={ink} />
      )}

      {/* Porthole windows */}
      {showWindows && (
        <>
          <circle cx="32" cy="34" r="1.8" fill={paper} />
          <circle cx="32" cy="44" r="1.8" fill={paper} />
        </>
      )}

      {/* Gallery — the catwalk band under the light room */}
      <rect x="15" y="20" width="34" height="4" fill={ink} />
      {showGalleryDetail && (
        <rect x="17" y="22" width="30" height="2" fill={shadow} />
      )}

      {/* Light room */}
      <rect x="23" y="12" width="18" height="8" fill={ink} />
      {/* The light itself — always coral unless monochrome */}
      <rect x="26" y="14" width="12" height="4" fill={accent} />

      {/* Dome */}
      <path d="M 21 12 Q 32 3 43 12 Z" fill={ink} />

      {/* Finial — only at full detail */}
      {showFinial && (
        <>
          <rect x="31" y="2" width="2" height="3" fill={shadow} />
          <circle cx="32" cy="2" r="1.5" fill={accent} />
        </>
      )}
    </svg>
  );
}
