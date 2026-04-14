import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import BeamMark from "@/components/brand/BeamMark";
import SealMark from "@/components/brand/SealMark";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Preview — Port A Local",
  description: "Internal brand preview — logo directions and lockups. Not linked from nav.",
  robots: { index: false, follow: false },
};

/** Renders a mark at the full range of sizes it will actually be used at. */
function SizeRamp({
  children,
  background,
  label,
}: {
  children: (size: number) => React.ReactNode;
  background: string;
  label: string;
}) {
  const sizes = [192, 96, 64, 48, 32, 16];
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
        {label}
      </p>
      <div
        className="rounded-2xl p-6 sm:p-8 flex items-end gap-6 flex-wrap border border-sand-200"
        style={{ background }}
      >
        {sizes.map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div style={{ width: s, height: s }}>{children(s)}</div>
            <span
              className="text-[10px] font-mono"
              style={{
                color: background === "#f5f0e8" ? "#4a5568" : "#8896ab",
              }}
            >
              {s}px
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal lockup: mark + PORT A LOCAL wordmark */
function HorizontalLockup({
  mark,
  onDark = false,
}: {
  mark: React.ReactNode;
  onDark?: boolean;
}) {
  const wordmarkColor = onDark ? "#e8656f" : "#0b1120";
  const subColor = onDark ? "#8896ab" : "#4a5568";
  return (
    <div
      className="rounded-2xl p-8 flex items-center gap-5 border border-sand-200"
      style={{ background: onDark ? "#0b1120" : "#f5f0e8" }}
    >
      <div style={{ width: 72, height: 72 }}>{mark}</div>
      <div className="flex flex-col">
        <span
          className="font-display font-bold text-3xl tracking-wide leading-none"
          style={{ color: wordmarkColor }}
        >
          PORT A LOCAL
        </span>
        <span
          className="text-[10px] font-medium tracking-[0.3em] uppercase mt-1.5"
          style={{ color: subColor }}
        >
          Port Aransas, TX
        </span>
      </div>
    </div>
  );
}

/** Stacked lockup: mark above PORT A LOCAL */
function StackedLockup({
  mark,
  onDark = false,
}: {
  mark: React.ReactNode;
  onDark?: boolean;
}) {
  const wordmarkColor = onDark ? "#e8656f" : "#0b1120";
  const subColor = onDark ? "#8896ab" : "#4a5568";
  return (
    <div
      className="rounded-2xl p-10 flex flex-col items-center gap-4 border border-sand-200"
      style={{ background: onDark ? "#0b1120" : "#f5f0e8" }}
    >
      <div style={{ width: 96, height: 96 }}>{mark}</div>
      <div className="flex flex-col items-center">
        <span
          className="font-display font-bold text-2xl tracking-wide leading-none"
          style={{ color: wordmarkColor }}
        >
          PORT A LOCAL
        </span>
        <span
          className="text-[10px] font-medium tracking-[0.3em] uppercase mt-2"
          style={{ color: subColor }}
        >
          Port Aransas, TX
        </span>
      </div>
    </div>
  );
}

function DirectionBlock({
  title,
  subtitle,
  description,
  mark,
  markLight,
  sealMode = false,
}: {
  title: string;
  subtitle: string;
  description: string;
  mark: (size: number) => React.ReactNode;
  markLight: (size: number) => React.ReactNode;
  sealMode?: boolean;
}) {
  return (
    <section className="py-16 border-t border-sand-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
            {subtitle}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
            {title}
          </h2>
          <p className="text-base text-navy-500 font-light max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <SizeRamp background="#f5f0e8" label="Size ramp — light context">
            {mark}
          </SizeRamp>
          <SizeRamp background="#0b1120" label="Size ramp — dark context">
            {markLight}
          </SizeRamp>
        </div>

        {!sealMode && (
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-navy-400 mb-3">
              Wordmark lockups
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <HorizontalLockup mark={mark(72)} />
              <HorizontalLockup mark={markLight(72)} onDark />
              <StackedLockup mark={mark(96)} />
              <StackedLockup mark={markLight(96)} onDark />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BrandPreviewPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Internal — Brand Preview
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 mb-4">
            Three lighthouses
          </h1>
          <p className="text-lg text-navy-200 font-light max-w-2xl mx-auto">
            Each mark anchored in the Lydia Ann. Review at every size, on both
            fields, as wordmark lockups. Pick one — or pick pieces of each — and
            we iterate.
          </p>
        </div>
      </section>

      <DirectionBlock
        title="Lighthouse"
        subtitle="Direction 1"
        description="Octagonal tower silhouette inspired by the actual Lydia Ann Light. Heritage-literal, iconic, reads at a glance. Three-panel shading gives the octagonal form without needing literal geometry. Coral holds the light. Directional beam rays turn off below 48px so the silhouette stays clean."
        mark={(s) => <LighthouseMark size={s} variant="dark" showBeam={s >= 48} />}
        markLight={(s) => (
          <LighthouseMark size={s} variant="light" showBeam={s >= 48} />
        )}
      />

      <DirectionBlock
        title="Beam"
        subtitle="Direction 2"
        description="The lighthouse implied by its beam, not its tower. A coral light radiating through a navy field. Modern, abstract, wayfinding-first. The core reads perfectly at 16px because it's just a coral dot in a navy circle — best favicon of the three. The implied tower hint anchors it to the lighthouse metaphor without being literal."
        mark={(s) => <BeamMark size={s} variant="dark" />}
        markLight={(s) => <BeamMark size={s} variant="light" />}
      />

      <DirectionBlock
        title="Heritage Seal"
        subtitle="Direction 3"
        description="A proper seal — curved type, compass ticks, lighthouse vignette, EST. 2026. Reads institutional: newspaper masthead, signet ring, field notebook cover. Use as signature piece on Dispatch footers, About pages, and anywhere PAL wants to feel like it has been here a while. Not a nav logo — a signature. Pair with Direction 1 or 2 as the main mark."
        mark={(s) => <SealMark size={s} variant="light" />}
        markLight={(s) => <SealMark size={s} variant="dark" />}
        sealMode
      />

      <section className="py-20 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Pick a direction.
          </h2>
          <p className="text-lg text-navy-200 font-light mb-2">
            Tell me which to carry forward. I&apos;ll iterate proportions, refine
            details, then wire it through favicon, OG images, navigation, and the
            dispatch section.
          </p>
          <p className="text-sm text-navy-400 font-light">
            Combinations welcome — e.g., Direction 2 as the nav mark, Direction 3
            as the Dispatch masthead seal.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
