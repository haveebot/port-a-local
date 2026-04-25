import Link from "next/link";
import { archivePhotos } from "@/data/archives";
import type { TournamentResults } from "@/data/tournament-results";

/**
 * Renders a curated strip of period photos relevant to the tournament's
 * history. Photos are referenced by ID from src/data/archives.ts so we
 * keep one source of truth for the imagery + attribution. Optional
 * caption/year overrides re-frame an existing archive photo for
 * tournament context without duplicating the data.
 *
 * Empty state covered by guarding the section in the parent.
 */
export default function HistoricalPhotosShelf({
  refs,
  archiveLabel = "See full archive",
}: {
  refs: NonNullable<TournamentResults["historicalPhotos"]>;
  archiveLabel?: string;
}) {
  // Resolve refs against archives.ts; drop unresolved
  const resolved = refs
    .map((ref) => ({
      ref,
      photo: archivePhotos.find((p) => p.id === ref.archiveId),
    }))
    .filter((item): item is { ref: typeof refs[number]; photo: typeof archivePhotos[number] } =>
      Boolean(item.photo),
    );

  if (resolved.length === 0) return null;

  return (
    <div>
      {/* Photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolved.map(({ ref, photo }) => (
          <a
            key={ref.archiveId}
            href={photo.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white border border-sand-200 rounded-xl overflow-hidden hover:border-coral-300 hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] bg-sand-100 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-navy-900/85 text-sand-100 backdrop-blur-sm">
                {ref.year ?? photo.date}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-navy-900 text-sm leading-snug mb-2 group-hover:text-coral-600 transition-colors">
                {photo.title}
              </h3>
              <p className="text-xs text-navy-600 font-light leading-relaxed mb-3 line-clamp-4">
                {ref.caption ?? photo.description}
              </p>
              <p className="text-[10px] text-navy-400 font-mono uppercase tracking-wider">
                {photo.source}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* See full archive link */}
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-navy-500 font-light">
          {resolved.length} of many. The full Port Aransas photo archive
          spans 1853–2017.
        </p>
        <Link
          href="/archives"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-coral-600 hover:text-coral-700"
        >
          {archiveLabel}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
