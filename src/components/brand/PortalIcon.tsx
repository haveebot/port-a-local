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
// Replaced 2026-04-24 with Collie's Illustrator SVGs (uid 156) — original
// Canva Round 1 had distortion at small sizes. These are the authoritative
// directory + portal icons. ViewBox: 0 0 128 128. Fill: currentColor.
// ═══════════════════════════════════════════════════════════════════

function Eat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M108.49,100.98c-1.44,0-2.41-.84-2.41-2.2v-44.68c-5.03-1.42-8.24-6.28-9.02-11.32l-.12-1.63.17-1.96c.58-4,2.49-7.57,5.62-10.07,1.92-1.53,4.18-2.3,6.65-2.06,2.62.26,4.75,1.71,6.51,3.63,2.18,2.39,3.51,5.41,3.92,8.65l.05,3.27c-.7,4.98-4.11,10.15-9.03,11.43l-.02,45.04c0,1.21-1.27,1.88-2.33,1.88Z" />
      <path d="M24.37,49.9c-.31,1.73-1.54,2.76-3.18,3l-2.4.06-.02,45.98c0,1.3-1.36,1.89-2.46,1.88-1.16-.02-2.4-.87-2.4-2.29l-.04-45.56-2.62-.07c-1.27-.03-3.04-1.23-3.04-2.78l-.06-22.05c0-.7,1.05-1.02,1.53-1.01.63.02,1.39.57,1.39,1.32l.07,16.17c0,.75,1.14,1.29,1.69,1.31.64.03,1.81-.47,1.82-1.3l.08-16.32c0-.85,1.06-1.26,1.67-1.21.76.06,1.35.68,1.35,1.6l.12,16.05c0,.8,1.26,1.13,1.81,1.08s1.68-.38,1.68-1.21l.03-15.68c0-.84.3-1.45,1.02-1.75.52-.22,1.89-.05,1.9.83l.07,21.95Z" />
      <path d="M95.03,64c0,18.29-14.83,33.11-33.13,33.11s-33.13-14.82-33.13-33.11,14.83-33.11,33.13-33.11,33.13,14.82,33.13,33.11ZM88.92,63.99c0-14.92-12.1-27.01-27.03-27.01s-27.03,12.09-27.03,27.01,12.1,27.01,27.03,27.01,27.03-12.09,27.03-27.01Z" />
      <ellipse cx="61.9" cy="64" rx="24.24" ry="24.23" />
    </svg>
  );
}

