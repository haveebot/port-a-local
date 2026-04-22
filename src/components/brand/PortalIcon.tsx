import type { ReactElement, SVGProps } from "react";

/**
 * PortalIcon — single-color silhouette icons for PAL, replacing emoji across
 * the site in Collie's monochrome style.
 *
 * All icons use `currentColor`, so consumers set color via Tailwind text-* classes.
 * Per Collie's brand rule: coral on navy backgrounds (text-coral-400), navy on
 * white/sand backgrounds (text-navy-900).
 *
 * Round 1 (Collie-designed, approved 2026-04-21): eat, drink, stay, do, fish,
 *   shop, beach, maintenance, cart.
 * Round 2 (drafted in Collie's style 2026-04-22, pending her review):
 *   - Nav items: services, events, heritage, dispatch, archives, guides,
 *     essentials, live, map, photos, mytrip
 *   - Gully chips: burger, happyhour, taco, coffee, seafood, sailing,
 *     surfing, latenight, offshore
 *   - Essentials sections: ferry, parking, weather, wildlife, emergency,
 *     connectivity
 */

export type PortalIconName =
  // Round 1 — Collie-approved
  | "eat"
  | "drink"
  | "stay"
  | "do"
  | "fish"
  | "shop"
  | "beach"
  | "maintenance"
  | "cart"
  // Round 2 — Tier 1 nav
  | "services"
  | "events"
  | "heritage"
  | "dispatch"
  | "archives"
  | "guides"
  | "essentials"
  | "live"
  | "map"
  | "photos"
  | "mytrip"
  // Round 2 — Tier 2 Gully chips
  | "burger"
  | "happyhour"
  | "taco"
  | "coffee"
  | "seafood"
  | "sailing"
  | "surfing"
  | "latenight"
  | "offshore"
  // Round 2 — Tier 3 Essentials section headers
  | "ferry"
  | "parking"
  | "weather"
  | "wildlife"
  | "emergency"
  | "connectivity"
  // Round 3 — Tier 4 decorative
  | "sunrise"
  | "island"
  | "palm"
  | "urgent"
  | "trophy"
  | "art"
  | "calendar"
  // Round 4 — UI affordances + content coverage
  | "check"
  | "warning"
  | "sun"
  | "thermometer"
  | "wind"
  | "search"
  | "handshake"
  | "shell"
  | "video"
  | "winter"
  | "storm"
  | "castle"
  | "hammer";

const svgBase = {
  viewBox: "0 0 64 64",
  xmlns: "http://www.w3.org/2000/svg",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
} as const;

// ═══════════════════════════════════════════════════════════════════
// ROUND 1 — Collie-approved
// ═══════════════════════════════════════════════════════════════════

function Eat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="7.5" y="10" width="2.5" height="15" />
      <rect x="12" y="10" width="2.5" height="15" />
      <rect x="16.5" y="10" width="2.5" height="15" />
      <path d="M7 23 h13 l-3 31 h-7 z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 16a16 16 0 100 32 16 16 0 000-32zm0 4a12 12 0 100 24 12 12 0 000-24zm0 3a9 9 0 110 18 9 9 0 010-18z"
      />
      <ellipse cx="51" cy="22" rx="6" ry="9" />
      <path d="M45.5 29 h11 l-2.5 25 h-6 z" />
    </svg>
  );
}

function Drink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M12 14 H52 L32 40 Z" />
      <rect x="30" y="40" width="4" height="11" />
      <rect x="18" y="51" width="28" height="3.5" rx="1.5" />
    </svg>
  );
}

function Stay(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="17" y="14" width="5" height="10" />
      <path d="M5 31 L32 10 L59 31 L54 35 L32 17 L10 35 Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 31 H51 V54 H13 Z M28 40 H36 V54 H28 Z"
      />
    </svg>
  );
}

function Do(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 34 C10 18, 28 14, 40 22 C48 28, 48 38, 40 40 C32 42, 30 34, 36 32 C32 30, 24 32, 20 40 C14 42, 8 40, 6 34 Z M37 34 C36 34, 36 36, 37 36 C38 36, 38 34, 37 34 Z"
      />
      <path d="M6 46 C14 42, 24 46, 32 48 C40 50, 50 48, 58 44 C54 52, 42 54, 32 52 C22 50, 12 50, 6 46 Z" />
    </svg>
  );
}

