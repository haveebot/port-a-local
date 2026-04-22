import type { ReactElement, SVGProps } from "react";

/**
 * PortalIcon — single-color silhouette icons for PAL directory categories + portals.
 *
 * All icons use `currentColor`, so consumers set color via Tailwind text-* classes.
 * Per Collie's brand rule: coral on navy backgrounds (text-coral-400), navy on
 * white/sand backgrounds (text-navy-900).
 */

export type PortalIconName =
  | "eat"
  | "drink"
  | "stay"
  | "do"
  | "fish"
  | "shop"
  | "beach"
  | "maintenance"
  | "cart";

const svgBase = {
  viewBox: "0 0 64 64",
  xmlns: "http://www.w3.org/2000/svg",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
} as const;

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
      {/* Rod */}
      <path d="M8 52 L12 48 L44 14 L48 18 Z" />
      {/* Reel */}
      <circle cx="13" cy="49" r="3" />
      <rect x="11" y="53" width="4" height="5" rx="1" />
      {/* Line */}
      <rect x="45.3" y="17" width="1.5" height="18" />
      {/* Hook */}
      <path
        d="M43 34 Q43 39 47 39 Q51 39 51 34"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Fish */}
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
      {/* Canopy */}
      <rect x="8" y="14" width="48" height="5" rx="2" />
      {/* Posts */}
      <rect x="11" y="19" width="3" height="11" />
      <rect x="50" y="19" width="3" height="11" />
      {/* Body */}
      <path d="M10 30 H54 L58 46 H6 Z" />
      {/* Seat back */}
      <rect x="30" y="22" width="4" height="10" />
      {/* Wheels (rings) */}
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
};

export interface PortalIconProps extends SVGProps<SVGSVGElement> {
  name: PortalIconName;
}

export default function PortalIcon({ name, ...props }: PortalIconProps) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
