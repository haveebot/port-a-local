import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import LighthouseMark from "@/components/brand/LighthouseMark";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export const metadata: Metadata = {
  title: "Brand Kit — Port A Local",
  description:
    "Colors, logos, icons, typography, taglines, and voice — everything needed to create on-brand content for Port A Local.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://theportalocal.com/brand" },
};

interface Swatch {
  name: string;
  hex: string;
  usage: string;
  textOn?: "dark" | "light";
}

const PRIMARY_COLORS: Swatch[] = [
  { name: "Navy 950", hex: "#0b1120", usage: "Primary ink, headers, all large type on light backgrounds", textOn: "dark" },
  { name: "Navy 900", hex: "#111d35", usage: "Default page text, nav backgrounds", textOn: "dark" },
  { name: "Coral 500", hex: "#e8656f", usage: "Signature accent — buttons, highlights, beam light, Dispatch brand", textOn: "dark" },
  { name: "Coral 400", hex: "#f08589", usage: "Coral on navy surfaces — icons, eyebrows", textOn: "dark" },
];

const SUPPORTING_COLORS: Swatch[] = [
  { name: "Sand 50", hex: "#faf8f4", usage: "Primary light background — page fills, cards", textOn: "light" },
  { name: "Sand 100", hex: "#f5f0e6", usage: "Warm section backgrounds, cards on sand-50", textOn: "light" },
  { name: "Sand 200", hex: "#ebe0cc", usage: "Hover states, dividers on light backgrounds", textOn: "light" },
  { name: "Gold 500", hex: "#d4a843", usage: "Warm sunset highlight — used sparingly (accent lines, micro-badges)", textOn: "light" },
  { name: "Ocean 500", hex: "#0aa5ea", usage: "Activity/freshness accent — Live Pulse, water/sky", textOn: "dark" },
  { name: "Seafoam 500", hex: "#10b981", usage: "Verified/success — checkmarks, live indicators", textOn: "dark" },
];

function SwatchCard({ sw }: { sw: Swatch }) {
  return (
    <div className="rounded-xl overflow-hidden border border-sand-200 bg-white">
      <div
        className="h-24 flex items-end p-3"
        style={{ backgroundColor: sw.hex, color: sw.textOn === "dark" ? "#f5f0e8" : "#0b1120" }}
      >
        <div className="text-xs font-mono tracking-tight opacity-80">{sw.hex.toUpperCase()}</div>
      </div>
      <div className="p-3 space-y-1">
        <div className="font-display text-sm font-bold text-navy-900">{sw.name}</div>
        <div className="text-xs text-navy-500 leading-relaxed">{sw.usage}</div>
      </div>
    </div>
  );
}

const DIRECTORY_ICONS: { name: PortalIconName; label: string; file: string }[] = [
  { name: "eat", label: "Eat", file: "eat.svg" },
  { name: "drink", label: "Drink", file: "drink.svg" },
  { name: "stay", label: "Stay", file: "stay.svg" },
  { name: "do", label: "Do", file: "do.svg" },
  { name: "fish", label: "Fish", file: "fish.svg" },
  { name: "shop", label: "Shop", file: "shop.svg" },
  { name: "beach", label: "Beach Rentals", file: "beach.svg" },
  { name: "maintenance", label: "Maintenance", file: "maintenance.svg" },
  { name: "cart", label: "Golf Cart Rentals", file: "cart.svg" },
];

const TIER_2_ICONS: PortalIconName[] = ["burger", "happyhour", "taco", "coffee", "seafood", "sailing", "surfing", "latenight", "offshore"];
const TIER_1_ICONS: PortalIconName[] = ["services", "events", "heritage", "dispatch", "archives", "guides", "essentials", "live", "map", "photos", "mytrip"];
const TIER_3_ICONS: PortalIconName[] = ["ferry", "parking", "weather", "wildlife", "emergency", "connectivity"];
const TIER_4_ICONS: PortalIconName[] = ["sunrise", "island", "palm", "urgent", "trophy", "art", "calendar", "check", "warning", "sun", "thermometer", "wind", "search", "handshake", "shell", "video", "winter", "storm", "castle", "hammer"];

