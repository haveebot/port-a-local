import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createHash } from "crypto";
import PortalIcon, { EmojiIcon } from "@/components/brand/PortalIcon";
import {
  CURRENT_WEEK,
  VENUES,
  todayInCentral,
  actsByDate,
  actsThisWeek,
  formatWeekday,
  formatDateLong,
  formatDateShort,
  liveMusicHeadline,
  weekIsStale,
  type LiveMusicAct,
} from "@/data/live-music";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const h = liveMusicHeadline();
  // Cache-bust the og:image URL with a data-derived fingerprint. FB caches
  // image bytes against the og:image URL forever — Sharing Debugger
  // refreshes page metadata but does NOT re-fetch image bytes for an
  // unchanged URL. Ship May 3 PM after two posts with stale OG images
  // proved this empirically. The auto-generated PNG route ignores the ?v=
  // query, so this is purely a URL-change signal to FB.
  const ogFingerprint = createHash("sha1")
    .update(
      JSON.stringify({
        iso: h.iso,
        count: h.count,
        framing: h.framing,
        topActs: h.topActs.map((a) => `${a.venue}:${a.artist}`),
      }),
    )
    .digest("hex")
    .slice(0, 10);
  return {
    title: `${h.title} | Port A Local`,
    description: h.description,
    alternates: { canonical: "https://theportalocal.com/live-music" },
    openGraph: {
      title: `${h.title} | Port A Local`,
      description: h.description,
      images: [
        {
          url: `https://theportalocal.com/live-music/opengraph-image?v=${ogFingerprint}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

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
  const stale = weekIsStale(CURRENT_WEEK, today);
  const days = stale ? [] : actsThisWeek(CURRENT_WEEK, today);
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
      <section className="relative pt-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/live-music-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-navy-900/15" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="flex justify-center mb-4 sm:mb-5">
            <PortalIcon
              name="music"
              className="w-12 h-12 sm:w-16 sm:h-16 text-coral-300"
            />
          </div>
          <p className="text-sand-50 text-[11px] sm:text-sm font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-5">
            Explore <span className="mx-1">•</span> Live Music
          </p>
          <div className="h-0.5 bg-sand-50 max-w-[200px] sm:max-w-md mx-auto" />
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-sand-50 py-5 sm:py-8">
            Live{" "}
            <span className="italic text-coral-300">Music</span>{" "}
            Tonight
          </h1>
          <div className="h-0.5 bg-sand-50 max-w-[200px] sm:max-w-md mx-auto" />
          <p className="text-sm sm:text-lg text-sand-50 font-light max-w-xl mx-auto mt-5 sm:mt-6 px-4">
            Who&apos;s playing where, across the island&apos;s stages.
          </p>
        </div>
      </section>

      {/* Between schedules — the printed week has lapsed; show where the
          music happens instead of a dated, empty listing. */}
      {stale && (
        <section className="py-12 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
                In Season
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                Music Nearly Every Night
              </h2>
              <p className="text-sm sm:text-base text-navy-600 leading-relaxed max-w-2xl">
                The weekly schedule is between printings — but in season, live
                music is a near-nightly thing on the island. These are the
                stages where it happens. Swing by, or check a venue&apos;s page
                before you head out.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.values(VENUES).map((v) =>
                v.directoryHref ? (
                  <Link
                    key={v.slug}
                    href={v.directoryHref}
                    className="bg-white rounded-xl border border-sand-200 p-4 font-display text-base font-semibold text-navy-900 hover:border-coral-300 transition-colors"
                  >
                    {v.name}
                    <span className="block text-xs font-sans font-normal text-coral-600 mt-0.5">
                      View listing →
                    </span>
                  </Link>
                ) : (
                  <div
                    key={v.slug}
                    className="bg-white rounded-xl border border-sand-200 p-4 font-display text-base font-semibold text-navy-900"
                  >
                    {v.name}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}

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
              {stale ? (
                <>
                  Schedules are printed weekly — this page updates when the new
                  week posts. Port Aransas venues only. Know what&apos;s coming
                  up, or got a correction?
                </>
              ) : (
                <>
                  {CURRENT_WEEK.sourcedFrom}. Port Aransas venues only — mainland Corpus,
                  Portland, and Fulton listings from the same roundup are filtered out.
                  Schedules are printed weekly and may shift. Got a correction?
                </>
              )}{" "}
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
