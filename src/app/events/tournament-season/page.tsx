import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import LighthouseMark from "@/components/brand/LighthouseMark";
import { BreadcrumbListSchema } from "@/components/StructuredData";
import { getSeasonMembersInOrder } from "@/data/tournament-season";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournament Season — Port Aransas's summer fishing fixture | Port A Local",
  description:
    "Tournament Season is Port Aransas's local handle for the summer fishing-tournament cluster — 20+ tournaments May through November, anchored by four marquee weekends in July and August. Comparison + history + how to plan a weekend.",
};

export default function TournamentSeasonPage() {
  const members = getSeasonMembersInOrder();

  return (
    <main className="min-h-screen">
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: "Tournament Season", path: "/events/tournament-season" },
        ]}
      />
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-navy-300 mb-6">
            <Link
              href="/events"
              className="hover:text-coral-300 transition-colors"
            >
              Events
            </Link>
            <span>/</span>
            <span className="text-navy-200">Tournament Season</span>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Port Aransas, summer
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4 leading-tight">
            Tournament Season
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light leading-relaxed max-w-3xl">
            From May through November, nearly every weekend on Mustang Island
            is stacked with a fishing tournament — sometimes two. Locals call
            it Tournament Season. Four of them are the marquee weekends; the
            rest of the calendar fills in around them.
          </p>
        </div>
      </section>

      {/* History blurb */}
      <section className="py-16 bg-sand-50 border-y border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            How the season got its name
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
            Almost a hundred years of summer tournaments
          </h2>

          <div className="space-y-5 text-base sm:text-lg text-navy-700 font-light leading-relaxed">
            <p>
              In 1932, twenty-five charter and commercial captains formed the
              Port Aransas Boatmen Association and ran a three-day tournament
              they called the Tarpon Rodeo. Barney Farley organized it. North
              Millican won the first perpetual trophy — though everyone in
              town knew it was his wife Totsy who actually landed the fish.
              The Tarpon Rodeo became the Deep Sea Roundup, and except for
              World War II and 2020, it&apos;s run every July since.
            </p>
            <p>
              Half a century later, in 1984, Pete Fox started the Texas
              Women Anglers Tournament — women fishing for women, with every
              dollar that didn&apos;t go to the winners going to the
              Women&apos;s Shelter of South Texas (now The Purple Door).
              Women-only fishing tournaments weren&apos;t a category yet.
              TWAT has been the matriarch of the category that grew up
              around it.
            </p>
            <p>
              The 2010s brought the modern era — Texas Legends Billfish
              Tournament with its $800K+ purse and Triple Crown circuit
              ambitions, and the Billfish Pachanga, a science-anchored
              limited-field tournament that funds the research institute
              studying the fish it chases. Together with DSR and TWAT, the
              four are the through-line of the summer. The other 20-plus
              tournaments on the calendar fill in around them.
            </p>
            <p className="text-sm text-navy-500 italic pt-2">
              The deeper story behind the original 1932 tournament lives at{" "}
              <Link
                href="/history/deep-sea-roundup"
                className="text-coral-600 underline decoration-coral-200 hover:decoration-coral-500"
              >
                /history/deep-sea-roundup
              </Link>{" "}
              — eight minutes, sourced.
            </p>
          </div>
        </div>
      </section>

      {/* The four marquee tournaments */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              The marquee four
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Calendar order, July through August
            </h2>
            <p className="text-sm text-navy-500 font-light max-w-2xl">
              Each one has its own personality. Click through for the full hub
              where it&apos;s built; tournaments without a hub yet are linked
              to their official site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {members.map((m, i) => (
              <article
                key={m.name}
                className="bg-white border border-sand-200 rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-coral-600">
                    #{i + 1} of the season
                  </span>
                  <span className="text-2xl" aria-hidden>
                    {m.icon}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-navy-900 leading-tight mb-1">
                  {m.name}
                </h3>
                {m.alias && (
                  <p className="text-xs text-navy-400 font-mono uppercase tracking-widest mb-3">
                    aka {m.alias}
                  </p>
                )}
                <p className="text-sm text-navy-700 font-light leading-relaxed mb-4">
                  {m.positioning}
                </p>
                <dl className="space-y-1.5 text-xs mb-4">
                  <div className="flex gap-2">
                    <dt className="text-navy-400 font-semibold uppercase tracking-wider w-20 flex-shrink-0">
                      2026
                    </dt>
                    <dd className="text-navy-700 font-medium">{m.dates2026}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-navy-400 font-semibold uppercase tracking-wider w-20 flex-shrink-0">
                      Founded
                    </dt>
                    <dd className="text-navy-700 font-medium">{m.founded}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-navy-400 font-semibold uppercase tracking-wider w-20 flex-shrink-0">
                      Org
                    </dt>
                    <dd className="text-navy-700 font-medium">
                      {m.sanctioning}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-navy-500 font-light leading-relaxed mb-5 italic flex-1">
                  {m.cultureNote}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {m.detailHref ? (
                    <Link
                      href={m.detailHref}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold btn-coral"
                    >
                      Full hub →
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sand-100 text-navy-500 border border-sand-200">
                      Hub coming
                    </span>
                  )}
                  <a
                    href={m.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-navy-200 text-navy-700 hover:bg-navy-50"
                  >
                    Official site
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* At-a-glance comparison */}
      <section className="py-16 bg-navy-900 relative">
        <div className="absolute inset-0 palm-pattern opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Side by side
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 mb-2">
              At a glance
            </h2>
            <p className="text-sm text-navy-300 font-light max-w-2xl">
              Same stretch of beach. Same town. Four very different
              tournaments. Scroll the table; on mobile each tournament gets
              its own column below.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-sand-100 border-collapse">
              <thead>
                <tr className="border-b border-coral-500/30">
                  <th className="py-3 pr-4 font-semibold text-coral-300 text-xs uppercase tracking-widest sticky left-0 bg-navy-900">
                    Attribute
                  </th>
                  {members.map((m) => (
                    <th
                      key={m.name}
                      className="py-3 px-4 font-display font-bold text-sand-50 text-base"
                    >
                      {m.alias ?? m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                <ComparisonRow label="2026 dates" values={members.map((m) => m.dates2026)} />
                <ComparisonRow label="Founded" values={members.map((m) => String(m.founded))} />
                <ComparisonRow label="Sanctioning" values={members.map((m) => m.sanctioning)} />
                <ComparisonRow label="Divisions" values={members.map((m) => m.divisions)} />
                <ComparisonRow label="Scoring" values={members.map((m) => m.scoring)} />
                <ComparisonRow label="Beneficiary" values={members.map((m) => m.beneficiary)} />
                <ComparisonRow label="Scale signal" values={members.map((m) => m.scaleSignal)} />
                <ComparisonRow label="Where to watch" values={members.map((m) => m.viewingNotes)} />
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet stacked */}
          <div className="lg:hidden space-y-6">
            {members.map((m) => (
              <div
                key={m.name}
                className="bg-navy-800/50 border border-coral-500/20 rounded-xl p-5"
              >
                <h3 className="font-display text-lg font-bold text-sand-50 mb-1">
                  {m.alias ?? m.name}
                </h3>
                <p className="text-xs text-navy-400 mb-4">{m.name}</p>
                <dl className="space-y-3 text-sm">
                  <StackedRow label="2026 dates" value={m.dates2026} />
                  <StackedRow label="Founded" value={String(m.founded)} />
                  <StackedRow label="Sanctioning" value={m.sanctioning} />
                  <StackedRow label="Divisions" value={m.divisions} />
                  <StackedRow label="Scoring" value={m.scoring} />
                  <StackedRow label="Beneficiary" value={m.beneficiary} />
                  <StackedRow label="Scale signal" value={m.scaleSignal} />
                  <StackedRow label="Where to watch" value={m.viewingNotes} />
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan a Tournament Season weekend */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
            For visitors
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-6">
            How to plan a Tournament Season weekend
          </h2>

          <div className="space-y-5 text-base text-navy-700 font-light leading-relaxed mb-8">
            <p>
              Watching is free. Every one of these tournaments runs a public
              weigh-in on Friday or Saturday evening, and most of them are
              followed by a Sunday awards ceremony that&apos;s also open to
              anyone who shows up. You don&apos;t need a boat, a registration,
              or an invitation — just a chair, a hat, and time.
            </p>
            <p>
              Pick the tournament for the vibe you want. DSR is family-and-
              tradition energy with kids&apos; events and 90 years of
              continuity. TWAT is the spectacle weekend — themed boats,
              mariachi on the bridges of multi-million-dollar yachts,
              costumes, the crowd cheering like Mardi Gras. Texas Legends is
              the big-purse, big-yacht professional energy. Pachanga is the
              quieter, smaller-field, science-funded edition.
            </p>
            <p>
              Book lodging early. July and August book out fast on Mustang
              Island; tournament weekends fill first. Anywhere on the island
              is walkable / golf-cartable to a weigh-in.
            </p>
            <p>
              Plan for ferry timing. Tournament weekends are high-traffic
              ferry weekends — expect a 30–60 minute wait Friday evening and
              Sunday morning, especially when two tournaments overlap. AM 530
              has live ferry status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/where-to-stay"
              className="block bg-sand-50 border border-sand-200 rounded-xl p-4 hover:border-coral-300 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral-600 mb-1">
                Step 1
              </p>
              <p className="font-display font-bold text-navy-900 text-sm">
                Where to stay →
              </p>
            </Link>
            <Link
              href="/essentials"
              className="block bg-sand-50 border border-sand-200 rounded-xl p-4 hover:border-coral-300 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral-600 mb-1">
                Step 2
              </p>
              <p className="font-display font-bold text-navy-900 text-sm">
                Island essentials (ferry, parking, beach permit) →
              </p>
            </Link>
            <Link
              href="/live"
              className="block bg-sand-50 border border-sand-200 rounded-xl p-4 hover:border-coral-300 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral-600 mb-1">
                Day-of
              </p>
              <p className="font-display font-bold text-navy-900 text-sm">
                Live conditions + cams →
              </p>
            </Link>
            <Link
              href="/eat"
              className="block bg-sand-50 border border-sand-200 rounded-xl p-4 hover:border-coral-300 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral-600 mb-1">
                After the weigh-in
              </p>
              <p className="font-display font-bold text-navy-900 text-sm">
                Where to eat →
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Signature seal */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center gap-4 border-y border-sand-200 py-12">
            <LighthouseMark size={72} variant="dark" detail="standard" />
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-navy-500">
              Tournament Season on Port A Local
            </p>
            <p className="text-xs text-navy-400 font-light max-w-md leading-relaxed">
              Local coverage of an island summer fixture. Every tournament
              gets the depth its history deserves.{" "}
              <span className="font-mono">27°50′N 97°03′W</span>
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
              Sources
            </summary>
            <ol className="mt-4 space-y-2 text-sm text-navy-500 list-decimal list-inside">
              <li>
                <a
                  href="https://deepsearoundup.org"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Deep Sea Roundup — official site
                </a>
              </li>
              <li>
                <a
                  href="https://texaswomenanglers.org/"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Texas Women Anglers Tournament — official site
                </a>
              </li>
              <li>
                <a
                  href="https://www.txlegends.com/"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Texas Legends Billfish Tournament — official site
                </a>
              </li>
              <li>
                <a
                  href="https://www.billfishpachanga.com/"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Billfish Pachanga — official site
                </a>
              </li>
              <li>
                <a
                  href="https://www.portaransas.org/events/fishing-tournaments/"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Port Aransas CVB — Fishing Tournaments listing (20+)
                </a>
              </li>
              <li>
                <a
                  href="https://www.portasouthjetty.com/articles/its-tourney-time/"
                  className="text-coral-500 hover:text-coral-600 underline decoration-coral-200 hover:decoration-coral-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Port Aransas South Jetty — &quot;It&apos;s Tourney Time&quot;
                </a>
              </li>
            </ol>
          </details>
        </div>
      </section>

      {/* Back link */}
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

function ComparisonRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr>
      <td className="py-3 pr-4 align-top text-xs font-semibold text-coral-300 uppercase tracking-widest sticky left-0 bg-navy-900 whitespace-nowrap">
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className="py-3 px-4 align-top text-sm text-sand-200 font-light leading-relaxed"
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function StackedRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-coral-300 uppercase tracking-widest mb-1">
        {label}
      </dt>
      <dd className="text-sand-100 font-light leading-relaxed">{value}</dd>
    </div>
  );
}