function Drink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M74.14,111.96l-3.01.24-14-.02c-3.1,0-13.07-1.17-13.46-2.33-.23-.67.74-1.45,1.51-1.6l10.99-2.17c1.43-.28,2.7-.8,3.59-2.01,1.27-1.75,2.07-3.83,2.14-6.05l.19-5.84.02-22.6-.25-4.32-.15-3.76c-.09-2.19-.63-4.22-2.04-6.04L31.69,19.28c-.2-.26-.22-.56-.18-.74.13-.61,4.68-1.37,6.77-1.55l2.27-.2c1.34-.12,2.59-.03,3.91-.22,1.07-.16,2.14.1,3.2-.13l4.14-.19,4.49-.22,4.36-.17c1.55-.06,3.15-.06,4.71,0l5.18.18,5.15.2,5.31.23,3.84.13c1.05.04,2.05.05,3.09.19l6.7.91c.56.08,1.79.28,1.88.92.06.67-.64,1.39-1.09,1.97l-25.47,32.93c-1.61,2.08-3.26,3.9-3.4,6.73l-.21,1.82-.13,6.09-.21,7.6-.03,16.24.21,4.95c.09,2.14.37,4.06,1.47,5.97.72,1.24,1.75,2.59,3.26,2.88l7.44,1.42c2.19.42,5.95,1,6.07,2.1.03.24-.14.81-.48.92-3.15,1.01-6.4,1.48-9.81,1.74ZM77.36,20.15l4.73-.21,3.16-.15,2.26-.2c1.73-.15,3.35-.24,5.2-.75-.89-.61-1.96-.32-2.92-.48-1.07-.19-2.05-.15-3.12-.21l-3.5-.21c-1.18-.07-2.29-.18-3.51-.19-1.08-.01-2.14-.33-3.27-.16-.86.13-1.65-.19-2.5-.19h-21.97c-.85,0-1.64.32-2.5.2-1.13-.17-2.19.12-3.28.16-1.16.04-2.19.09-3.32.18l-2.86.22-4.57.53c1.35.58,2.81.69,4.33.81l2.27.18c2.07.17,5.53.5,6.6.35,1.01-.14,1.9.22,2.9.22l25.88-.09ZM71.25,48.33l8.05-10.06.84-1.08.82-1.03c1.03-1.3,2.03-2.59,3.05-3.85l.94-1.17,3.86-4.77-.3-.29-13.5,15.84c-2.34,2.75-4.58,5.23-7.54,7.31-2.05,1.44-4.49,1.44-6.66.16-1.77-1.05-3.1-2.45-4.5-3.95l-2.88-3.08-1.95-2.19-11.74-13.87c-.08.1-.15.18-.29.27l17.82,22.37c1.37,1.72,4.83,2.65,7.38,2.63s4.9-1.11,6.6-3.23Z" />
      <path d="M65.83,53.09c10.91-6.47,16.29-18.4,24.87-27.26,2.24-2.31-1.29-5.85-3.54-3.54-8.21,8.48-13.44,20.29-23.86,26.47-2.77,1.64-.25,5.96,2.52,4.32h0Z" />
      <path d="M63.44,48.7c-3.67-4.86-7.35-9.72-11.02-14.58l-5.36-7.09c-1.6-2.11-3.47-4.63-6.46-4.37-1.65.14-3.43,2.11-2.16,3.76,7.26,9.45,14.24,19.1,20.95,28.95,1.8,2.64,6.14.15,4.32-2.52-6.71-9.85-13.69-19.5-20.95-28.95l-2.16,3.76c.68-.06,1.07.55,1.48,1.04.81.97,1.53,2.01,2.29,3.02l4.91,6.5,9.83,13c.81,1.08,2.16,1.64,3.42.9,1.06-.62,1.72-2.34.9-3.42h0Z" />
    </svg>
  );
}

function Stay(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M72.3,87.44l-16.52.02c-.95,0-1.79.84-1.8,1.8v17.88s-20.18-.01-20.18-.01c-1.05-.2-1.7-.74-1.85-1.83v-40.69s32.06-28.35,32.06-28.35l32.05,28.34v40.85c-.27,1.02-.87,1.48-1.87,1.68h-20.17s-.01-17.86-.01-17.86c0-.96-.74-1.64-1.71-1.82Z" />
      <path d="M66.17,32.47c-.85-.72-1.43-1.26-2.12-1.95l-40.74,36.06-4.97-5.55L63.26,21.27c.28-.22.43-.38.66-.4.31-.03.5.14.82.4l44.92,39.76-4.95,5.56-38.54-34.12Z" />
      <path d="M39.8,36.95l-2.05,1.89-1.79,1.61c-1.25,1.12-2.56,2.45-3.99,3.5l-.02-17.34h11.64s.02,6.82.02,6.82c-.62.76-1.31,1.43-2.14,1.97-.43.67-1.1,1.06-1.66,1.57Z" />
    </svg>
  );
}

