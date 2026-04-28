import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getPublishedDigests } from "@/data/council-store";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Council Watch — Port A Local",
  description:
    "Plain-language digests of Port Aransas City Council, Planning & Zoning Commission, and city-board meetings. Eighty-page packets summarized into 200 words. Decisions, votes, and what they mean — with links to the source minutes and the full meeting recording.",
};

/**
 * `/council-watch` — published meeting digests, most-recent first.
 *
 * Index page rendered from council_meetings table where status='published'.
 * Each entry has a digest written by Winston/Collie (or auto-drafted in
 * a future build), with the source PDFs from civicweb.net and an embedded
 * YouTube recording of the meeting.
 *
 * Editorial position: 80-page council packets are unreadable. PAL turns
 * each meeting into a 200–400 word "what just got decided" digest in the
 * PAL voice. SEO win + civic-information accessibility win + content
 * engine that runs on its own without manual writing every week.
 */
export default async function CouncilWatchPage() {
  const digests = await getPublishedDigests(50);

  // Group by year for the index UX (matches Heritage page pattern).
  const grouped = groupByYear(digests);

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Council Watch
            </span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 leading-[1.05] tracking-tight">
            Council Watch.
          </h1>
          <p className="text-lg text-navy-200 mt-5 font-light max-w-2xl leading-relaxed">
            Eighty-page packets summarized into 200 words. What got
            decided at City Council, Planning &amp; Zoning, and the
            city boards — in plain language, with the source minutes
            linked and the full meeting recording embedded.
          </p>
          <p className="text-sm text-navy-300 mt-4 font-light max-w-2xl">
            Updated weekly after each meeting cycle. We read the
            packets so you don&apos;t have to.
          </p>
        </div>
      </section>

      <section className="bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          {digests.length === 0 ? (
            <div className="bg-white border border-sand-200 rounded-xl p-8 text-center">
              <p className="font-display text-xl font-bold text-navy-900 mb-2">
                Coming soon.
              </p>
              <p className="text-sm text-navy-600 font-light leading-relaxed max-w-md mx-auto">
                Council Watch publishes digests after each Port
                Aransas city meeting. The first batch goes live once
                the Monday-morning scrape catches its first meeting
                cycle.
              </p>
              <p className="text-xs text-navy-500 font-light mt-4">
                In the meantime, raw agendas + minutes live at the
                city's CivicWeb portal:{" "}
                <a
                  href="https://cityofportaransas.civicweb.net/Portal/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-coral-600 underline decoration-coral-300"
                >
                  cityofportaransas.civicweb.net
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {grouped.map((g) => (
                <div key={g.year}>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-4">
                    {g.year}
                  </p>
                  <div className="space-y-3">
                    {g.items.map((d) => (
                      <DigestCard key={d.id} d={d} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function DigestCard({
  d,
}: {
  d: Awaited<ReturnType<typeof getPublishedDigests>>[number];
}) {
  if (!d.digestSlug) return null;
  const dateStr = new Date(d.meetingDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const preview = d.digestMarkdown
    ? d.digestMarkdown.replace(/^#+\s+/gm, "").slice(0, 240)
    : "";
  return (
    <Link
      href={`/council-watch/${d.digestSlug}`}
      className="block bg-white border border-sand-200 rounded-xl p-5 hover:border-coral-400 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
          {d.meetingType}
        </p>
        <p className="text-xs text-navy-500 font-mono shrink-0">
          {dateStr}
        </p>
      </div>
      {d.title && (
        <p className="font-display text-lg font-bold text-navy-900 leading-tight mb-2">
          {d.title}
        </p>
      )}
      {preview && (
        <p className="text-sm text-navy-600 font-light leading-relaxed">
          {preview}
          {d.digestMarkdown && d.digestMarkdown.length > 240 ? "…" : ""}
        </p>
      )}
      <div className="flex items-center gap-2 mt-3 text-[11px] text-navy-500 font-mono">
        {d.youtubeUrl && <span>📺 video</span>}
        {d.agendaUrl && <span>· agenda</span>}
        {d.minutesUrl && <span>· minutes</span>}
        <span className="ml-auto text-coral-600">Read →</span>
      </div>
    </Link>
  );
}

function groupByYear(
  items: Awaited<ReturnType<typeof getPublishedDigests>>,
): Array<{ year: number; items: typeof items }> {
  const map = new Map<number, typeof items>();
  for (const i of items) {
    const y = new Date(i.meetingDate).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(i);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}
