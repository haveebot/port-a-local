/**
 * Direction 4 — The Fusion
 *
 * A mix of Direction 1 (Lighthouse) and Direction 3 (Heritage Seal):
 * the full Lydia Ann lighthouse from D1 placed inside a sealed frame, with
 * deliberate distance from the Port Aransas Tourism Bureau's destination-
 * marketing visual language.
 *
 * Attitude moves:
 * - Beam rays cross the inner ring (refusing the frame)
 * - Coordinates on the bottom arc instead of "PORT ARANSAS · TEXAS"
 * - Coral breaks at cardinals (disrupting the navy ring)
 * - 12-point compass hash marks on the outer ring (maritime chart, not tourism)
 * - Serif wordmark, not sans — institutional, not destination
 */

interface FusionMarkProps {
  size?: number | string;
  variant?: "dark" | "light";
  className?: string;
}

export default function FusionMark({
  size = 128,
  variant = "light",
  className,
}: FusionMarkProps) {
  const ink = variant === "dark" ? "#f5f0e8" : "#0b1120";
  const paper = variant === "dark" ? "#0b1120" : "#f5f0e8";
  const shadow = variant === "dark" ? "#1e3a5f" : "#d4c9b8";
  const accent = "#e8656f";

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
        <path
          id="fusion-arc-top"
          d="M 22 64 A 42 42 0 0 1 106 64"
          fill="none"
        />
        <path
          id="fusion-arc-bottom"
          d="M 26 74 A 38 38 0 0 0 102 74"
          fill="none"
        />
      </defs>

      {/* Outer ring — thicker, more confident */}
      <circle
        cx="64"
        cy="64"
        r="60"
        fill={paper}
        stroke={ink}
        strokeWidth="2.5"
      />

      {/* Inner ring — thin, broken by coral at cardinals */}
      <circle
        cx="64"
        cy="64"
        r="48"
        fill="none"
        stroke={ink}
        strokeWidth="0.75"
      />

      {/* Coral breaks at the four cardinals — disrupt the ring intentionally */}
      <g stroke={accent} strokeWidth="2" strokeLinecap="round">
        <line x1="64" y1="14" x2="64" y2="18" />
        <line x1="64" y1="110" x2="64" y2="114" />
        <line x1="14" y1="64" x2="18" y2="64" />
        <line x1="110" y1="64" x2="114" y2="64" />
      </g>

      {/* 12-point compass hash marks on outer ring — maritime chart */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 64 + Math.sin(angle) * 57;
        const y1 = 64 - Math.cos(angle) * 57;
        const x2 = 64 + Math.sin(angle) * 60;
        const y2 = 64 - Math.cos(angle) * 60;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ink}
            strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
            strokeLinecap="round"
            opacity={i % 3 === 0 ? 1 : 0.6}
          />
        );
      })}

      {/* Top curved text — PORT A LOCAL, serif black */}
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="12"
        fontWeight="800"
        fill={ink}
        letterSpacing="4"
      >
        <textPath
          href="#fusion-arc-top"
          startOffset="50%"
          textAnchor="middle"
        >
          PORT A LOCAL
        </textPath>
      </text>

      {/* Bottom curved text — coordinates, not city name */}
      <text
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7"
        fontWeight="700"
        fill={ink}
        letterSpacing="3"
      >
        <textPath
          href="#fusion-arc-bottom"
          startOffset="50%"
          textAnchor="middle"
        >
          27°50′N · 97°03′W
        </textPath>
      </text>

      {/* Beam rays — break past the inner ring, declaring independence from the frame */}
      <g opacity="0.65">
        <path d="M 56 44 L 28 34 L 28 40 Z" fill={accent} />
        <path d="M 72 44 L 100 34 L 100 40 Z" fill={accent} />
      </g>

      {/* === Full Lydia Ann lighthouse, D1 style, centered and prominent === */}
      {/* Base ground */}
      <rect x="48" y="82" width="32" height="2.5" fill={ink} />
      <rect x="50" y="79" width="28" height="3" fill={shadow} />

      {/* Tower shaft — 3-panel octagonal illusion */}
      <path d="M 54 79 L 56 56 L 58 56 L 56.5 79 Z" fill={ink} />
      <path d="M 56.5 79 L 58 56 L 70 56 L 71.5 79 Z" fill={shadow} />
      <path d="M 71.5 79 L 70 56 L 72 56 L 74 79 Z" fill={ink} />

      {/* Porthole windows */}
      <circle cx="64" cy="62" r="1.2" fill={paper} />
      <circle cx="64" cy="70" r="1.2" fill={paper} />

      {/* Gallery band */}
      <rect x="52" y="53" width="24" height="3" fill={ink} />
      <rect x="54" y="54.5" width="20" height="1.5" fill={shadow} />

      {/* Light room */}
      <rect x="58" y="47" width="12" height="6" fill={ink} />
      {/* Light — coral, always warm */}
      <rect x="60" y="48.5" width="8" height="3" fill={accent} />

      {/* Dome */}
      <path d="M 56 47 Q 64 40 72 47 Z" fill={ink} />

      {/* Finial */}
      <rect x="63" y="37" width="2" height="3" fill={shadow} />
      <circle cx="64" cy="37" r="1.2" fill={accent} />

      {/* EST. 2026 — set cleanly below the lighthouse, tighter than before */}
      <text
        x="64"
        y="100"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="6"
        fontWeight="700"
        fill={ink}
        letterSpacing="4"
      >
        EST. 2026
      </text>
    </svg>
  );
}