function Do(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <g>
        <path d="M79.31,86.39c.88-.32,1.39-.93,1.67-1.78.56-1.72.92-3.47,1.14-5.27-1.64,2.74-.9,5.28-4.17,6.19l-2.5.69.32-1.99c.3-1.91,1.58-3.53,3.47-4.23.32-1.93.74-3.74,1.57-5.69,1.39,2.64,3.51,4.6,6.46,5.16,2.51.48,5.22-.45,6.83-2.4-1.72.49-3.01,1.37-4.62,1.24-3.81.46-6.81-2.16-8.01-5.7,1.31-2.62,2.77-5.14,4.75-7.3l1.39-1.51.13,2.66,2.02-2.46c5.59,3.78,8.94,9.22,9.62,15.81v4.53c-.32,3.74-1.5,7.15-3.24,10.43l-2.1,3.97c-1.19,2.25-1.95,4.53-2.4,7.03-.2,1.14-1.42,1.63-2.41,1.6s-1.98-.69-2.24-1.8c-.77-3.28-.68-4.11-3.65-6.13-.98-.67-2.07-.93-3.29-.8-.02-2.06.25-4.01,1.11-5.85-.9-2.1-1.44-4.16-1.81-6.39ZM90.18,72.5c.53.92,1.44,1.11,2.27.7.6-.3.96-1.35.66-1.96-.37-.75-1.14-1.11-2.05-.88-.84.21-1.33,1.34-.87,2.14ZM94.99,85.92c-.18,3.17-1.31,5.92-2.11,8.85,3.37-4.67,4.22-10.45,3.01-15.9l-1.26.39c.41.87.23,1.88.41,2.78.26,1.31.04,2.44-.04,3.88Z" />
        <path d="M98.31,117.18c-2.28-2.15-6.48-2.35-8.71-4.32-2.47,2.09-5.52,1.98-8.45,4.33l-1.64,1.57.02-2.68c.4-2.5,1.65-4.63,3.12-6.63l2.95-4.02c.42,1.34,1.08,2.34,2.08,2.81,1.28.6,2.77.54,3.76-.28.82-.68,1.28-1.37,1.62-2.49l3.7,4.55c1.81,2.23,3.58,5.85,3.11,8.64l-1.56-1.47Z" />
        <path d="M99.08,95.32c-.77,1.35-1.77,2.41-3.28,2.81l2.09-4.08c1.53-2.98,2.39-6.14,2.75-9.5l.15-4.4c2.44,2.92,5.11,5.95,2.65,8.78-1.71,1.97-3.04,4.07-4.36,6.39Z" />
      </g>
      <g>
        <g>
          <path d="M43.67,80.35c1.44,1.9,1.86,5.4,1.17,5.62-.48.16-2.23-1.05-3.78-1.39l-.82-1.55c-.39-.74-1.48-1.13-2.32-1.06-1.18.1-2,1.01-2.3,1.94-.35,1.1.14,2.21.98,2.86.94.73,2.11.7,3.2.07l4.1,1.66c-1.08,1.76-2.93,2.86-4.98,3.03-2.47.2-4.65-.65-6.22-2.58-2.03-2.49-1.95-6.21.07-8.68,2.6-3.04,7.03-3.29,9.99-.85.93-3.89,1.87-7.61,2.19-11.57.09-1.14.36-2.23.09-3.35-.33-.43-1.24-.63-1.85-.56l-3.32,10.37-2.77-.62c.04-1.6.64-2.9,1.16-4.38,2.28-6.51,4.54-12.91,7.55-19.12l2.45-5.05c2.72-5.62,5.88-10.84,9.4-16.02s7.56-10.24,11.93-14.93l4.44-4.48c.37-.37,1.18-.67,1.56-.27.41.42.17,1.18-.26,1.56,1.52,1.23,3.01,2.28,3.43,4.05l8.35,35.58c-.29.21-.72.36-1.19.25l-8.45-35.81c-.25-1.06-1.24-1.7-1.86-2.45-1.22,2.22-2.5,4.11-4.23,5.84l-3.63,3.64c-.48.48-.98.76-1.23,1.48-.63,1.84-1.48,3.56-2.68,5.13l-2.93,3.81c-.84,1.09-1.79,1.88-2.07,3.31-.35,1.83-1.6,4.07-2.48,5.86-1.07,2.17-2.41,4.03-3.81,5.99l-.93,4.04c-1.06,3.46-2.3,6.73-3.94,9.94-.45.88-1.38,1.66-1.41,2.64l-.12,3.67c-.46,4.2-1.28,8.22-2.48,12.37ZM66.69,21.59c3.11-2.86,5.69-6.09,8.1-9.63-.98-.11-1.26.85-1.76,1.35-.72.72-1.31,1.41-1.97,2.14l-1.11,1.22c-1.3,1.44-2.63,2.83-3.67,4.53-.12.2.21.52.41.38ZM58.85,33.07c2.76-3.1,5-6.37,6.87-9.95.11-.22.04-.37-.01-.49-.05-.09-.32-.29-.42-.15l-2.75,3.68c-1.58,2.11-3.08,4.18-4.35,6.49-.09.16.45.67.66.43ZM52.03,46.55c1.64-2.31,2.79-4.68,4.02-7.13.83-1.65,1.71-3.27,2.25-5.05.01-.25-.75-.51-.94-.24-2.02,2.88-3.6,5.9-5.24,8.99-.52.97-1.17,1.96-1.41,3.03-.05.36,1.05.78,1.33.39ZM45.5,63.19c2.78-4.8,4.58-10.04,5.88-15.21l-1.22-.59c-.27.27-.45.53-.61.88-1.82,4.01-3.54,7.98-5.12,12.1-.3.79-.56,1.46-.72,2.26l1.79.56Z" />
          <path d="M89.67,61.18c-1.02-.29-2.01-1.72-1.79-2.48.08-.26.4-.37.77-.31.75.12.5,1.62,1.8,1.63.6,0,1.12-.46,1.28-1.19.18-.82-.52-1.56-1.21-2.01l-4.74-3.1c-.6-.39-.19-1.63.29-1.96.64-.45,1.52-.44,2.15.13.55.5.7,1.34.13,2.1l3.12,2.06c.81.53,1.4,1.31,1.49,2.21s-.26,2.07-1.08,2.52c-.72.39-1.42.64-2.21.41Z" />
          <path d="M37.09,77.05l-1.79.44.68-2.6c.07-.26.28-.48.43-.57.35-.2,2.79.59,3.38,1.04.41.31.19,1.39-.16,1.79-.94-.26-1.68-.32-2.55-.1Z" />
        </g>
        <g>
          <path d="M29.75,116.41c-.89,1.66-2.72,1.97-4.25,1.33-1.78-.75-2.28-2.36-1.67-4.07,1.21-3.41,1.78-6.86,2.64-10.38s1.5-6.99,2.85-10.35c.32-.8,1.81-.58,2.43-.38,1.17.38,2.39.41,3.37,1.14.31.23.31,1.12.2,1.56l-5.57,21.15Z" />
          <path d="M46.57,90.71c-.72-.6-1.03-1.38-.87-2.31l-6.22-2.32c-.36-.13-.27-.68-.07-.91.26-.31.53-.28.95-.12l5.66,2.16c.68-1.07,1.81-1.56,2.97-1.28s2.03,1.26,2.17,2.6c.11,1.06-.67,2.03-1.48,2.46-1.01.53-2.22.45-3.1-.29Z" />
          <path d="M31.93,89.23c1.27,1.69,3,1.96,2.63,2.83-.13.32-.42.44-.82.35l-2.56-.61c.14-1.01.3-1.72.74-2.56Z" />
        </g>
      </g>
    </svg>
  );
}