function Fish(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M8 52 L12 48 L44 14 L48 18 Z" />
      <circle cx="13" cy="49" r="3" />
      <rect x="11" y="53" width="4" height="5" rx="1" />
      <rect x="45.3" y="17" width="1.5" height="18" />
      <path
        d="M43 34 Q43 39 47 39 Q51 39 51 34"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36 44 C30 40, 30 54, 36 54 L48 54 L52 58 L52 46 L48 44 Z M40 48 a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4 z"
      />
    </svg>
  );
}

function Shop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M12 22 H42 L45 56 H9 Z" />
      <path
        d="M18 22 C18 14 36 14 36 22"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path d="M42 22 L52 26 L49 56 L45 56 Z" />
    </svg>
  );
}

function Beach(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <ellipse cx="32" cy="55" rx="24" ry="3" />
      <rect
        x="30.5"
        y="22"
        width="3"
        height="32"
        transform="rotate(4 32 38)"
      />
      <path d="M8 22 Q15 9 32 9 Q49 9 56 22 Q52 22 50 20 Q46 22 42 20 Q38 22 34 20 Q30 22 26 20 Q22 22 18 20 Q14 22 8 22 Z" />
      <circle cx="32" cy="9" r="1.8" />
    </svg>
  );
}

function Maintenance(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <g transform="rotate(-45 32 32)">
        <path d="M28 6 h8 v6 h-3 v6 h-10 v-6 h5 z" />
        <rect x="29" y="18" width="6" height="28" />
        <path d="M28 58 h8 v-6 h-3 v-6 h-10 v6 h5 z" />
      </g>
      <g transform="rotate(45 32 32)">
        <path d="M30 6 h4 l1.5 5 h-7 z" />
        <rect x="30" y="11" width="4" height="22" />
        <rect x="26.5" y="33" width="11" height="22" rx="3" />
      </g>
    </svg>
  );
}

function Cart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="8" y="14" width="48" height="5" rx="2" />
      <rect x="11" y="19" width="3" height="11" />
      <rect x="50" y="19" width="3" height="11" />
      <path d="M10 30 H54 L58 46 H6 Z" />
      <rect x="30" y="22" width="4" height="10" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 55a6 6 0 100-12 6 6 0 000 12zm0-3a3 3 0 110-6 3 3 0 010 6z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M46 55a6 6 0 100-12 6 6 0 000 12zm0-3a3 3 0 110-6 3 3 0 010 6z"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUND 2 — Tier 1 nav items (drafted in Collie's style, pending review)
// ═══════════════════════════════════════════════════════════════════

function Services(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="23" y="10" width="18" height="3" rx="1" />
      <rect x="23" y="10" width="3" height="8" />
      <rect x="38" y="10" width="3" height="8" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18 h52 v36 h-52 z M24 34 h16 v4 h-16 z"
      />
    </svg>
  );
}

function Events(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="8" y="12" width="3" height="10" rx="1" />
      <rect x="53" y="12" width="3" height="10" rx="1" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18 h52 v38 h-52 z M6 28 h52 v-6 h-52 z M14 34 h8 v7 h-8 z M28 34 h8 v7 h-8 z M42 34 h8 v7 h-8 z M14 45 h8 v7 h-8 z M28 45 h8 v7 h-8 z M42 45 h8 v7 h-8 z"
      />
      <rect x="6" y="18" width="52" height="6" />
    </svg>
  );
}

function Heritage(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M6 18 Q18 14 30 18 V50 Q18 46 6 50 Z" />
      <path d="M58 18 Q46 14 34 18 V50 Q46 46 58 50 Z" />
      <rect x="30" y="18" width="4" height="32" />
    </svg>
  );
}

function Dispatch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 8a24 24 0 100 48 24 24 0 000-48zm0 5a19 19 0 100 38 19 19 0 000-38z"
      />
      <path d="M32 16 L38 32 L32 48 L26 32 Z" />
    </svg>
  );
}

