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
import EventCountdown from "@/components/EventCountdown";
import EventOrganizerClaim from "@/components/EventOrganizerClaim";
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

          {/* Live countdown — hero scale */}
          <div className="mb-6">
            <EventCountdown
              startISO={event.startISO}
              endISO={event.endISO}
            />
          </div>

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
          <section id="schedule" className="mb-14 scroll-mt-24">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Run of show
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Schedule
            </h2>
            <p className="text-sm text-navy-500 font-light mb-6">
              Updated as we hear from the host. Check back the day before
              for any wind-driven changes.
            </p>
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

          {/* Beach cams covering the festival stretch */}
          {content.beachCams && content.beachCams.length > 0 && (
            <section className="mb-14">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                Watch from anywhere
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
                Beach cams covering the flag line
              </h2>
              <p className="text-sm text-navy-500 font-light mb-6">
                Curated subset of Port A&apos;s live cams that point at the
                south-end stretch where the festival sets up. HDOnTap
                opens in a new tab.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {content.beachCams.map((cam) => (
                  <a
                    key={cam.name}
                    href={cam.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white border border-sand-200 rounded-xl p-4 hover:border-coral-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-display font-bold text-navy-900 group-hover:text-coral-600 transition-colors text-sm leading-snug">
                        {cam.name}
                      </h3>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-coral-500 uppercase tracking-widest whitespace-nowrap">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral-500" />
                        </span>
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-navy-600 font-light leading-relaxed mb-2">
                      {cam.description}
                    </p>
                    <p className="text-[11px] text-navy-400 font-mono">
                      {cam.markerRange}
                    </p>
                  </a>
                ))}
              </div>
              <p className="text-xs text-navy-400 font-light mt-4">
                See all 10 cams + tides + ship traffic at{" "}
                <Link
                  href="/live"
                  className="text-coral-600 underline decoration-coral-200 hover:decoration-coral-500"
                >
                  Island Pulse
                </Link>
                .
              </p>
            </section>
          )}

          {/* Host timeline */}
          {content.hostTimeline && content.hostTimeline.length > 0 && host && (
            <section className="mb-14">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                A Port A staple
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
                {host.name} — four decades on Avenue G
              </h2>
              <p className="text-sm text-navy-500 font-light mb-8">
                The shop is older than the festival in its current shape.
                Here&apos;s how it got here.
              </p>
              <ol className="relative border-l-2 border-coral-200 ml-3 space-y-7">
                {content.hostTimeline.map((entry, i) => (
                  <li key={i} className="pl-6 relative">
                    <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-sand-50 border-2 border-coral-500 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-coral-500" />
                    </span>
                    <p className="text-xs font-mono font-semibold tracking-widest text-coral-600 uppercase">
                      {entry.year}
                    </p>
                    <p className="font-display font-bold text-navy-900 text-lg mt-1">
                      {entry.title}
                    </p>
                    <p className="text-sm text-navy-600 font-light leading-relaxed mt-1.5">
                      {entry.body}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-10 pl-6 border-l-2 border-coral-400">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-coral-600 mb-2">
                  Why this page exists
                </p>
                <p className="text-base sm:text-lg font-display font-bold text-navy-900 leading-snug">
                  Three years in is when an event stops being a maybe and
                  becomes the thing locals plan around. We&apos;re hosting
                  the festival here because the {host.name} crew earned it
                  — and because every event on this island deserves a
                  digital home that isn&apos;t a Facebook post.
                </p>
              </div>
            </section>
          )}

          {/* Photo submission CTA — open now for past-year, reframes day-of */}
          <section className="mb-14">
            <div className="bg-gradient-to-br from-coral-500/10 via-sand-50 to-coral-500/5 border-2 border-coral-300/50 rounded-2xl p-6 sm:p-8">
              <p className="text-coral-600 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
                Send us your kite shot
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                Got a photo from a past festival?
              </h2>
              <p className="text-base text-navy-700 font-light leading-relaxed mb-2 max-w-2xl">
                We&apos;re collecting photos from previous Spring, Fall, and
                Winter flies — anything from the past few years that captures
                what this weekend actually looks like. They&apos;ll feature
                in the gallery on this page leading up to May 9.
              </p>
              <p className="text-sm text-navy-500 font-light leading-relaxed mb-5 max-w-2xl">
                Day-of, the same inbox loads photos in real time. Tag your
                kite, the year, and your name (or stay anonymous).
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:hello@theportalocal.com?subject=Kite%20Festival%20photo%20%E2%80%94%20${encodeURIComponent(
                    event.name,
                  )}&body=Year%20of%20photo%3A%20%0AYour%20name%20(optional)%3A%20%0ACaption%20(optional)%3A%20%0A%0AAttach%20up%20to%204%20photos%20to%20this%20email.%20We'll%20feature%20them%20on%20theportalocal.com%2Fevents%2Fspring-kite-festival-2026.`}
                  className="px-6 py-3 rounded-xl text-sm font-semibold btn-coral inline-flex items-center gap-2"
                >
                  Email a photo
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </a>
                <Link
                  href="/photos"
                  className="px-6 py-3 rounded-xl text-sm font-semibold border border-navy-200 text-navy-700 hover:bg-navy-50 transition-colors"
                >
                  Or use the gallery uploader
                </Link>
              </div>
              <p className="text-xs text-navy-400 font-light mt-4">
                We won&apos;t publish your email or full name unless you ask
                us to. Anonymous is the default.
              </p>
            </div>
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

      {/* "Are you the organizer?" — claim/contact CTA */}
      <EventOrganizerClaim eventSlug={event.slug} eventName={event.name} />

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