function Fish(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M111.9,83.69c-4.29-1.33-8.27-3.28-10.65-6.22-.95-.82-1.81-1.71-2.55-2.67-2.47-1.68-5.15-2.37-8.13-2.33-.83.48-1.65,1-2.46,1.55l-4.52,3.08c-2.81,1.92-5.82,3.02-9.17,3.23l-2.93.02c-6.36-.68-13.78-3.23-18.57-7.5-8.52-7.61-6.74-19.82,1.24-27.12,2.54-2.33,7.35-4.96,10.49-4.97h3.68c2.03.15,3.87.83,5.67,1.57-.46.27-.87-.06-1.27-.06l-4.65.04c-1.64.01-3.14.45-4.71.91-2.83.84-5.39,2.18-7.57,4.15-3.56,3.23-5.82,7.56-6.07,12.37-.2,3.81.97,7.31,3.53,10.12,1.9,2.09,4.21,3.73,6.83,4.87,6.05,2.65,14.1,4.94,20.16,1.44-1.84-.73-3.53-1.08-5.17-1.87-2.38-1.14-4.54-2.56-6.24-4.56-4.27-5.01-4.7-12.29-.39-17.08,2.19-2.44,4.78-4.01,8.11-4.24,4.87-.54,9.71,1.78,13.37,5.28.14-3.97-1.56-7.68-4.21-10.69-2.97-3.38-6.81-5.69-11.12-7.01-2.11-.65-4.18-1.1-6.39-1.25l-1.74-.12h-4.8c-5.26.43-10.24,1.79-15,4.05-4.22,2.01-7.97,4.53-11.3,7.77l-1.91,1.86c-.48.47-.88.96-1.34,1.48-2.27,2.51-4.04,5.31-5.93,8.13l-2.52,3.76c-1.73,2.58-3.52,5.04-5.63,7.33-.76.96-1.57,1.74-2.47,2.56-1.75,1.58-3.49,3.08-5.56,4.21l.03,12.09.16,1.27,1.23-.82c9.01-6.88,20.32-12.55,31.83-11.93,3.43.19,6.65.81,9.9,1.85,3.26,1.03,6.23,2.45,9.39,3.73l8.14,3.28c4.36,1.54,8.75,2.49,13.39,2.85l9.44.08,1.73-.16c.51.09,2.92-.15,4.39-.26l2.03-.15,1.87-.16,2.35-.15h3.6s2.03.16,2.03.16l2.2.14c1.39.09,2.66.16,4.06-.01.07,0,.13-.02.2-.03.09-.49.17-.97.2-1.43-2.11-.82-4.2-1.58-6.28-2.45Z" />
      <path d="M73.16,93.16l-1.22-.12c-4.16-.39-8.16-1.14-12.21-2.13l-6.56-1.61c-3.92-.96-7.81-1.66-11.85-1.88l-1.91-.1c-1-.05-2.08-.05-3.08,0l-1.92.1c-5.66.29-11.12,1.47-16.54,3.14l-8.04,2.31c7.06-6.63,18.07-12.76,27.56-13.86l1.27-.15,5.89.04c5.72.5,10.93,2.5,16.13,4.81,8.58,3.81,15.21,6.42,24.8,6.93l6.84.05c.96,0,1.91-.36,2.84-.03-4.22,1.38-8.41,2.12-12.73,2.5l-2.74.1c-1.08.04-2.14.17-3.22,0l-3.28-.1Z" />
    </svg>
  );
}

