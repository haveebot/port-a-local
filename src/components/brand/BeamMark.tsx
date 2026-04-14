/**
 * Direction 2 — Beam Mark
 *
 * The lighthouse implied by its beam, not its tower. A coral light radiating
 * outward through a navy field. Abstract, modern, wayfinding-first.
 *
 * Best use: favicon (core reads at 16px), modern OG lockups, icon-only
 * contexts where a literal lighthouse would be too illustrative.
 */

interface BeamMarkProps {
  size?: number | string;
  /** "dark" fills the disc with navy (like a night sky). "light" leaves it open. */
  variant?: "dark" | "light";
  className?: string;
}

export default function BeamMark({
  size = 64,
  variant = "dark",
  className,
}: BeamMarkProps) {
  const field = variant === "dark" ? "#0b1120" : "#f5f0e8";
  const accent = "#e8656f"; // coral-500
  const core = variant === "dark" ? "#f5f0e8" : "#0b1120";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Port A Local beam mark"
    >
      <defs>
        {/* Beam gradients — coral fading outward */}
        <linearGradient
          id="beamL"
          x1="32"
          y1="32"
          x2="2"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="beamR"
          x1="32"
          y1="32"
          x2="62"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="beamU"
          x1="32"
          y1="32"
          x2="32"
          y2="2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.75" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Night-sky disc */}
      <circle cx="32" cy="32" r="30" fill={field} />

      {/* Three beams — horizontal sweep dominant, vertical softer */}
      <path d="M 32 32 L 4 24 L 4 40 Z" fill="url(#beamL)" />
      <path d="M 32 32 L 60 24 L 60 40 Z" fill="url(#beamR)" />
      <path d="M 32 32 L 25 4 L 39 4 Z" fill="url(#beamU)" />

      {/* Implied tower — a single vertical stroke fading downward */}
      <rect x="30.5" y="37" width="3" height="22" fill={accent} opacity="0.85" />
      <rect x="28" y="58" width="8" height="3" fill={accent} opacity="0.85" />

      {/* The light source — hero of the mark */}
      <circle cx="32" cy="32" r="5" fill={accent} />
      <circle cx="32" cy="32" r="2" fill={core} />
    </svg>
  );
}
