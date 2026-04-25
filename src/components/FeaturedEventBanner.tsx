import Link from "next/link";
import { getFeaturedEvents } from "@/data/events";
import EventCountdown from "@/components/EventCountdown";
import { EmojiIcon } from "@/components/brand/PortalIcon";

/**
 * Renders the next upcoming featured event as a homepage banner.
 * Returns null when no featured event is in flight, so the homepage
 * stays clean off-season.
 */
export default function FeaturedEventBanner() {
  const featured = getFeaturedEvents();
  if (featured.length === 0) return null;

  // Pick the soonest one whose end is in the future
  const now = Date.now();
  const upcoming = featured
    .filter((e) => new Date(e.endISO).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.startISO).getTime() - new Date(b.startISO).getTime(),
    );

  if (upcoming.length === 0) return null;
  const event = upcoming[0];

  return (
    <section className="relative bg-navy-900 border-y border-coral-500/20">
      {/* Subtle coral wash */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 50%, rgba(232,101,111,0.18), transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-xs font-semibold tracking-widest uppercase mb-4">
              <EmojiIcon emoji={event.icon} className="w-3.5 h-3.5" />
              Now hosting · local event
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-sand-50 leading-tight mb-3">
              {event.name}
            </h2>

            <p className="text-base sm:text-lg text-navy-200 font-light leading-relaxed max-w-2xl mb-5">
              {event.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-300 mb-6">
              <span className="font-semibold text-sand-100">
                {event.dateLabel}
              </span>
              <span className="text-navy-500">·</span>
              <span>{event.venueName}</span>
              <span className="text-navy-500">·</span>
              <span className="text-coral-300 font-semibold">
                {event.cost}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/events/${event.slug}`}
                className="px-6 py-3 rounded-xl text-sm font-semibold btn-coral inline-flex items-center gap-2"
              >
                See the full hub
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
              <Link
                href={`/events/${event.slug}#schedule`}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors"
              >
                See the schedule
              </Link>
            </div>
          </div>

          <div className="lg:flex-shrink-0">
            <EventCountdown
              startISO={event.startISO}
              endISO={event.endISO}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