function Shop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M94.26,103.25c-.45,5.08-5.33,6.15-9.93,6.44l-3.05.19-16.47-.02-29.77-.17c-2.64-.02-5.1-.38-7.54-1.16-4.81-1.55-5.12-6.05-4.64-10.82l1.97-19.48,1.61-14.89,1.83-15.16c.19-1.56.41-3.02.81-4.49.59-2.18,2.26-3.5,4.53-3.51l6.78-.06.5-4.86c.5-4.82,1.61-8.86,5.21-12.33,2.84-2.75,6.61-4.18,10.51-4.7,1.56-.21,3.15-.11,4.69,0,1.8.13,3.39.79,4.97,1.57,6.58,3.22,9.13,9.44,9.74,16.49l.06,4.15c.93.16,1.77-.12,2.66-.11l3.46.05c2.17.03,5.76.74,6.18,2.52.62,2.63.94,5.26,1.26,7.95l.55,4.6,1.71,16.74.22,2.46,1.65,18.28.19,2.3.18,2.12.16,1.97-.02,3.91ZM67.92,40.15c.84,0,1.62.26,2.5.18.52-.05,1.02.29,1.6.13.82-6.9-1.03-13.71-7.38-17.08-5.14-2.73-11.38-1.68-15.61,2.31-2.69,2.54-4.06,6.01-4.45,9.69l-.07,4.93,10.73-.1,12.69-.07ZM46.61,46.95c-.52-.41-1.7-.37-2.02.07l-.36,2.39c-.1.67-.58,1.12-1.06,1.19-1.3.18-2.56-1.17-2.56-2.31v-2.28c-.67.2-1.21.47-1.78.85-.91.61-1.29,1.76-.83,2.84.84,2,2.73,3.44,4.9,3.74,1.34.19,2.58-.45,3.25-1.6.77-1.33,1.55-4.03.47-4.89ZM75.93,46.14l-.12,3.5c-.03.81-1.12,1.17-1.78,1.17-.59,0-1.73-.25-1.76-.99l-.16-3.87c-.98-.05-1.45.65-2.02,1.13-.77.65-1.16,1.46-.76,2.48.78,1.96,1.99,4.2,4.14,4.14,2.37-.07,4.55-2.01,5.07-4.3.4-1.75-.82-2.98-2.61-3.25Z" />
      <path d="M99.22,106.08c-.99.11-1.93-.44-1.83-1.42l.17-1.6c.14-1.37.1-2.57,0-3.91l-.18-2.69-2.43-24.51-2.5-26-.06-3.35c0-.43.32-.82.54-1,1.32-1.11,4.31,1.4,4.88,3.52l1.39,8.23,2.39,17.09,3.62,27.24c.34,2.58-.22,4.84-2.23,6.57-1.02.88-2.22,1.64-3.75,1.81Z" />
    </svg>
  );
}