function Archives(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M4 24 L32 8 L60 24 Z" />
      <rect x="4" y="24" width="56" height="4" />
      <rect x="10" y="28" width="4" height="22" />
      <rect x="19" y="28" width="4" height="22" />
      <rect x="30" y="28" width="4" height="22" />
      <rect x="41" y="28" width="4" height="22" />
      <rect x="50" y="28" width="4" height="22" />
      <rect x="4" y="50" width="56" height="6" />
    </svg>
  );
}

function Guides(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="24" y="6" width="16" height="8" rx="2" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 12 h44 v48 h-44 z M18 26 h28 v3 h-28 z M18 34 h28 v3 h-28 z M18 42 h28 v3 h-28 z M18 50 h18 v3 h-18 z"
      />
    </svg>
  );
}

function Essentials(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M22 6 q0 -4 10 -4 q10 0 10 4 v6 h-20 z" />
      <rect x="7" y="18" width="5" height="20" rx="2" />
      <rect x="52" y="18" width="5" height="20" rx="2" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 14 h40 v44 h-40 z M22 28 h20 v14 h-20 z"
      />
    </svg>
  );
}

function Live(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="31" y="8" width="2" height="14" />
      <path d="M26 22 L38 22 L42 56 L22 56 Z" />
      <rect x="22" y="32" width="20" height="2.5" />
      <rect x="22" y="44" width="20" height="2.5" />
      <path
        d="M18 18 Q32 8 46 18"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M12 14 Q32 -2 52 14"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="32" cy="14" r="2" />
    </svg>
  );
}

function Map(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 4 Q14 4 14 24 Q14 38 32 60 Q50 38 50 24 Q50 4 32 4 Z M32 16 a7 7 0 100 14 7 7 0 000-14 z"
      />
    </svg>
  );
}

function Photos(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M22 14 h20 l4 6 h-28 z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18 h52 v34 h-52 z M32 24 a10 10 0 110 20 10 10 0 010-20 z"
      />
      <circle cx="32" cy="34" r="5" />
      <rect x="48" y="22" width="5" height="3" rx="1" />
    </svg>
  );
}

function MyTrip(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M32 54 C12 38 6 26 14 18 C22 10 30 14 32 22 C34 14 42 10 50 18 C58 26 52 38 32 54 Z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUND 2 — Tier 2 Gully search chips
// ═══════════════════════════════════════════════════════════════════

function Burger(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M6 26 Q6 14 32 14 Q58 14 58 26 Z" />
      <rect x="6" y="28" width="52" height="4" rx="1" />
      <path d="M6 34 Q12 38 18 34 Q24 38 30 34 Q36 38 42 34 Q48 38 54 34 Q58 35 58 36 V40 H6 Z" />
      <rect x="6" y="40" width="52" height="3" />
      <path d="M6 44 Q6 52 32 52 Q58 52 58 44 Z" />
    </svg>
  );
}

function HappyHour(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M16 10 Q32 2 48 10 L44 14 H20 Z" />
      <rect x="31" y="10" width="2" height="16" />
      <path d="M12 26 H52 L42 48 H22 Z" />
      <path
        d="M40 14 Q46 30 40 48"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <rect x="20" y="52" width="24" height="3" rx="1" />
    </svg>
  );
}

function Taco(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M4 24 Q32 10 60 24 L52 52 Q32 56 12 52 Z" />
      <path
        d="M10 22 Q18 16 26 22 Q32 16 38 22 Q46 16 54 22"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}

function Coffee(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        d="M18 6 Q20 12 18 16"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28 4 Q30 10 28 14"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M38 6 Q40 12 38 16"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M8 22 H46 V48 Q46 56 38 56 H16 Q8 56 8 48 Z" />
      <path
        d="M46 28 Q56 28 56 38 Q56 46 46 46"
        stroke="currentColor"
        strokeWidth="3.5"
        fill="none"
      />
    </svg>
  );
}

