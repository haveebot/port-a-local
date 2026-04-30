import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { getMeetingBySlug } from "@/data/council-store";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMeetingBySlug(slug);
  if (!m || m.status !== "published") return { title: "Not found" };
  const date = new Date(m.meetingDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return {
    title: `${m.meetingType} · ${date} — Port A Local`,
    description: m.digestMarkdown
      ? m.digestMarkdown.replace(/^#+\s+/gm, "").slice(0, 160)
      : `Port A Local digest of the Port Aransas ${m.meetingType} on ${date}.`,
  };
}

/**
 * `/council-watch/[slug]` — single digest page.
 *
 * Renders the published digest markdown, embeds the YouTube recording
 * if available, links to the source PDF agendas + minutes, and
 * cross-links back to the index. Defensive on schema-not-ready.
 */
export default async function CouncilDigestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMeetingBySlug(slug);
  if (!m || m.status !== "published") notFound();

  const longDate = new Date(m.meetingDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const youtubeEmbedId = extractYoutubeId(m.youtubeUrl);

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-28 pb-12 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/council-watch"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-3 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Council Watch
            </span>
          </Link>
          <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-2">
            {m.meetingType}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 leading-[1.1] tracking-tight">
            {m.title ?? `${m.meetingType} — ${longDate}`}
          </h1>
          <p className="text-sm text-navy-200 font-mono mt-3">
            {longDate}
          </p>
        </div>
      </section>

      <article className="py-12 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* YouTube embed (when available) — sits above the digest so
              the reader can pull up the live record alongside our take. */}
          {youtubeEmbedId && (
            <div className="mb-10">
              <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-2">
                Watch the meeting
              </p>
              <div className="relative w-full aspect-video bg-navy-900 border border-sand-200 rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
                  title={`${m.meetingType} — ${longDate}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="text-[11px] text-navy-500 font-light mt-2">
                Source:{" "}
                <a
                  href={m.youtubeUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-coral-300 hover:text-coral-700"
                >
                  City of Port Aransas YouTube channel
                </a>
              </p>
            </div>
          )}

          {/* Digest body */}
          {m.digestMarkdown && (
            <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8">
              <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-3">
                The digest
              </p>
              {/* Light-touch markdown rendering — preserves paragraph
                  breaks + basic emphasis. We avoid pulling a markdown
                  parser into the bundle by handling the common cases
                  inline. */}
              <DigestBody markdown={m.digestMarkdown} />
              {m.authoredBy && (
                <p className="text-[11px] text-navy-500 font-light mt-6">
                  — {m.authoredBy}, Port A Local
                </p>
              )}
            </div>
          )}

          {/* Source links */}
          <div className="bg-navy-900 text-sand-100 border border-coral-500/20 rounded-2xl p-6 mt-8">
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-3">
              Read the source documents
            </p>
            <ul className="space-y-2 text-sm">
              {m.agendaUrl && (
                <li>
                  →{" "}
                  <a
                    href={m.agendaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-coral-300 underline decoration-coral-400/40 hover:text-coral-200"
                  >
                    Official agenda (PDF)
                  </a>
                </li>
              )}
              {m.minutesUrl && (
                <li>
                  →{" "}
                  <a
                    href={m.minutesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-coral-300 underline decoration-coral-400/40 hover:text-coral-200"
                  >
                    Official minutes (PDF)
                  </a>
                </li>
              )}
              {m.civicwebUrl && (
                <li>
                  →{" "}
                  <a
                    href={m.civicwebUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-coral-300 underline decoration-coral-400/40 hover:text-coral-200"
                  >
                    Full meeting page on cityofportaransas.civicweb.net
                  </a>
                </li>
              )}
              {!m.agendaUrl && !m.minutesUrl && !m.civicwebUrl && (
                <li className="text-sand-400 font-light">
                  Source documents not yet posted by the city.
                </li>
              )}
            </ul>
          </div>

          {/* Editorial caveat — preserves PAL voice + accountability */}
          <p className="text-xs text-navy-500 font-light mt-8 leading-relaxed max-w-2xl">
            <strong className="text-navy-700">Note:</strong> Council
            Watch digests are PAL editorial summaries. The official
            record lives in the city's minutes and meeting video,
            linked above. Where our digest and the official record
            differ, the official record wins.
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/council-watch"
              className="text-sm text-coral-600 underline decoration-coral-300 hover:decoration-coral-500"
            >
              ← All Council Watch digests
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

/**
 * Light-touch markdown body renderer. Handles paragraphs, basic
 * emphasis (**bold** + *italic*), and bulleted lists. Heavier
 * markdown lives in Heritage / Dispatch templates; Council Watch
 * digests are short and benefit from this leaner path.
 */
function DigestBody({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-base text-navy-700 leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        // Heading: starts with #
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/m);
        if (headingMatch) {
          const lvl = headingMatch[1].length;
          const text = headingMatch[2];
          if (lvl === 1) {
            return (
              <h2
                key={i}
                className="font-display text-2xl font-bold text-navy-900 mt-2"
              >
                {renderInline(text)}
              </h2>
            );
          }
          return (
            <h3
              key={i}
              className="font-display text-lg font-bold text-navy-900 mt-2"
            >
              {renderInline(text)}
            </h3>
          );
        }
        // Bullet list: lines starting with - or *
        if (/^([-*])\s+/.test(trimmed)) {
          const items = trimmed
            .split(/\n/)
            .map((l) => l.replace(/^([-*])\s+/, ""))
            .filter(Boolean);
          return (
            <ul key={i} className="list-disc pl-6 space-y-1.5">
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        // Plain paragraph
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Naive but sufficient: split on **bold**, *italic*, and stitch back.
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/;
  let m: RegExpExecArray | null;
  while ((m = re.exec(remaining)) !== null) {
    if (m.index > 0) parts.push(remaining.slice(0, m.index));
    if (m[2] !== undefined) {
      parts.push(<strong key={++key}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={++key}>{m[3]}</em>);
    }
    remaining = remaining.slice(m.index + m[0].length);
  }
  if (remaining) parts.push(remaining);
  return parts;
}

function extractYoutubeId(url: string | null): string | null {
  if (!url) return null;
  // Common patterns:
  //   https://youtu.be/VIDEO_ID
  //   https://www.youtube.com/watch?v=VIDEO_ID
  //   https://www.youtube.com/embed/VIDEO_ID
  //   https://www.youtube.com/live/VIDEO_ID
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/(?:watch\?v=|embed\/|live\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}
