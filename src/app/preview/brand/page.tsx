import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand — The Lighthouse | Port A Local",
  description:
    "Internal brand preview — the Port A Local lighthouse mark across four detail levels and every real-world use context.",
  robots: { index: false, follow: false },
};

// ─────────────────────────────────────────────────────────────
// Reusable scaffolding
// ─────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10">
      <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-base text-navy-500 font-light max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function Card({
  background,
  children,
  className = "",
  minHeight,
}: {
  background?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}) {
  return (
    <div
      className={`rounded-2xl border border-sand-200 ${className}`}
      style={{ background: background ?? "#ffffff", minHeight }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Use-context mockups
// ─────────────────────────────────────────────────────────────

/** Mockup: PAL navigation bar, matching the real site */
function NavMockup() {
  return (
    <Card background="#0b1120" className="overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <LighthouseMark size={40} variant="light" detail="standard" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-wide leading-none text-coral-400">
              PORT A LOCAL
            </span>
            <span className="text-[9px] font-medium tracking-[0.3em] uppercase mt-0.5 text-navy-300">
              Port Aransas, TX
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-navy-300">
          <span>Explore</span>
          <span>Discover</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
            Gully it...
          </span>
        </div>
      </div>
      <div className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400">
        Nav mockup · standard detail, size 40px
      </div>
    </Card>
  );
}

/** Mockup: a browser tab showing the favicon */
function BrowserTabMockup() {
  return (
    <Card background="#e2e8f0" className="overflow-hidden">
      <div className="p-5">
        <div className="inline-flex items-stretch rounded-t-lg bg-white pl-3 pr-6 py-2.5 gap-2 items-center shadow-sm">
          <LighthouseMark size={16} variant="dark" detail="icon" />
          <span className="text-xs font-medium text-navy-900">
            Port A Local — Port Aransas, TX
          </span>
          <span className="text-navy-400 text-xs ml-2">×</span>
        </div>
        <div className="h-1 bg-white rounded-tr-sm" />
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
          <span className="text-xs text-navy-400">🔒</span>
          <span className="text-xs text-navy-500 font-mono">
            theportalocal.com
          </span>
        </div>
      </div>
      <div className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400 bg-white/50">
        Browser tab mockup · icon detail, size 16px
      </div>
    </Card>
  );
}

/** Mockup: social share card (OG image at reduced scale) */
function OGCardMockup() {
  return (
    <Card background="#0b1120" className="overflow-hidden">
      <div
        className="px-10 py-12 flex flex-col justify-between"
        style={{ aspectRatio: "1200 / 630" }}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-coral-500/40 bg-coral-500/10 text-coral-300 text-xs font-medium tracking-wide">
            🧭 Dispatch · 11 min read
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-display text-3xl sm:text-4xl font-bold text-sand-50 leading-tight">
            The Two Port Aransases
          </div>
          <div className="text-sm text-navy-300 font-light max-w-xl leading-snug">
            Tourism dashboards say the island is up. Main Street tells a
            different story — and the numbers agree.
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LighthouseMark size={44} variant="light" detail="standard" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-wide leading-none text-coral-400">
                PORT A LOCAL
              </span>
              <span className="text-[9px] font-medium tracking-[0.3em] uppercase mt-1 text-navy-400">
                Port Aransas, TX
              </span>
            </div>
          </div>
          <span className="text-xs text-navy-400 font-mono">
            theportalocal.com
          </span>
        </div>
      </div>
      <div className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400 border-t border-white/10">
        Social share card mockup · standard detail, 44px in lockup
      </div>
    </Card>
  );
}

/** Mockup: dispatch footer seal — the mark as a signature piece */
function DispatchFooterMockup() {
  return (
    <Card background="#f5f0e8">
      <div className="px-8 py-12 flex flex-col items-center text-center gap-4 border-b border-sand-200">
        <LighthouseMark size={72} variant="dark" detail="standard" />
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-navy-500">
          Published by Port A Local
        </p>
        <p className="text-xs text-navy-400 font-light max-w-xs leading-relaxed">
          Editorial, analysis, and reporting on the island as it is — not as it
          is advertised. <span className="font-mono">27°50′N 97°03′W</span>
        </p>
      </div>
      <div className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400">
        Dispatch article footer · standard detail, 72px
      </div>
    </Card>
  );
}

/** Mockup: buttons, chips, badges — small UI contexts */
function InlineUIMockup() {
  return (
    <Card background="#ffffff">
      <div className="p-8 flex flex-wrap items-center gap-4">
        {/* Button with mark */}
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-coral-300 text-sm font-semibold">
          <LighthouseMark size={18} variant="light" detail="icon" />
          Visit Port A Local
        </button>

        {/* Chip */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-50 text-coral-600 text-xs font-medium">
          <LighthouseMark size={14} variant="dark" detail="icon" />
          Heritage
        </span>

        {/* Outlined chip */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-navy-200 text-navy-700 text-xs font-medium">
          <LighthouseMark size={14} variant="dark" detail="icon" />
          Local
        </span>

        {/* Circular avatar-style */}
        <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center">
          <LighthouseMark size={26} variant="light" detail="icon" />
        </div>

        {/* Inline text */}
        <span className="inline-flex items-center gap-1 text-sm text-navy-700">
          A note from
          <LighthouseMark size={14} variant="dark" detail="icon" className="mx-1" />
          <span className="font-semibold">Port A Local</span>
        </span>
      </div>
      <div className="px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400 border-t border-sand-200">
        Inline UI · icon detail, 14–26px
      </div>
    </Card>
  );
}

/** Mockup: watermark — the mark used as quiet background */
function WatermarkMockup() {
  return (
    <Card background="#f5f0e8" className="relative overflow-hidden" minHeight={280}>
      <div className="absolute bottom-0 right-0 opacity-[0.07] pointer-events-none">
        <LighthouseMark size={280} variant="dark" detail="full" />
      </div>
      <div className="relative p-10">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-coral-500 mb-3">
          Dispatch No. 1 · April 2026
        </p>
        <h3 className="font-display text-2xl font-bold text-navy-900 mb-3 max-w-md leading-tight">
          The Two Port Aransases
        </h3>
        <p className="text-sm text-navy-500 font-light max-w-md leading-relaxed">
          On December 30, 2025, the Sonic Drive-In at 1735 State Highway 361
          closed for good. It is easy to read a single closure as bad luck —
          but a national chain with three years of sales history does not pull
          a drive-thru lightly.
        </p>
      </div>
      <div className="relative px-6 py-3 text-[10px] font-semibold tracking-widest uppercase text-navy-400 border-t border-sand-200">
        Watermark · full detail, 280px at 7% opacity
      </div>
    </Card>
  );
}

/** Mockup: print / monochrome — business card style */
function PrintMockup() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Front */}
      <Card background="#f5f0e8" className="p-8 flex flex-col gap-3" minHeight={200}>
        <div className="flex items-start justify-between">
          <LighthouseMark size={40} variant="dark" detail="simple" />
          <span className="text-[9px] font-mono text-navy-400">
            27°50′N 97°03′W
          </span>
        </div>
        <div className="mt-auto">
          <p className="font-display font-bold text-base tracking-wide text-navy-900 leading-none">
            PORT A LOCAL
          </p>
          <p className="text-[9px] font-medium tracking-[0.3em] uppercase mt-1.5 text-navy-500">
            Port Aransas, TX
          </p>
        </div>
      </Card>

      {/* Back */}
      <Card background="#0b1120" className="p-8 flex items-center justify-center" minHeight={200}>
        <LighthouseMark size={96} variant="light" detail="simple" monochrome />
      </Card>

      {/* Caption spanning both */}
      <div className="col-span-2 -mt-2 text-[10px] font-semibold tracking-widest uppercase text-navy-400">
        Print / business card · simple detail, monochrome on back
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function BrandPreviewPage() {
  const detailLevels: {
    detail: "full" | "standard" | "simple" | "icon";
    label: string;
    bestFor: string;
  }[] = [
    {
      detail: "full",
      label: "Full",
      bestFor: "Hero · OG image · marketing · 128px and up",
    },
    {
      detail: "standard",
      label: "Standard",
      bestFor: "Navigation · dispatch footer · 40–96px (default)",
    },
    {
      detail: "simple",
      label: "Simple",
      bestFor: "Mobile nav · print · business cards · 32–48px",
    },
    {
      detail: "icon",
      label: "Icon",
      bestFor: "Favicon · buttons · chips · inline · 12–32px",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            The Mark · v3
          </div>
          <div className="flex justify-center mb-8">
            <LighthouseMark size={128} variant="light" detail="full" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 mb-4">
            The Lighthouse
          </h1>
          <p className="text-lg text-navy-200 font-light max-w-2xl mx-auto">
            One mark, four detail levels, calibrated for every place it will
            live. Below: the system, followed by real-world mockups of where
            each level belongs.
          </p>
        </div>
      </section>

      {/* Detail level comparison */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="The system"
            title="Four detail levels, one mark"
            description="Same silhouette, same proportions, progressively simpler. The point: a mark that never looks wrong, because we show only what the context can carry."
          />

          {/* On light */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
              Light context
            </p>
            <div
              className="rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border border-sand-200"
              style={{ background: "#f5f0e8" }}
            >
              {detailLevels.map((lvl) => (
                <div
                  key={lvl.detail}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <LighthouseMark
                    size={96}
                    variant="dark"
                    detail={lvl.detail}
                  />
                  <div>
                    <p className="font-display font-bold text-navy-900 text-base">
                      {lvl.label}
                    </p>
                    <p className="text-[10px] text-navy-500 font-light mt-1 leading-snug">
                      {lvl.bestFor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On dark */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
              Dark context
            </p>
            <div
              className="rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border border-sand-200"
              style={{ background: "#0b1120" }}
            >
              {detailLevels.map((lvl) => (
                <div
                  key={lvl.detail}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <LighthouseMark
                    size={96}
                    variant="light"
                    detail={lvl.detail}
                  />
                  <div>
                    <p className="font-display font-bold text-coral-400 text-base">
                      {lvl.label}
                    </p>
                    <p className="text-[10px] text-navy-300 font-light mt-1 leading-snug">
                      {lvl.bestFor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Size ramp — the standard (default) detail at every size */}
      <section className="py-20 bg-sand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Size ramp"
            title="Standard detail at every size"
            description="The default. This is what ships to nav, dispatch, OG lockups, anywhere without a reason to step up or down."
          />

          <div
            className="rounded-2xl p-8 flex items-end gap-8 flex-wrap border border-sand-200"
            style={{ background: "#f5f0e8" }}
          >
            {[160, 96, 64, 48, 32].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div style={{ width: s, height: s }}>
                  <LighthouseMark size={s} variant="dark" detail="standard" />
                </div>
                <span className="text-[10px] font-mono text-navy-500">{s}px</span>
              </div>
            ))}
          </div>

          <div
            className="mt-6 rounded-2xl p-8 flex items-end gap-8 flex-wrap border border-sand-200"
            style={{ background: "#0b1120" }}
          >
            {[160, 96, 64, 48, 32].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div style={{ width: s, height: s }}>
                  <LighthouseMark size={s} variant="light" detail="standard" />
                </div>
                <span className="text-[10px] font-mono text-navy-400">{s}px</span>
              </div>
            ))}
          </div>

          {/* Small-size cutover: standard vs icon */}
          <div className="mt-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
              Small-size cutover — standard vs icon at 16–32px
            </p>
            <div
              className="rounded-2xl p-8 grid grid-cols-2 gap-6 border border-sand-200"
              style={{ background: "#f5f0e8" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-end gap-5">
                  {[32, 24, 16].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div style={{ width: s, height: s }}>
                        <LighthouseMark
                          size={s}
                          variant="dark"
                          detail="standard"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-navy-500">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-navy-700 mt-2">
                  Standard
                </p>
                <p className="text-[10px] text-navy-500 font-light text-center max-w-[200px]">
                  Windows + shading survive down to 24px; break up at 16px
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-end gap-5">
                  {[32, 24, 16].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div style={{ width: s, height: s }}>
                        <LighthouseMark size={s} variant="dark" detail="icon" />
                      </div>
                      <span className="text-[9px] font-mono text-navy-500">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-navy-700 mt-2">Icon</p>
                <p className="text-[10px] text-navy-500 font-light text-center max-w-[200px]">
                  Silhouette + coral light only. Clean at 16px.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wordmark lockups */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Wordmark lockups"
            title="Mark + type"
            description="Horizontal for nav and inline use, stacked for hero / print / standalone moments."
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Horizontal light */}
            <Card background="#f5f0e8" className="p-10 flex items-center gap-5">
              <LighthouseMark size={72} variant="dark" detail="standard" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-3xl tracking-wide leading-none text-navy-900">
                  PORT A LOCAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase mt-1.5 text-navy-500">
                  Port Aransas, TX
                </span>
              </div>
            </Card>

            {/* Horizontal dark */}
            <Card background="#0b1120" className="p-10 flex items-center gap-5">
              <LighthouseMark size={72} variant="light" detail="standard" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-3xl tracking-wide leading-none text-coral-400">
                  PORT A LOCAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase mt-1.5 text-navy-300">
                  Port Aransas, TX
                </span>
              </div>
            </Card>

            {/* Stacked light */}
            <Card
              background="#f5f0e8"
              className="p-12 flex flex-col items-center gap-4"
            >
              <LighthouseMark size={104} variant="dark" detail="full" />
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-2xl tracking-wide leading-none text-navy-900">
                  PORT A LOCAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase mt-2 text-navy-500">
                  Port Aransas, TX
                </span>
              </div>
            </Card>

            {/* Stacked dark */}
            <Card
              background="#0b1120"
              className="p-12 flex flex-col items-center gap-4"
            >
              <LighthouseMark size={104} variant="light" detail="full" />
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-2xl tracking-wide leading-none text-coral-400">
                  PORT A LOCAL
                </span>
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase mt-2 text-navy-300">
                  Port Aransas, TX
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* In-use mockups */}
      <section className="py-20 bg-sand-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="In use"
            title="Where each level lives"
            description="The full range of real contexts the mark will appear in. Each card below is calibrated to use the right detail level for that surface."
          />

          <div className="grid md:grid-cols-2 gap-6">
            <NavMockup />
            <BrowserTabMockup />
          </div>

          <div className="mt-6">
            <OGCardMockup />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <DispatchFooterMockup />
            <InlineUIMockup />
          </div>

          <div className="mt-6">
            <WatermarkMockup />
          </div>

          <div className="mt-6">
            <PrintMockup />
          </div>
        </div>
      </section>

      {/* Feedback / designer notes */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Designer notes"
            title="Feedback on each level"
          />

          <div className="space-y-6 text-base text-navy-600 font-light leading-relaxed">
            <div>
              <p className="font-semibold text-navy-900 mb-1">Full</p>
              <p>
                Beam rays + finial + windows read beautifully at 128px and up.
                Below that, the rays start to feel like clutter and the finial
                collapses to noise. Reserve for hero moments with room to
                breathe: OG images, the homepage hero, the watermark treatment
                where the opacity softens everything anyway. Don&apos;t use in
                nav or inline.
              </p>
            </div>
            <div>
              <p className="font-semibold text-navy-900 mb-1">
                Standard (the default)
              </p>
              <p>
                The sweet spot. Drops the fiddly stuff (beams, finial) but keeps
                the 3-panel shading that gives the tower its octagonal weight
                and the porthole windows that make it feel like a real
                lighthouse. Works from ~40px up cleanly. This is what ships to
                navigation, dispatch footers, and any default lockup.
              </p>
            </div>
            <div>
              <p className="font-semibold text-navy-900 mb-1">Simple</p>
              <p>
                Flat-shaded silhouette, no windows, but keeps the gallery catwalk
                detail and the coral light. This is the print version — the
                mark that prints cleanly on a business card, embroiders onto a
                hat, holds up under the kind of reproduction where fine detail
                gets lost. Also good for mobile nav where 3-panel shading starts
                to blur.
              </p>
            </div>
            <div>
              <p className="font-semibold text-navy-900 mb-1">Icon</p>
              <p>
                The essentials only — tower, gallery band, light room (with
                coral light), dome. No base platform detail. Locks in at 16px
                and looks intentional, not crunched. This is the favicon, the
                button bug, the text-inline mark. When anyone asks &quot;what&apos;s
                PAL&apos;s icon look like,&quot; this is the answer.
              </p>
            </div>

            <div className="pt-6 border-t border-sand-200">
              <p className="font-semibold text-navy-900 mb-1">
                What still deserves a second look
              </p>
              <p>
                The <em>base platform</em> in full/standard reads slightly heavy
                on dark backgrounds — the two-tone base can feel like a step
                rather than a platform. Happy to simplify that in a next pass if
                you want it to sit more quietly.
              </p>
              <p className="mt-3">
                The <em>light room</em> (coral strip) is the only warm color in
                the mark. That means it carries a lot of weight — get the
                proportion wrong and the light either disappears or dominates.
                Current proportion is 12×4 units inside a 18×8 room. Tunable.
              </p>
              <p className="mt-3">
                The <em>dome curvature</em> currently uses a quadratic Bézier
                with a soft peak. The real Lydia Ann dome is slightly flatter.
                If we want it more faithful, a tiny tweak moves the control
                point down by 1–2 units.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Approve the system?
          </h2>
          <p className="text-lg text-navy-200 font-light mb-2">
            If yes, I wire it end to end: favicon (icon detail), navigation
            (standard), OG images for home + dispatch (standard in lockup, full
            on standalone), dispatch footer (standard), and print exports.
          </p>
          <p className="text-sm text-navy-400 font-light">
            If you want adjustments first — base platform lighter, dome flatter,
            coral light smaller, specific size reworked — name them and I
            iterate before wiring.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
