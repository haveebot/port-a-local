/**
 * Direction 3 — Heritage Seal
 *
 * A full seal / stamp with curved type, a lighthouse silhouette, and compass
 * tick marks. Reads as institutional weight — newspaper masthead, signet ring,
 * field notebook cover. Use as signature piece on Dispatch footers, About
 * pages, and anywhere PAL wants to feel like it has been here a while.
 */

interface SealMarkProps {
  size?: number | string;
  variant?: "dark" | "light";
  className?: string;
}

export default function SealMark({
  size = 128,
  variant = "light",
  className,
}: SealMarkProps) {
  const ink = variant === "dark" ? "#f5f0e8" : "#0b1120";
  const paper = variant === "dark" ? "#0b1120" : "#f5f0e8";
  const accent = "#e8656f"; // coral-500

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Port A Local heritage seal"
    >
      <defs>
        {/* Top arc — text curves above the lighthouse */}
        <path id="seal-arc-top" d="M 22 64 A 42 42 0 0 1 106 64" fill="none" />
        {/* Bottom arc — mirrored so text reads normally along the bottom */}
        <path
          id="seal-arc-bottom"
          d="M 26 72 A 38 38 0 0 0 102 72"
          fill="none"
        />
      </defs>

      {/* Outer ring */}
      <circle
        cx="64"
        cy="64"
        r="60"
        fill={paper}
        stroke={ink}
        strokeWidth="2"
      />
      {/* Inner ring — defines the type band */}
      <circle
        cx="64"
        cy="64"
        r="52"
        fill="none"
        stroke={ink}
        strokeWidth="0.75"
      />
      {/* Innermost ring — frames the vignette */}
      <circle
        cx="64"
        cy="64"
        r="38"
        fill="none"
        stroke={ink}
        strokeWidth="0.75"
      />

      {/* Compass ticks at cardinal points */}
      <g stroke={ink} strokeWidth="1.5" strokeLinecap="round">
        <line x1="64" y1="4" x2="64" y2="9" />
        <line x1="64" y1="119" x2="64" y2="124" />
        <line x1="4" y1="64" x2="9" y2="64" />
        <line x1="119" y1="64" x2="124" y2="64" />
      </g>
      {/* Smaller ticks at the intercardinals */}
      <g stroke={ink} strokeWidth="0.75" strokeLinecap="round" opacity="0.6">
        <line
          x1="21.5"
          y1="21.5"
          x2="25"
          y2="25"
          transform="rotate(0 64 64)"
        />
        <line x1="103" y1="21.5" x2="106.5" y2="25" />
        <line x1="21.5" y1="106.5" x2="25" y2="103" />
        <line x1="103" y1="103" x2="106.5" y2="106.5" />
      </g>

      {/* Top curved text */}
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="11"
        fontWeight="700"
        fill={ink}
        letterSpacing="3"
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          PORT A LOCAL
        </textPath>
      </text>

      {/* Bottom curved text */}
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7"
        fontWeight="500"
        fill={ink}
        letterSpacing="4"
      >
        <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">
          PORT ARANSAS · TEXAS
        </textPath>
      </text>

      {/* Central lighthouse vignette */}
      <g transform="translate(50, 42)">
        {/* Base */}
        <rect x="0" y="36" width="28" height="2.5" fill={ink} />
        <rect x="2" y="33" width="24" height="3" fill={ink} opacity="0.8" />
        {/* Tower */}
        <path d="M 5 33 L 7 14 L 21 14 L 23 33 Z" fill={ink} />
        {/* Window */}
        <rect x="13" y="22" width="2" height="4" fill={paper} />
        {/* Gallery */}
        <rect x="4" y="12" width="20" height="2.5" fill={ink} />
        {/* Light room */}
        <rect x="10" y="5" width="8" height="7" fill={ink} />
        {/* Light (coral accent) */}
        <rect x="11" y="7" width="6" height="3" fill={accent} />
        {/* Dome */}
        <path d="M 8 5 Q 14 -1 20 5 Z" fill={ink} />
        {/* Finial */}
        <rect x="13.5" y="-3" width="1" height="2" fill={ink} />
      </g>

      {/* Coral accent bar under the tower */}
      <line
        x1="48"
        y1="92"
        x2="80"
        y2="92"
        stroke={accent}
        strokeWidth="1.5"
      />

      {/* EST. date */}
      <text
        x="64"
        y="102"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="6.5"
        fontWeight="700"
        fill={ink}
        letterSpacing="3"
      >
        EST. 2026
      </text>
    </svg>
  );
}