function Seafood(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <ellipse cx="32" cy="38" rx="18" ry="12" />
      <circle cx="25" cy="26" r="2.5" />
      <circle cx="39" cy="26" r="2.5" />
      <rect x="24" y="28" width="2" height="4" />
      <rect x="38" y="28" width="2" height="4" />
      <path d="M6 28 Q8 20 14 18 Q20 20 18 28 L14 28 L14 22 L10 22 L10 28 Z" />
      <path d="M58 28 Q56 20 50 18 Q44 20 46 28 L50 28 L50 22 L54 22 L54 28 Z" />
      <path d="M10 42 L16 46 L14 50 L8 46 Z" />
      <path d="M54 42 L48 46 L50 50 L56 46 Z" />
      <path d="M16 52 L22 50 L22 54 L16 56 Z" />
      <path d="M48 52 L42 50 L42 54 L48 56 Z" />
    </svg>
  );
}

function Sailing(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M32 8 L32 42 L14 42 Z" />
      <rect x="30" y="8" width="2" height="34" />
      <path d="M34 14 L34 42 L48 42 Z" />
      <path d="M6 44 H58 L50 54 H14 Z" />
      <path
        d="M4 56 Q16 52 28 56 Q40 60 52 56 Q60 54 60 56"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Surfing(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M14 16 Q10 12 14 8 Q18 4 30 10 L54 38 Q58 42 54 46 Q50 50 38 44 Z" />
      <path d="M44 44 L52 50 L48 54 L40 48 Z" />
      <path
        d="M22 22 L40 38"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 58 Q16 54 28 58 Q40 62 52 58 Q58 56 60 58"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function LateNight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M48 10 Q32 8 22 20 Q14 32 22 44 Q32 56 48 54 Q36 50 32 38 Q28 26 36 18 Q42 12 48 10 Z" />
    </svg>
  );
}

function Offshore(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M22 22 L42 22 L48 36 H16 Z" />
      <path d="M6 36 H54 L60 44 H2 Z" />
      <path
        d="M4 50 Q16 46 28 50 Q40 54 52 50 Q58 48 60 50"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 56 Q16 52 28 56 Q40 60 52 56 Q58 54 60 56"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUND 2 — Tier 3 Essentials section headers
// ═══════════════════════════════════════════════════════════════════

function Ferry(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="26" y="12" width="12" height="8" />
      <rect x="31" y="6" width="2" height="6" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 20 h40 v14 h-40 z M16 24 h5 v6 h-5 z M24 24 h5 v6 h-5 z M32 24 h5 v6 h-5 z M40 24 h5 v6 h-5 z"
      />
      <path d="M4 34 H60 L56 48 H8 Z" />
      <path
        d="M4 54 Q16 50 28 54 Q40 58 52 54 Q58 52 60 54"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Parking(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 8 h48 v48 h-48 z M22 18 h12 a8 8 0 010 16 h-6 v12 h-6 z M28 24 h6 a2 2 0 010 4 h-6 z"
      />
    </svg>
  );
}

function Weather(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="43" y="4" width="2" height="5" />
      <rect x="55" y="16" width="5" height="2" />
      <rect x="43" y="24" width="2" height="5" transform="rotate(-45 44 26)" />
      <rect x="32" y="16" width="5" height="2" transform="rotate(-90 34 17)" />
      <rect x="43" y="8" width="2" height="5" transform="rotate(45 44 10)" />
      <circle cx="44" cy="17" r="9" />
      <path d="M8 44 Q8 32 20 32 Q22 24 32 26 Q44 26 44 36 Q52 36 52 44 Q52 50 46 50 H14 Q8 50 8 44 Z" />
    </svg>
  );
}

function Wildlife(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M4 50 Q10 32 28 22 Q46 14 58 22 Q50 20 44 26 Q42 30 46 34 Q50 38 54 36 Q46 44 38 40 Q30 38 24 44 Q16 52 4 50 Z" />
      <path d="M28 22 L34 14 L38 22 Z" />
      <circle cx="50" cy="22" r="1.5" />
      <path
        d="M4 56 Q16 52 28 56 Q40 60 52 56 Q58 54 60 56"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Emergency(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="26" y="8" width="12" height="48" rx="2" />
      <rect x="8" y="26" width="48" height="12" rx="2" />
    </svg>
  );
}

