import type { CaptainSpotlight as CaptainData } from "@/data/tournament-results";

/**
 * Pre-event "boats to watch" card. Stays useful through the
 * tournament — when leaderboards fill in, this becomes a quick
 * reference for "wait, who's that boat?"
 */
export default function CaptainSpotlight({ captain }: { captain: CaptainData }) {
  return (
    <article className="bg-white border border-sand-200 rounded-2xl overflow-hidden flex flex-col h-full">
      {captain.photo && (
        <div className="aspect-[16/10] bg-sand-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={captain.photo}
            alt={`${captain.name} aboard ${captain.boat}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {captain.watchFor && (
          <p className="text-coral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
            Watch for · {captain.watchFor}
          </p>
        )}
        <h3 className="font-display text-xl font-bold text-navy-900 mb-1">
          {captain.name}
        </h3>
        <p className="text-sm text-navy-500 font-light italic mb-3">
          {captain.boat}
          {captain.boatDetail && (
            <span className="text-navy-400"> · {captain.boatDetail}</span>
          )}
        </p>

        {captain.homePort && (
          <p className="text-xs text-navy-500 font-mono mb-4">
            {captain.homePort}
          </p>
        )}

        {captain.divisions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {captain.divisions.map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-sand-100 text-navy-700 border border-sand-200"
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2.5 flex-1">
          {captain.bio.map((p, i) => (
            <p
              key={i}
              className="text-sm text-navy-700 font-light leading-relaxed"
            >
              {p}
            </p>
          ))}
        </div>

        {captain.priorWins && captain.priorWins.length > 0 && (
          <div className="mt-4 pt-4 border-t border-sand-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-navy-400 mb-2">
              Prior wins
            </p>
            <ul className="text-xs text-navy-600 font-light space-y-1">
              {captain.priorWins.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-coral-500 flex-shrink-0">▸</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