function Beach(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M29.89,108.48c-.28,0-.24-.34-.18-.41.08-.1.19-.11.42-.19,6.02-2.31,12.26-3.77,18.71-4.24l2.12-.25,10.42-56.34-2.27-1.42c-.75-.47-1.83-.76-2.77-.54-3.83.89-7.5.11-10.69-2.1-1.29-.9-2.79-1.09-4.26-1.11-.7-.01-.93.24-1.49.41-2.48.76-5.24.07-7.41-1.28-.9-.56-1.81-1.16-2.83-1.15l-3.6.03c-1.85-.21-3.4-1.32-4.72-2.56-.24-.22-.27-.49-.39-.81-.97.8-1.93.43-2.62-.37-.77-.88-.62-1.99-.52-3.11.06-.69.03-1.21.76-1.63,3.38-1.92,6.85-3.36,10.6-4.54,7.69-2.43,15.5-4.04,23.53-4.7l2.16-.18c.91-.07,1.76-.14,2.66-.17l3.6-.11,4-.15c.22-1.06.92-2.05,2.05-2.05.88,0,1.46.96,1.47,1.78,0,.65.23.89.77,1.11l7.68,2.99c10.96,4.28,25.2,12.66,32.7,21.69.44.53.65,1.05.41,1.74l-.64,1.83c-.25.71-.82,1.1-1.35,1.28-.78.27-1.44.11-2.13-.35-2.21,1.63-5.04,1.43-7.53.24-1.33-.64-2.6-.76-4.07-.4-2.81.69-5.9.4-8.1-1.58-.44-.4-.38-.55-1.05-.66-1.72-.27-3.29-.08-5,.23-3.28.58-6.54-.32-9.42-1.91-3.11-1.72-6.35-.53-6.46.05l-10.35,55.91,5.57.07,1.54.13c6.86.56,13.5,2.04,20,4.25.17.06.28.08.37.07.13,0,.14.5.02.5H29.89Z" />
    </svg>
  );
}

function Maintenance(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path d="M31.32,107.55c-5.72.34-12.18-6.08-11.97-11.79l18.41-18.4c3.36-.21,7.07-2.14,9.17-4.72,1.25-1.5,1.91-3.31,1.88-5.27l2.32-2.34,4.53,2.8,32.2-32.18,1.21-4.62,11.2-7.82,3.48,3.47-7.88,11.27-4.41,1.12-32.3,32.28,2.74,4.44-2.31,2.35c-5.69-.14-9.6,5.9-10.07,11.23l-18.19,18.18Z" />
      <path d="M99.81,105.39l-3.15-.05c-4.38-.06-10.1-1.17-13.54-4.03-1.42-1.18-2.39-2.74-3.03-4.48-1.52-4.11-.78-7.46-1.31-8.9-.63-1.72-1.76-3.08-2.91-4.43l-2.08-2.44-1.6-1.76-3.7-3.83-5.17-5.28,9-9.02,3.54,3.44,4.51,4.35c1.78,1.72,6.75,6.07,8.4,6.12,2.59.07,5.07.25,7.56.99,6.29,1.86,10.12,6.47,12.19,12.57.31.61-.03,1.31-.52,1.74l-11.66-6.68c-4.66,2.46-7.27,7.21-7.15,12.61l11.69,6.7-1.08,2.38Z" />
      <path d="M52.83,59.81l-3.22-3.07c-1.92-1.83-6.67-5.99-8.7-5.98-10.01.04-16.32-4.64-19.44-14.03l.66-1.24,11.75,6.73c4.29-2.5,6.61-6.05,7.08-11.01.05-.57.25-1.09.06-1.64l-11.74-6.69,1.14-2.37c1.07-.18,2.07.05,3.12.1,5.84.26,12.74,1.38,15.77,6.7,1.34,2.35,1.7,4.96,1.92,7.63.07.83-.07,1.77.12,2.58.39,1.68,1.52,3.07,2.62,4.35l3.48,4.05,1.52,1.66,4.02,4.16,2.82,2.93-8.99,9.03-3.99-3.88Z" />
    </svg>
  );
}