function Connectivity(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        d="M14 14 Q32 4 50 14"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M20 20 Q32 14 44 20"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="32" cy="24" r="2" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 30 h24 v28 h-24 z M24 34 h16 v18 h-16 z"
      />
      <circle cx="32" cy="55" r="1.5" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUND 3 — Tier 4 decorative (sunrise/palm/urgent/trophy/art/calendar/island)
// ═══════════════════════════════════════════════════════════════════

function Sunrise(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="31" y="4" width="2" height="6" />
      <rect x="4" y="30" width="6" height="2" />
      <rect x="54" y="30" width="6" height="2" />
      <path d="M16 16 L20 20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M48 16 L44 20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M6 40 A26 26 0 0 1 58 40 Z" />
      <rect x="4" y="42" width="56" height="3" rx="1" />
      <path
        d="M4 52 Q16 48 28 52 Q40 56 52 52 Q58 50 60 52"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Island(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="30" y="22" width="4" height="26" />
      <path d="M32 22 Q16 14 10 20 Q22 18 32 26 Q42 18 54 20 Q48 14 32 22 Z" />
      <path d="M32 22 Q28 6 40 8 Q30 14 32 22 Z" />
      <ellipse cx="32" cy="50" rx="26" ry="4" />
      <path
        d="M4 58 Q16 54 28 58 Q40 62 52 58 Q58 56 60 58"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Palm(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M30 18 Q28 36 24 58 L32 58 L34 36 Q36 24 32 18 Z" />
      <path d="M32 20 Q14 10 6 18 Q20 16 32 24 Q44 16 58 18 Q50 10 32 20 Z" />
      <path d="M32 20 Q26 4 38 4 Q30 14 32 20 Z" />
      <rect x="29" y="30" width="6" height="1.5" />
      <rect x="28" y="40" width="6" height="1.5" />
      <rect x="27" y="50" width="8" height="1.5" />
    </svg>
  );
}

function Urgent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M38 4 L12 36 L28 36 L22 60 L50 28 L34 28 Z" />
    </svg>
  );
}

function Trophy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M18 8 H46 V18 Q46 32 36 36 Q34 38 34 42 V46 H30 V42 Q30 38 28 36 Q18 32 18 18 Z" />
      <path
        d="M18 14 Q8 14 8 22 Q8 30 16 30"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M46 14 Q56 14 56 22 Q56 30 48 30"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <rect x="24" y="46" width="16" height="4" />
      <rect x="20" y="50" width="24" height="8" rx="1" />
    </svg>
  );
}

function Art(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 8 C16 8, 6 20, 6 32 C6 44, 16 50, 24 46 C26 44, 30 44, 32 46 C34 48, 42 50, 48 44 C58 34, 58 14, 32 8 Z M42 22 a4 4 0 110 8 4 4 0 010-8 z M24 20 a3.5 3.5 0 110 7 3.5 3.5 0 010-7 z M16 30 a3.5 3.5 0 110 7 3.5 3.5 0 010-7 z M30 34 a3.5 3.5 0 110 7 3.5 3.5 0 010-7 z"
      />
    </svg>
  );
}

function Calendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="14" y="6" width="3" height="10" rx="1" />
      <rect x="47" y="6" width="3" height="10" rx="1" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12 h52 v48 h-52 z M10 26 h44 v30 h-44 z"
      />
      <rect x="22" y="32" width="20" height="20" rx="2" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUND 4 — UI affordances + broader content coverage
// ═══════════════════════════════════════════════════════════════════

function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M10 32 L24 46 L54 14 L48 8 L24 34 L16 26 Z" />
    </svg>
  );
}

function Warning(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 6 L58 56 H6 Z M30 24 h4 v18 h-4 z M30 46 h4 v6 h-4 z"
      />
    </svg>
  );
}

