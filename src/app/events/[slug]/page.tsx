import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { events, getEventBySlug } from "@/data/events";
import { eventContent } from "@/data/event-content";
import { businesses } from "@/data/businesses";
import {
  EventSchema,
  BreadcrumbListSchema,
} from "@/components/StructuredData";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { EmojiIcon } from "@/components/brand/PortalIcon";
import type { Metadata } from "next";

export function generateStaticParams() {
  return events
    .filter((e) => e.published && eventContent[e.slug])
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return {
    title: `${event.name} | Port A Local`,
    description: event.description,
    openGraph: {
      title: event.name,
      description: event.tagline,
      type: "website",
    },
  };
}

function googleCalendarUrl(event: ReturnType<typeof getEventBySlug>): string {
  if (!event) return "#";
  // Google Calendar wants UTC YYYYMMDDTHHMMSSZ
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    details: `${event.tagline}\n\nFull details: https://theportalocal.com/events/${event.slug}`,
    location: event.venueAddress,
    dates: `${fmt(event.startISO)}/${fmt(event.endISO)}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function icsHref(event: ReturnType<typeof getEventBySlug>): string {
  if (!event) return "#";
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Port A Local//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.slug}@theportalocal.com`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(event.startISO)}`,
    `DTEND:${fmt(event.endISO)}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.tagline}`,
    `LOCATION:${event.venueAddress}`,
    `URL:https://theportalocal.com/events/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  const content = eventContent[slug];

  if (!event || !content || !event.published) {
    notFound();
  }

  const host = event.hostBusinessSlug
    ? businesses.find((b) => b.slug === event.hostBusinessSlug)
    : undefined;

  const countdown = daysUntil(event.startISO);
  const startDate = new Date(event.startISO).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${event.coordinates[0]},${event.coordinates[1]}`;

  return (
    <main className="min-h-screen">
      <EventSchema event={event} />
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: event.name, path: `/events/${event.slug}` },
        ]}
      />
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-navy-300 mb-6">
            <Link
              href="/events"
              className="hover:text-coral-300 transition-colors"
            >
              Events
            </Link>
            <span>/</span>
            <span className="text-navy-200">May 2026</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <EmojiIcon emoji={event.icon} className="w-4 h-4" />
            Event · {event.cost}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-sand-50 mb-4 leading-tight">
            {event.name}
          </h1>

          <p className="text-lg sm:text-xl text-navy-200 font-light leading-relaxed mb-8 max-w-3xl">
            {event.tagline}
          </p>

          {/* When/Where pill row */}
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <div className="px-4 py-2 rounded-lg bg-navy-800/60 border border-navy-700/60 text-sand-100">
              <span className="text-navy-400 mr-2">When</span>
              <span className="font-semibold">{event.dateLabel}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-navy-800/60 border border-navy-700/60 text-sand-100">
              <span className="text-navy-400 mr-2">Where</span>
              <span className="font-semibold">{event.venueName}</span>
            </div>
            {countdown > 0 && (
              <div className="px-4 py-2 rounded-lg bg-coral-500/15 border border-coral-500/30 text-coral-200">
                <span className="font-semibold tabular-nums">{countdown}</span>
                <span className="text-coral-300/80 ml-1">
                  day{countdown === 1 ? "" : "s"} away
                </span>
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-coral-500 hover:bg-coral-600 text-white transition-colors"
            >
              Add to Google Calendar
            </a>
            <a
              href={icsHref(event)}
              download={`${event.slug}.ics`}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-sand-100 border border-white/20 transition-colors"
            >
              Download .ics
            </a>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-sand-100 border border-white/20 transition-colors"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </section>

      {/* Lede */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-lg sm:text-xl text-navy-700 leading-relaxed font-light mb-12 first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-coral-500 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            {content.lede}
          </p>

          <div className="coral-line max-w-xs mb-12" />

          {/* What to expect */}
          <section className="mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              The Day
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
              What to expect
            </h2>
            {content.whatToExpect.map((p, i) => (
              <p
                key={i}
                className="text-base sm:text-lg text-navy-700 leading-relaxed mb-5 font-light"
              >
                {p}
              </p>
            ))}
          </section>

          {/* Schedule */}
          <section className="mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Run of show
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
              Schedule
            </h2>
            <ol className="relative border-l-2 border-coral-200 ml-3 space-y-6">
              {content.schedule.map((s, i) => (
                <li key={i} className="pl-6 relative">
                  <span className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-coral-500 border-2 border-sand-50" />
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-coral-600">
                    {s.time}
                  </p>
                  <p className="font-display font-bold text-navy-900 mt-1">
                    {s.label}
                  </p>
                  <p className="text-sm text-navy-600 font-light leading-relaxed mt-1">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Good to know */}
          <section className="mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Plan ahead
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
              Good to know
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {content.goodToKnow.map((g) => (
                <div key={g.label}>
                  <dt className="text-sm font-semibold text-navy-900 mb-1">
                    {g.label}
                  </dt>
                  <dd className="text-sm text-navy-600 font-light leading-relaxed">
                    {g.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Day-of coverage */}
          <section className="mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Day-of coverage
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
              Live from the beach
            </h2>
            {content.liveLog.length === 0 ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-6">
                <p className="text-sm text-navy-700 font-light leading-relaxed">
                  This page goes live the morning of {startDate}. Photos,
                  conditions, kite-of-the-hour highlights, and any
                  schedule updates will land here in real time. If you&apos;re
                  on the beach and want a kite featured, email{" "}
                  <a
                    href="mailto:hello@theportalocal.com?subject=Kite%20Festival%20photo"
                    className="text-coral-600 font-semibold underline decoration-coral-200 hover:decoration-coral-500"
                  >
                    hello@theportalocal.com
                  </a>{" "}
                  with a photo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {content.liveLog.map((entry, i) => (
                  <article
                    key={i}
                    className="bg-white border border-sand-200 rounded-xl p-5"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-display font-bold text-navy-900">
                        {entry.title}
                      </h3>
                      <time
                        dateTime={entry.timestamp}
                        className="text-xs text-navy-400 tabular-nums"
                      >
                        {new Date(entry.timestamp).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit" },
                        )}
                      </time>
                    </div>
                    <p className="text-sm text-navy-700 font-light leading-relaxed">
                      {entry.body}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* FAQ */}
          <section className="mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Questions
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
              Frequently asked
            </h2>
            <div className="divide-y divide-sand-200 border-y border-sand-200">
              {content.faq.map((f, i) => (
                <details key={i} className="group py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="font-semibold text-navy-900">{f.q}</span>
                    <span className="text-coral-500 text-xl leading-none transform group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-navy-600 font-light leading-relaxed mt-3">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </article>

      {/* Host card */}
      {host && (
        <section className="py-16 bg-sand-50 border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Hosted by
            </p>
            <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
              <div className="flex items-start gap-5 mb-5">
                <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0 text-navy-700">
                  <EmojiIcon emoji={event.icon} className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    {host.name}
                  </h3>
                  <p className="text-sm text-navy-500 font-light mt-1">
                    {host.tagline}
                  </p>
                </div>
              </div>
              {content.hostBlurb.map((p, i) => (
                <p
                  key={i}
                  className="text-sm sm:text-base text-navy-700 font-light leading-relaxed mb-4"
                >
                  {p}
                </p>
              ))}
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href={`/${host.category}/${host.slug}`}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-navy-900 text-sand-50 hover:bg-navy-800 transition-colors"
                >
                  Visit {host.name} on PAL
                </Link>
                {host.website && (
                  <a
                    href={host.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-navy-200 text-navy-700 hover:bg-navy-50 transition-colors"
                  >
                    flyitporta.com
                  </a>
                )}
                {host.phone && (
                  <a
                    href={`tel:${host.phone.replace(/\D/g, "")}`}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-navy-200 text-navy-700 hover:bg-navy-50 transition-colors"
                  >
                    {host.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Signature seal */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center gap-4 border-y border-sand-200 py-12">
            <LighthouseMark size={72} variant="dark" detail="standard" />
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-navy-500">
              Hosted on Port A Local
            </p>
            <p className="text-xs text-navy-400 font-light max-w-md leading-relaxed">
              Local events, posted by the people who run them, covered by the
              people who show up. <span className="font-mono">27°50′N 97°03′W</span>
            </p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-navy-500 hover:text-navy-700 transition-colors list-none flex items-center gap-2">
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Sources ({content.sources.length})
            </summary>
            <ol className="mt-4 space-y-2 text-sm text-navy-500 list-decimal list-inside">
              {content.sources.map((source, i) => (
                <li key={i}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400 transition-colors"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      {/* Back to events */}
      <section className="py-12 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/events"
            className="text-sm font-medium text-navy-500 hover:text-coral-500 transition-colors"
          >
            ← All events
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