function Cart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase} viewBox="0 0 128 128" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M51.57,68.39c1.36.02,7.12-.14,7.92.14,1.68.58,2.35,2.93,2.96,4.91h-10.04s-.84-5.06-.84-5.06ZM44.56,34.71h37.98s9.79,29.33,9.79,29.33c-3.55-.19-4.19-.7-4.54,3.11-.68-.32-.87-.68-1.4-1.08l-8.67-7.6c.29-.44.69-.92,1.02-1.39.49-.7,1.81-2.25,1.9-2.76.18-.99-1.06-2.35-2.38-.54l-2.98,3.94c-.64.89-1.31,1.74-2,2.66-.43.57-1.81,2-1.58,2.98.13.56.71,1.02,1.42.81.6-.18,2.68-3.09,3.03-3.72.71.3,2.1,1.77,2.79,2.32,1.82,1.47,3.75,3.34,5.47,4.7l2.03,1.79c.32.24.27.16.61.52.02.59-3.07,15.61-3.39,16.41-4,.15-10.03.03-14.45.03v-4.15c0-5.61.84-8.43-4.19-8.63-1.52-4.12-1.99-7.39-7.21-7.4h-3.81c-3.48,0-2.85.28-3.1-1.2l-1.14-6.35c-.8-4.57-1.47-4.32-5.2-4.64v-17.97s0-1.16,0-1.16ZM42.18,34.7v25.02c-8.09-.03-16.15,0-24.2,0-3.06,0-2.53.51-2.53,3.42v9.04c0,1.03-.03,1.91.99,2.11,1.25.24,4.55-.03,6.08.04-1.63,1.06-2.41,1.19-3.35,3-.95,1.84-.63,3.33-1.13,5.2-2.52,1.24-2.59-1.05-2.6,5.76,0,.63,0,1.23.29,1.67.24.38.76.78,1.26.88.88.17,3.2.05,4.23.05.3-.11.65-2.23,1.37-3.64,4.57-9.01,17.71-8.96,21.94.46,2.42,5.39-.67,6.34,3.67,6.32,4.87-.02,39.73.16,40.4-.11,1.07-.43.51-1.79,1.07-4.02.9-3.62,3.39-6.78,6.97-8.28,3.52-1.48,9.53-1.08,14-1.06,2.25.01,2.13-.95,1.76-2.95-2.01-10.91-17.14-13.14-17.25-13.2-.34-.21-.56-1.24-.73-1.73-.22-.65-.41-1.25-.63-1.91l-7.45-22.22c-.39-1.17-.99-2.68-1.25-3.83,3.81-.28,7.36.7,7.67-1.03.29-1.64-1.14-4.07-3.84-4.78-12.68-3.33-24.61-3.48-37.62-3.48-2.74,0-9.18-.31-11.43.27-2.89.75-5.11,2.97-5.86,5.86-.69,2.65-.39,3.14,2.17,3.13,1.99-.01,3.99,0,5.98,0Z" />
      <path d="M32.32,82.96c-5.04.52-9.33,5.16-8.65,10.94.59,4.98,5.16,9.24,10.94,8.6,5.02-.55,9.29-5.14,8.61-10.95-.59-5.08-5.07-9.2-10.9-8.59Z" />
      <path d="M100.23,83.01c-5.02.71-9.3,5.21-8.45,11.16.69,4.89,5.35,9.11,11.16,8.3,4.93-.69,9.11-5.31,8.33-11.11-.67-4.98-5.22-9.18-11.03-8.35Z" />
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