function Sun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <circle cx="32" cy="32" r="11" />
      <rect x="31" y="4" width="2" height="8" />
      <rect x="31" y="52" width="2" height="8" />
      <rect x="4" y="31" width="8" height="2" />
      <rect x="52" y="31" width="8" height="2" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(45 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(90 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(135 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(180 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(225 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(270 32 32)" />
      <rect x="31" y="4" width="2" height="8" transform="rotate(315 32 32)" />
    </svg>
  );
}

function Thermometer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26 10 q0 -4 6 -4 q6 0 6 4 v32 a10 10 0 1 1 -12 0 z M30 14 h4 v28 h-4 z"
      />
      <circle cx="32" cy="48" r="7" />
    </svg>
  );
}

function Wind(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        d="M4 20 Q18 14 36 16 Q48 18 52 24"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M4 34 Q16 28 40 32 Q54 34 58 40"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M4 48 Q16 42 32 46 Q46 48 50 54"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Search(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26 6 a20 20 0 100 40 20 20 0 000-40 z m0 6 a14 14 0 110 28 14 14 0 010-28 z"
      />
      <rect
        x="38"
        y="38"
        width="22"
        height="6"
        rx="3"
        transform="rotate(45 49 41)"
      />
    </svg>
  );
}

function Handshake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M4 26 L18 22 L24 28 L32 26 L40 28 L46 22 L60 26 L60 36 L46 40 L40 46 L32 44 L24 46 L18 40 L4 36 Z" />
      <rect x="4" y="38" width="14" height="4" />
      <rect x="46" y="38" width="14" height="4" />
    </svg>
  );
}

function Shell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M32 8 Q12 14 8 34 Q6 48 20 54 Q26 56 32 52 L28 44 L22 40 L22 32 L28 26 L32 22 L34 28 L34 36 L38 40 L36 48 L32 52 Q52 52 54 32 Q56 14 32 8 Z" />
    </svg>
  );
}

function Video(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="6" y="20" width="34" height="24" rx="3" />
      <path d="M40 28 L56 18 V46 L40 36 Z" />
      <circle cx="14" cy="26" r="2" />
    </svg>
  );
}

function Winter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="30" y="6" width="4" height="52" rx="1" />
      <rect x="6" y="30" width="52" height="4" rx="1" />
      <rect x="30" y="6" width="4" height="52" rx="1" transform="rotate(45 32 32)" />
      <rect x="30" y="6" width="4" height="52" rx="1" transform="rotate(-45 32 32)" />
      <path d="M26 10 L32 14 L38 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M26 54 L32 50 L38 54" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 26 L14 32 L10 38" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M54 26 L50 32 L54 38" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Storm(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M8 26 Q8 16 18 16 Q22 8 32 10 Q44 10 44 20 Q52 20 52 28 Q52 34 46 34 H14 Q8 34 8 26 Z" />
      <path d="M28 36 L20 52 L28 52 L22 62 L40 44 L32 44 L36 36 Z" />
    </svg>
  );
}

function Castle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 26 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v-6 h4 v-4 h4 v4 h4 v6 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v4 h4 v34 h-52 z M28 42 h8 v16 h-8 z"
      />
    </svg>
  );
}

function Hammer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M10 10 h28 v10 h-6 v4 h-16 v-4 h-6 z" />
      <rect x="22" y="20" width="8" height="40" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Icon registry + component
// ═══════════════════════════════════════════════════════════════════

const icons: Record<
  PortalIconName,
  (p: SVGProps<SVGSVGElement>) => ReactElement
> = {
  eat: Eat,
  drink: Drink,
  stay: Stay,
  do: Do,
  fish: Fish,
  shop: Shop,
  beach: Beach,
  maintenance: Maintenance,
  cart: Cart,
  services: Services,
  events: Events,
  heritage: Heritage,
  dispatch: Dispatch,
  archives: Archives,
  guides: Guides,
  essentials: Essentials,
  live: Live,
  map: Map,
  photos: Photos,
  mytrip: MyTrip,
  burger: Burger,
  happyhour: HappyHour,
  taco: Taco,
  coffee: Coffee,
  seafood: Seafood,
  sailing: Sailing,
  surfing: Surfing,
  latenight: LateNight,
  offshore: Offshore,
  ferry: Ferry,
  parking: Parking,
  weather: Weather,
  wildlife: Wildlife,
  emergency: Emergency,
  connectivity: Connectivity,
  sunrise: Sunrise,
  island: Island,
  palm: Palm,
  urgent: Urgent,
  trophy: Trophy,
  art: Art,
  calendar: Calendar,
  check: Check,
  warning: Warning,
  sun: Sun,
  thermometer: Thermometer,
  wind: Wind,
  search: Search,
  handshake: Handshake,
  shell: Shell,
  video: Video,
  winter: Winter,
  storm: Storm,
  castle: Castle,
  hammer: Hammer,
};

