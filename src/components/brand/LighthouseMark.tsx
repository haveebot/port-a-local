/**
 * Direction 1 — Lighthouse Mark
 *
 * Inspired by the actual Lydia Ann Lighthouse (1857) across the channel on Harbor
 * Island — short, stocky, octagonal, white body, dark dome. The literal
 * heritage anchor PAL owns editorially.
 *
 * Reads: Port Aransas, wayfinding, history. Works from favicon to hero.
 */

interface LighthouseMarkProps {
  size?: number | string;
  /** "dark" for light backgrounds, "light" for dark backgrounds */
  variant?: "dark" | "light";
  /** Show the beam rays (disable for small sizes) */
  showBeam?: boolean;
  className?: string;
}

export default function LighthouseMark({
  size = 64,
  variant = "dark",
  showBeam = true,
  className,
}: LighthouseMarkProps) {
  const body = variant === "dark" ? "#0b1120" : "#f5f0e8";
  const shadow = variant === "dark" ? "#1e3a5f" : "#d4c9b8";
  const accent = "#e8656f"; // coral-500 — the light, always warm
  const window_ = variant === "dark" ? "#f5f0e8" : "#0b1120";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Port A Local lighthouse mark"
    >
      {/* Beam rays — directional, echoing a sweeping light */}
      {showBeam && (
        <g opacity="0.55">
          <path d="M 24 16 L 4 8 L 4 16 Z" fill={accent} />
          <path d="M 40 16 L 60 8 L 60 16 Z" fill={accent} />
        </g>
      )}

      {/* Base ground — wider platform */}
      <rect x="8" y="58" width="48" height="3" fill={body} />
      <rect x="11" y="54" width="42" height="4" fill={shadow} />

      {/* Tower shaft — 3-panel construction gives octagonal illusion */}
      {/* Left shadow panel (back octagon face) */}
      <path d="M 17 54 L 20 24 L 22 24 L 20 54 Z" fill={body} />
      {/* Front light panel */}
      <path d="M 20 54 L 22 24 L 42 24 L 44 54 Z" fill={shadow} />
      {/* Right shadow panel */}
      <path d="M 44 54 L 42 24 L 44 24 L 47 54 Z" fill={body} />

      {/* Porthole windows on the front face */}
      <circle cx="32" cy="34" r="1.8" fill={window_} />
      <circle cx="32" cy="44" r="1.8" fill={window_} />

      {/* Gallery band — the catwalk that wraps around the light */}
      <rect x="15" y="20" width="34" height="4" fill={body} />
      <rect x="17" y="22" width="30" height="2" fill={shadow} />

      {/* Light room — houses the lens */}
      <rect x="23" y="12" width="18" height="8" fill={body} />
      {/* The light itself — always coral, even on dark variant */}
      <rect x="26" y="14" width="12" height="4" fill={accent} />

      {/* Dome — rounded cap echoing the real Lydia Ann profile */}
      <path d="M 21 12 Q 32 3 43 12 Z" fill={body} />

      {/* Finial + coral orb */}
      <rect x="31" y="2" width="2" height="3" fill={shadow} />
      <circle cx="32" cy="2" r="1.5" fill={accent} />
    </svg>
  );
}
