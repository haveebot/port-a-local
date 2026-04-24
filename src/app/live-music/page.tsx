import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/brand/PortalIcon";
import {
  CURRENT_WEEK,
  VENUES,
  todayInCentral,
  actsByDate,
  actsThisWeek,
  formatWeekday,
  formatDateLong,
  formatDateShort,
  type LiveMusicAct,
} from "@/data/live-music";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Live Music Tonight — Port Aransas, TX | Port A Local",
  description:
    "Who's playing where tonight and this week in Port Aransas. The Gaff, Shorty's, Bron's, Treasure Island, Sip Yard, VFW, Salty Dog — all in one place.",
  alternates: { canonical: "https://theportalocal.com/live-music" },
};

function ActCard({ act, emphasize = false }: { act: LiveMusicAct; emphasize?: boolean }) {
  const venue = VENUES[act.venue];
  const venueEl = venue?.directoryHref ? (
    <Link href={venue.directoryHref} className="text-coral-600 hover:text-coral-700 hover:underline decoration-coral-300 underline-offset-2">
      {venue.name}
    </Link>
  ) : (
    <span className="text-navy-700">{venue?.name ?? act.venue}</span>
  );

  const metaBits: string[] = [];
  if (act.time) metaBits.push(act.time);
  if (act.cover) metaBits.push(`Cover ${act.cover}`);
  if (act.ageRestriction) metaBits.push(act.ageRestriction);

  return (
    <div
      className={
        emphasize
          ? "bg-white rounded-xl border-2 border-coral-400/50 p-5 shadow-sm"
          : "bg-white rounded-xl border border-sand-200 p-4"
      }
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className={emphasize ? "font-display text-lg font-bold text-navy-900" : "font-display text-base font-semibold text-navy-900"}>
            {act.artist}
          </div>
          <div className="text-sm text-navy-600 mt-0.5">
            at {venueEl}
          </div>
        </div>
        {metaBits.length > 0 && (
          <div className="text-xs font-medium text-navy-500 whitespace-nowrap">
            {metaBits.join(" · ")}
          </div>
        )}
      </div>
      {act.notes && (
        <div className="mt-2 text-xs text-navy-500 italic">{act.notes}</div>
      )}
    </div>
  );
}

function DaySection({ iso, acts, isToday }: { iso: string; acts: LiveMusicAct[]; isToday: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-coral-100">
        <h3 className="font-display text-lg font-bold text-navy-900">
          {isToday ? (
            <>
              <span className="text-coral-600">Tonight</span>{" "}
              <span className="text-navy-500 font-normal text-sm">· {formatDateLong(iso)}</span>
            </>
          ) : (
            formatDateLong(iso)
          )}
        </h3>
      </div>
      {acts.length === 0 ? (
        <p className="text-sm text-navy-500 italic">No shows listed{isToday ? " tonight" : ""}.</p>
      ) : (
        <div className={isToday ? "space-y-3" : "space-y-2"}>
          {acts.map((act, i) => (
            <ActCard key={`${act.date}-${act.venue}-${act.artist}-${i}`} act={act} emphasize={isToday} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LiveMusicPage() {
  const today = todayInCentral();
  const days = actsThisWeek(CURRENT_WEEK, today);
  const tonightDay = days[0];
  const restOfWeek = days.slice(1);

  const afterWeek = new Date(CURRENT_WEEK.weekOf + "T12:00:00-05:00");
  afterWeek.setDate(afterWeek.getDate() + 7);
  const afterWeekIso = afterWeek.toISOString().slice(0, 10);
  const upcomingBeyondWeek = (CURRENT_WEEK.upcoming ?? []).filter((a) => a.date >= today && a.date >= afterWeekIso);
  const upcomingByDate = upcomingBeyondWeek.reduce<Record<string, LiveMusicAct[]>>((acc, act) => {
    (acc[act.date] ??= []).push(act);
    return acc;
  }, {});

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <EmojiIcon emoji="🎵" className="w-4 h-4 text-coral-300" />
            Live Music
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Live Music Tonight
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Who&apos;s playing where, across the island&apos;s stages. Updated weekly from the printed roundup.
          </p>
        </div>
      </section>

      {/* Tonight */}
      {tonightDay && (
        <section className="py-12 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <DaySection iso={tonightDay.iso} acts={tonightDay.acts} isToday={tonightDay.iso === today} />
          </div>
        </section>
      )}

      {/* Rest of the week */}
      {restOfWeek.length > 0 && (
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                This Week
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                The Rest of the Week
              </h2>
            </div>
            <div className="space-y-8">
              {restOfWeek.map((day) => (
                <DaySection key={day.iso} iso={day.iso} acts={day.acts} isToday={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming beyond the 7-day window */}
      {Object.keys(upcomingByDate).length > 0 && (
        <section className="py-12 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                Coming Up
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                Next Week &amp; Beyond
              </h2>
            </div>
            <div className="space-y-6">
              {Object.entries(upcomingByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([iso, acts]) => (
                  <div key={iso}>
                    <h3 className="font-display text-base font-bold text-navy-900 mb-2">
                      {formatWeekday(iso)} · {formatDateShort(iso)}
                    </h3>
                    <div className="space-y-2">
                      {acts.map((act, i) => (
                        <ActCard key={`${iso}-${act.venue}-${act.artist}-${i}`} act={act} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Source + notes */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-navy-50 rounded-xl border border-navy-100 p-6">
            <p className="text-xs font-semibold text-coral-600 uppercase tracking-widest mb-2">
              Source &amp; Scope
            </p>
            <p className="text-sm text-navy-700 leading-relaxed">
              {CURRENT_WEEK.sourcedFrom}. Port Aransas venues only — mainland Corpus,
              Portland, and Fulton listings from the same roundup are filtered out.
              Schedules are printed weekly and may shift. Got a correction?
              Email <a href="mailto:hello@theportalocal.com" className="text-coral-600 hover:underline">hello@theportalocal.com</a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Make It a Night
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            Pair a show with dinner, a beach sunset, or a cart ride back.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/eat" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Where to Eat
            </Link>
            <Link href="/drink" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Bars &amp; Venues
            </Link>
            <Link href="/rent" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Rent a Cart
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