/**
 * Emoji → PortalIcon name lookup. Used by data-driven renders where the icon
 * is stored as an emoji string (guides.ts, stories.ts, events data, etc.).
 * Unmapped emojis fall back to the raw emoji span.
 */
export const emojiToIconName: Record<string, PortalIconName> = {
  // Directory categories + portals (Round 1)
  "🍽️": "eat",
  "🍺": "drink",
  "🏠": "stay",
  "🌊": "do",
  "🎣": "fish",
  "🛍️": "shop",
  "🏖️": "beach",
  "🔧": "maintenance",
  "🛺": "cart",
  // Nav items (Round 2 Tier 1)
  "🛠️": "services",
  "🎪": "events",
  "📖": "heritage",
  "🧭": "dispatch",
  "🏛️": "archives",
  "📋": "guides",
  "📡": "live",
  "🗺️": "map",
  "📸": "photos",
  "❤️": "mytrip",
  // Gully chips (Round 2 Tier 2)
  "🍔": "burger",
  "🍹": "happyhour",
  "🌮": "taco",
  "☕": "coffee",
  "🦞": "seafood",
  "⛵": "sailing",
  "🏄": "surfing",
  "🌙": "latenight",
  "🚤": "offshore",
  // Essentials sections (Round 2 Tier 3)
  "⛴️": "ferry",
  "🅿️": "parking",
  "🐬": "wildlife",
  "🏥": "emergency",
  "📱": "connectivity",
  // Tier 4 decorative (Round 3)
  "🌅": "sunrise",
  "🏝️": "island",
  "🌴": "palm",
  "⚡": "urgent",
  "🏆": "trophy",
  "🎨": "art",
  "📅": "calendar",
  // Round 4 — UI affordances
  "✅": "check",
  "✓": "check",
  "⚠️": "warning",
  "☀️": "sun",
  "🌡️": "thermometer",
  "💨": "wind",
  "🌬️": "wind",
  "🔍": "search",
  "🤝": "handshake",
  "🤙": "handshake",
  "🐚": "shell",
  "📹": "video",
  "❄️": "winter",
  "🌀": "storm",
  "⛈️": "storm",
  "🏰": "castle",
  "🔨": "hammer",
  // Round 4 — aliases to existing icons (no new design)
  "🏨": "stay",
  "🏘️": "stay",
  "🏕️": "stay",
  "🛣️": "map",
  "📍": "map",
  "🛥️": "offshore",
  "🪨": "fish",
  "🛶": "fish",
  "🐟": "fish",
  "🦅": "wildlife",
  "🎵": "art",
  "🌿": "palm",
  "🪵": "palm",
  "🏮": "sunrise",
  "📜": "guides",
  "🌸": "sun",
  "🍂": "palm",
  "🎆": "urgent",
  "🎭": "art",
  "🪁": "sailing",
};

/**
 * EmojiIcon — renders a PortalIcon if the emoji has a mapped silhouette,
 * otherwise falls back to rendering the raw emoji in a span. Use this
 * wherever the icon value comes from data (data file, CMS, etc.) rather
 * than being known statically at the call site.
 */
export function EmojiIcon({
  emoji,
  className,
}: {
  emoji: string;
  className?: string;
}) {
  const name = emojiToIconName[emoji];
  if (name) {
    return <PortalIcon name={name} className={className} />;
  }
  return (
    <span className={className} aria-hidden>
      {emoji}
    </span>
  );
}

export interface PortalIconProps extends SVGProps<SVGSVGElement> {
  name: PortalIconName;
}

export default function PortalIcon({ name, ...props }: PortalIconProps) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