const TAGLINES = [
  { text: "Discover Port Aransas Like a Local", context: "Primary marketing tagline — homepage hero, FB banner, ad creative" },
  { text: "Port A Local", context: "Wordmark / short-form identity" },
  { text: "The Port A Local", context: "Editorial signature — email sign-offs, Dispatch byline" },
  { text: "100% Locally Approved · 130+ Vetted Businesses · 100% Free", context: "Trust stat-strip — homepage, OG cards, launch posts" },
  { text: "Vetted by locals. No paid placements. Real Port A recommendations.", context: "Core messaging triplet — about page, long-form copy" },
  { text: "Features, analysis and reporting on the island as it is — not as it's advertised.", context: "Dispatch tagline — article footers, share cards" },
  { text: "27°50′N · 97°03′W · Mustang Island · Est. 2026", context: "Coordinate strip — footer, print posters, corporate identity" },
];

const VOICE_WE_SOUND_LIKE = [
  "A knowledgeable local giving recommendations",
  "A clean, well-designed tool",
  "A curated guide built on real experience",
];

const VOICE_WE_DO_NOT = [
  "A tourism board",
  "A travel blog",
  "A corporate directory",
];

const WRITING_STYLE = [
  "Short and clear",
  "Minimal fluff",
  "No hype language",
  "No exaggerated claims",
  "No sales tone",
];

const ICON_RULES = [
  "Style: simple coastal editorial line icons — minimal, clean, slightly friendly",
  "Avoid excessive inner detail",
  "Must remain legible at 24 px",
  "One color only per use",
  "Navy on light backgrounds · Coral on navy backgrounds · White only when needed on dark surfaces",
  "No gradients, shadows, outlines, or effects",
  "Maintain original proportions and spacing",
];

export default function BrandKitPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Internal Reference
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Brand Kit
          </h1>
          <p className="text-lg text-navy-200 font-light max-w-2xl mx-auto">
            Colors, logos, icons, typography, taglines, and voice — the source of truth for anything created in Port A Local&apos;s name.
          </p>
        </div>
      </section>

      {/* Colors */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Palette</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Colors</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">The Palm Republic — Navy + Coral sunset palette. Navy is the anchor; coral is the accent. Everything else plays support. Hex codes below click-to-copy in most browsers.</p>
          </div>

          <h3 className="font-display text-sm font-bold text-navy-700 uppercase tracking-widest mb-4">Primary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {PRIMARY_COLORS.map((sw) => <SwatchCard key={sw.hex} sw={sw} />)}
          </div>

          <h3 className="font-display text-sm font-bold text-navy-700 uppercase tracking-widest mb-4">Supporting</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SUPPORTING_COLORS.map((sw) => <SwatchCard key={sw.hex} sw={sw} />)}
          </div>

          <div className="mt-8 bg-white rounded-xl border border-sand-200 p-5">
            <p className="text-xs font-semibold text-coral-600 uppercase tracking-widest mb-2">Usage Rule</p>
            <p className="text-sm text-navy-700 leading-relaxed">
              Navy + Coral do the heavy lifting. Sand is the canvas. Gold, Ocean, and Seafoam are used sparingly (max one per composition). Full scales exist (50–950); prefer the stops shown above unless a design specifically calls for another.
            </p>
          </div>
        </div>
      </section>

      {/* Lighthouse Mark */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Logo</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Lighthouse Mark</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">Four detail levels for four use cases. Step up when there&apos;s room; step down when there&apos;s not. All downloadable as single-color SVGs.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { detail: "full", label: "Full", use: "Hero images, large OG cards (128 px+)" },
              { detail: "standard", label: "Standard", use: "Nav, footer, card mastheads (40–96 px) — default" },
              { detail: "simple", label: "Simple", use: "Print, mobile, inline (32–48 px)" },
              { detail: "icon", label: "Icon", use: "Favicon, buttons, chips (12–32 px)" },
            ] as const).map((v) => (
              <div key={v.detail} className="bg-sand-50 rounded-xl border border-sand-200 p-5 flex flex-col items-center text-center">
                <div className="bg-navy-950 rounded-lg p-4 mb-3 w-full flex items-center justify-center min-h-[140px]">
                  <LighthouseMark size={96} variant="light" detail={v.detail} />
                </div>
                <div className="font-display font-bold text-navy-900">{v.label}</div>
                <div className="text-xs text-navy-500 mt-1 leading-relaxed">{v.use}</div>
                <a
                  href={`/logos/lighthouse-${v.detail}.svg`}
                  download
                  className="mt-3 text-xs text-coral-600 hover:text-coral-700 font-medium underline underline-offset-2"
                >
                  Download SVG
                </a>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-navy-950 rounded-xl p-6 flex flex-wrap items-center gap-6 justify-center">
            <LighthouseMark size={48} variant="light" detail="standard" />
            <LighthouseMark size={48} variant="coral" detail="standard" />
            <div className="bg-sand-50 rounded-lg p-3">
              <LighthouseMark size={48} variant="dark" detail="standard" />
            </div>
            <div className="text-xs text-navy-300 font-medium tracking-wider">
              Sand on navy · Coral on navy · Navy on sand
            </div>
          </div>
        </div>
      </section>

      {/* Directory Icons */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Round 1 — Authoritative</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Directory &amp; Portal Icons</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">Collie&apos;s designs (2026-04-24 Illustrator revision). The nine core icons that anchor the site&apos;s taxonomy. One color per use — download below.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {DIRECTORY_ICONS.map((icon) => (
              <div key={icon.name} className="bg-white rounded-xl border border-sand-200 p-3 flex flex-col items-center">
                <div className="bg-sand-50 rounded-lg p-3 w-full flex items-center justify-center aspect-square">
                  <PortalIcon name={icon.name} className="w-10 h-10 text-navy-900" />
                </div>
                <div className="mt-2 text-xs font-medium text-navy-700 text-center">{icon.label}</div>
                <a
                  href={`/icons/directory/${icon.file}`}
                  download
                  className="mt-1 text-[10px] text-coral-600 hover:text-coral-700 font-medium underline underline-offset-2"
                >
                  SVG
                </a>
              </div>
            ))}
          </div>

          {/* Coral on navy strip */}
          <div className="mt-4 bg-navy-950 rounded-xl p-4 grid grid-cols-9 gap-2">
            {DIRECTORY_ICONS.map((icon) => (
              <div key={icon.name} className="flex items-center justify-center aspect-square">
                <PortalIcon name={icon.name} className="w-8 h-8 text-coral-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Icon System Rules */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h3 className="font-display text-sm font-bold text-navy-700 uppercase tracking-widest mb-4">Icon System Rules</h3>
          <ul className="space-y-2">
            {ICON_RULES.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-navy-700 leading-relaxed">
                <span className="text-coral-500 mt-1">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Extended Icon Library */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Reference</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Full Icon Library</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">All 46 site-wide icons drafted in Collie&apos;s monochrome style, ready for iteration. Used across nav, Gully, Essentials, Fishing Report, Live Pulse, and more.</p>
          </div>

          {(
            [
              { label: "Tier 1 — Nav", icons: TIER_1_ICONS },
              { label: "Tier 2 — Gully Chips", icons: TIER_2_ICONS },
              { label: "Tier 3 — Essentials Sections", icons: TIER_3_ICONS },
              { label: "Tier 4 — Decoratives + UI Affordances", icons: TIER_4_ICONS },
            ] as const
          ).map((tier) => (
            <div key={tier.label} className="mb-8">
              <h3 className="font-display text-sm font-bold text-navy-700 uppercase tracking-widest mb-3">{tier.label}</h3>
              <div className="bg-white rounded-xl border border-sand-200 p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {tier.icons.map((name) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <PortalIcon name={name} className="w-7 h-7 text-navy-900" />
                    <div className="text-[10px] font-mono text-navy-500">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Type</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Typography</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">Two typefaces, both free from Google Fonts. Display pairs serif gravitas with a clean sans for body.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-sand-50 rounded-xl border border-sand-200 p-6">
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-display text-3xl font-bold text-navy-900">Playfair Display</span>
                <span className="text-xs font-mono text-navy-500">Display / Serif</span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="font-display text-5xl font-bold text-navy-900 leading-tight">Port A Local</p>
                <p className="font-display text-2xl font-semibold text-navy-900">The Tarpon Era</p>
                <p className="font-display text-base italic text-navy-700">They said we were extinct.</p>
              </div>
              <div className="text-xs text-navy-500 leading-relaxed">
                <p className="mb-1"><strong className="text-navy-900">Usage:</strong> Headlines, hero copy, editorial titles, display numbers.</p>
                <p className="mb-1"><strong className="text-navy-900">Weights:</strong> 400, 500, 600, 700, 800 (+ italics 400, 500).</p>
                <p><strong className="text-navy-900">CSS var:</strong> <code className="font-mono text-coral-600">--font-display</code></p>
              </div>
            </div>

            <div className="bg-sand-50 rounded-xl border border-sand-200 p-6">
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-sans text-3xl font-bold text-navy-900">Inter</span>
                <span className="text-xs font-mono text-navy-500">Body / Sans</span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="font-sans text-base text-navy-800 leading-relaxed">Port Aransas as it is — not as it&apos;s advertised. 140 vetted businesses. No paid placements.</p>
                <p className="font-sans text-sm font-semibold text-coral-600 tracking-wide uppercase">Book before you arrive</p>
                <p className="font-sans text-xs font-medium text-navy-500">27°50′N · 97°03′W · Mustang Island</p>
              </div>
              <div className="text-xs text-navy-500 leading-relaxed">
                <p className="mb-1"><strong className="text-navy-900">Usage:</strong> Body text, buttons, nav, micro-copy, stats.</p>
                <p className="mb-1"><strong className="text-navy-900">Weights:</strong> 300, 400, 500, 600, 700.</p>
                <p><strong className="text-navy-900">CSS var:</strong> <code className="font-mono text-coral-600">--font-sans</code></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Taglines */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Copy</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">Tagline Bank</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">Approved lines, pre-vetted for voice. Use as-is or as seeds — do not rewrite without checking against the voice rules below.</p>
          </div>
          <div className="space-y-3">
            {TAGLINES.map((t) => (
              <div key={t.text} className="bg-white rounded-xl border border-sand-200 p-5 flex items-start justify-between gap-5 flex-wrap">
                <p className="font-display text-lg text-navy-900 flex-1 min-w-[260px]">&ldquo;{t.text}&rdquo;</p>
                <p className="text-xs text-navy-500 italic max-w-xs text-right">{t.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Voice</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">How We Sound</h2>
            <p className="text-sm text-navy-500 mt-2 max-w-2xl">Tone: local-first, honest, practical, quietly confident, curated not promotional. The reader should feel recommended to, not sold to.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-sand-50 rounded-xl border-2 border-coral-400/60 p-6">
              <h3 className="font-display text-sm font-bold text-coral-600 uppercase tracking-widest mb-3">We Sound Like</h3>
              <ul className="space-y-2">
                {VOICE_WE_SOUND_LIKE.map((v) => (
                  <li key={v} className="text-sm text-navy-800 flex items-start gap-2">
                    <span className="text-coral-500 mt-1">✓</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-sand-50 rounded-xl border border-sand-200 p-6">
              <h3 className="font-display text-sm font-bold text-navy-700 uppercase tracking-widest mb-3">We Do Not Sound Like</h3>
              <ul className="space-y-2">
                {VOICE_WE_DO_NOT.map((v) => (
                  <li key={v} className="text-sm text-navy-500 flex items-start gap-2 line-through decoration-navy-300">
                    <span className="text-navy-300 no-underline mt-1">✕</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-navy-950 rounded-xl p-6">
            <h3 className="font-display text-sm font-bold text-coral-300 uppercase tracking-widest mb-3">Writing Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {WRITING_STYLE.map((s) => (
                <div key={s} className="bg-navy-900/60 rounded-lg px-3 py-2 text-center">
                  <span className="text-sand-100 text-xs font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            <div className="bg-seafoam-500/5 rounded-xl border border-seafoam-500/20 p-5">
              <p className="text-xs font-semibold text-seafoam-600 uppercase tracking-widest mb-2">On-brand example</p>
              <p className="text-sm text-navy-700 italic leading-relaxed">&ldquo;Back Pew Revival at Treasure Island on Saturday. Doors at 9. Local band, local room, worth the walk.&rdquo;</p>
            </div>
            <div className="bg-coral-500/5 rounded-xl border border-coral-500/20 p-5">
              <p className="text-xs font-semibold text-coral-600 uppercase tracking-widest mb-2">Off-brand example</p>
              <p className="text-sm text-navy-500 italic line-through decoration-navy-300 leading-relaxed">&ldquo;Don&apos;t miss out on the MUST-SEE Texas band Back Pew Revival ROCKING Treasure Island this weekend!&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">Positioning</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">What We Are</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Community-driven", "Vetted by locals", "No paid placements", "No corporate influence"].map((p) => (
              <div key={p} className="bg-white rounded-xl border border-sand-200 p-4 text-center">
                <span className="font-display font-bold text-navy-900 text-sm">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-navy-500 mt-4 text-center italic">
            Goal: help users quickly find what&apos;s actually good and useful on the island.
          </p>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">Using the Kit</h2>
          <p className="text-lg text-navy-200 font-light mb-8 max-w-2xl mx-auto">
            Right-click → Save on any SVG. For programmatic use, reference the React components in <code className="font-mono text-coral-300">src/components/brand/</code>.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dispatch" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Dispatch
            </Link>
            <Link href="/history" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Heritage
            </Link>
            <Link href="/live-music" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Live Music
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
