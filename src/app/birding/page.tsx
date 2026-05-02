import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/brand/PortalIcon";

export const metadata: Metadata = {
  title: "Birding in Port Aransas — Peak Spring Migration | Port A Local",
  description:
    "Port Aransas is one of North America's premier birding destinations — an Audubon-designated Important Bird Area on the Central Flyway. Right now: 75,500 birds crossed the county overnight. Where to look, what's flying, and the conservation note birders should know.",
  alternates: { canonical: "https://theportalocal.com/birding" },
};

interface Hotspot {
  name: string;
  description: string;
  address?: string;
  link?: { href: string; label: string };
  notable: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    name: "Leonabelle Turnbull Birding Center",
    description:
      "1,225 feet of boardwalk over freshwater wetlands; the trees out front are Port A's named fallout magnet — first dry land for migrants crossing the Gulf.",
    address: "1356 Ross Ave",
    notable: "Free guided 'Birding on the Boardwalk' Wednesdays 9–11 AM",
  },
  {
    name: "Joan and Scott Holt Paradise Pond",
    description:
      "Explicit migration stopover — the City of Port Aransas calls it out as a warbler/songbird waypoint during spring.",
    notable: "Best at dawn and after a north-wind front",
  },
  {
    name: "Port Aransas Nature Preserve at Charlie's Pasture",
    description:
      "1,217 acres of salt marsh, prairie, and tidal flats. Trail connects to the Birding Center.",
    notable: "Wading birds, raptors, sparrows in the prairie",
  },
  {
    name: "Mustang Island State Park",
    description: "Coastal scrub and beachfront — different habitat, different species.",
    link: { href: "/events/spring-kite-festival-2026", label: "Also where Kite Festival lands" },
    notable: "Painted buntings in the scrub late April–early May",
  },
  {
    name: "UTMSI Wetlands Education Center",
    description:
      "University of Texas Marine Science Institute. Ponds and marsh habitat managed for water birds.",
    notable: "Shorebirds, herons, occasional Roseate Spoonbill",
  },
  {
    name: "Roberts Point Park & South Jetty",
    description: "Pelicans, terns, and offshore species visible from the rocks.",
    notable: "Best for seabirds and gulls",
  },
];

interface SpeciesRow {
  name: string;
  detail: string;
  emoji?: string;
}

const RIGHT_NOW_SPECIES: SpeciesRow[] = [
  {
    name: "Painted Bunting",
    detail: "Core breeding range starts on the south Texas coast — arriving now.",
  },
  {
    name: "Scarlet Tanager · Summer Tanager",
    detail: "BirdCast flags both as classic Gulf Coast fallout species.",
  },
  {
    name: "Baltimore Oriole · Orchard Oriole",
    detail: "Audubon's Port A page calls these out for trees fronting the Birding Center.",
  },
  {
    name: "Magnolia · Blackburnian · Bay-breasted Warbler",
    detail: "TPWD's late April / early May coastal migrants. Yellow, Black-and-white, and Hooded common at Paradise Pond.",
  },
  {
    name: "Indigo Bunting · Blue Grosbeak",
    detail: "Fallout-typical per BirdCast.",
  },
  {
    name: "Ruby-throated Hummingbird",
    detail: "Migration window through May — feeders along the island stay busy.",
  },
  {
    name: "Roseate Spoonbill",
    detail: "Port A's resident year-round — the city's official bird. Pink, unmistakable.",
  },
];

export default function BirdingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm font-medium tracking-wide mb-6">
            <EmojiIcon emoji="🐦" className="w-4 h-4 text-emerald-200" />
            Birding · Port Aransas
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Peak Migration Is Here
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Port A is an Audubon-designated Important Bird Area on the Central
            Flyway. Right now is one of the best weeks of the year to visit.
          </p>
        </div>
      </section>

      {/* RIGHT NOW callout — the verifiable data */}
      <section className="py-12 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-sm">
            <p className="text-emerald-700 text-xs font-bold tracking-[0.2em] uppercase mb-3">
              ✨ Right now · this weekend
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-4 leading-snug">
              <span className="text-emerald-700">75,500 birds</span> crossed
              Aransas County overnight.
            </h2>
            <p className="text-navy-700 leading-relaxed mb-3">
              That's verified from{" "}
              <a
                href="https://dashboard.birdcast.org/region/US-TX-007"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-600 hover:underline font-semibold"
              >
                Cornell Lab&apos;s BirdCast radar
              </a>{" "}
              — the night of May 1–2 saw a peak of about 34,000 birds aloft
              simultaneously over Aransas County around 2 AM, heading
              west-northwest at ~1,700 feet. Neighboring Nueces County saw
              169,700 the same night. The whole corridor was lit up.
            </p>
            <p className="text-navy-700 leading-relaxed">
              Friday&apos;s cold front is the reason this weekend matters.
              Strong north-northeast winds (35–45 mph on the coast), heavy rain,
              gale warnings on the bays. Migrants crossing the Gulf hit a wall
              of headwinds and rain mid-flight; the barrier-island mottes are
              the first dry land with food and shelter. That&apos;s the
              textbook fallout setup{" "}
              <a
                href="https://houstonaudubon.org/programs/birding/resources/spring-coastal-migration.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-600 hover:underline font-semibold"
              >
                Houston Audubon
              </a>{" "}
              describes for the Texas coast.
            </p>
          </div>
        </div>
      </section>

      {/* What to look for */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
              What to look for
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Notable species this week
            </h2>
          </div>
          <div className="space-y-3">
            {RIGHT_NOW_SPECIES.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-xl border border-sand-200 p-4 sm:p-5"
              >
                <div className="font-display text-base font-semibold text-navy-900">
                  {s.name}
                </div>
                <div className="text-sm text-navy-600 mt-1 leading-relaxed">
                  {s.detail}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-navy-500 italic mt-4 leading-relaxed">
            Sources for species expected this week:{" "}
            <a
              href="https://birdcast.org/spotlight-on-the-gulf-coast-weekend-fallout-alert/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral-600 hover:underline"
            >
              BirdCast Gulf Coast fallout spotlight
            </a>
            ,{" "}
            <a
              href="https://tpwd.texas.gov/huntwild/wild/birding/migration/migration_times/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral-600 hover:underline"
            >
              Texas Parks &amp; Wildlife migration times
            </a>
            , and the Audubon Texas{" "}
            <a
              href="https://tx.audubon.org/programs/port-aransas-texas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral-600 hover:underline"
            >
              Port Aransas IBA
            </a>{" "}
            page.
          </p>
        </div>
      </section>

      {/* Active right now — eyewitness from local birders */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8">
            <p className="text-emerald-700 text-xs font-bold tracking-[0.2em] uppercase mb-3">
              ✨ From the field · this morning
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-900 mb-3">
              Local birders are out at the preserve
            </h2>
            <p className="text-navy-700 leading-relaxed">
              Port A birder Beryl Armstrong is at the nature preserve this
              morning watching the migration come through. We&apos;ll add
              her sighting list as it comes in — bookmark this section.
            </p>
            <p className="text-xs text-navy-500 italic mt-3">
              Spotting something interesting? Email{" "}
              <a
                href="mailto:hello@theportalocal.com"
                className="text-coral-600 hover:underline"
              >
                hello@theportalocal.com
              </a>{" "}
              with the species + location and we&apos;ll add it here. This
              is what local birding looks like.
            </p>
          </div>
        </div>
      </section>

      {/* Hotspots */}
      <section className="py-12 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
              Where to go
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Six hotspots on the island
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOTSPOTS.map((h) => (
              <div
                key={h.name}
                className="bg-white rounded-xl border border-sand-200 p-5"
              >
                <h3 className="font-display text-lg font-bold text-navy-900 mb-1">
                  {h.name}
                </h3>
                {h.address && (
                  <p className="text-xs text-navy-500 font-mono mb-2">
                    {h.address}
                  </p>
                )}
                <p className="text-sm text-navy-700 leading-relaxed mb-3">
                  {h.description}
                </p>
                <p className="text-xs text-navy-500 italic">
                  {h.notable}
                </p>
                {h.link && (
                  <Link
                    href={h.link.href}
                    className="inline-block mt-3 text-xs font-semibold text-coral-600 hover:text-coral-700"
                  >
                    {h.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Birder's note */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-navy-900 text-sand-50 rounded-2xl p-6 sm:p-8 border border-coral-500/30">
            <p className="text-coral-300 text-xs font-bold tracking-[0.2em] uppercase mb-3">
              A note from Houston Audubon
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Fallout birds are exhausted from a Gulf crossing fighting
              headwinds. Keep your distance. Don&apos;t flush them off
              perches or away from food. They need the calories to continue
              the migration.
            </p>
            <p className="text-xs text-coral-200/80 mt-4">
              Quoted in spirit from{" "}
              <a
                href="https://houstonaudubon.org/programs/birding/resources/spring-coastal-migration.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-200 hover:text-coral-100 underline"
              >
                Houston Audubon&apos;s Spring Coastal Migration guide
              </a>
              . Worth a read before any first migration trip.
            </p>
          </div>
        </div>
      </section>

      {/* Year-round context */}
      <section className="py-12 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
              Year-round
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
              An island that&apos;s always birding
            </h2>
            <p className="text-base text-navy-700 leading-relaxed">
              Spring migration is the loud one, but Port A is a birding island
              every season. Audubon designates the area as an Important Bird
              Area; the Birding Center, Paradise Pond, and Charlie&apos;s
              Pasture are open year-round. Roseate Spoonbills, herons, and
              ibis hold residence in the marsh. The annual Whooping Crane
              Festival each February celebrates the species that wintered
              here from near-extinction. If you&apos;re visiting outside
              spring migration, the Birding Center alone is worth the trip.
            </p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-navy-50 rounded-xl border border-navy-100 p-6">
            <p className="text-xs font-semibold text-coral-600 uppercase tracking-widest mb-3">
              Sources
            </p>
            <ul className="space-y-2 text-sm text-navy-700 leading-relaxed">
              <li>
                <a
                  href="https://dashboard.birdcast.org/region/US-TX-007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  BirdCast Aransas County dashboard
                </a>{" "}
                — Cornell Lab&apos;s overnight migration radar; source of
                the 75,500 figure
              </li>
              <li>
                <a
                  href="https://birdcast.org/spotlight-on-the-gulf-coast-weekend-fallout-alert/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  BirdCast Gulf Coast fallout spotlight
                </a>{" "}
                — fallout mechanism + species list
              </li>
              <li>
                <a
                  href="https://houstonaudubon.org/programs/birding/resources/spring-coastal-migration.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  Houston Audubon Spring Coastal Migration
                </a>{" "}
                — fallout trigger definition + conservation note
              </li>
              <li>
                <a
                  href="https://tx.audubon.org/programs/port-aransas-texas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  Audubon Texas Port Aransas IBA
                </a>{" "}
                — Important Bird Area designation; documented fallout history
              </li>
              <li>
                <a
                  href="https://www.portaransas.org/things-to-do/birding/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  Port Aransas tourism birding page
                </a>{" "}
                — official hotspot list
              </li>
              <li>
                <a
                  href="https://tpwd.texas.gov/huntwild/wild/birding/migration/migration_times/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:underline"
                >
                  Texas Parks &amp; Wildlife Migration Times
                </a>{" "}
                — what&apos;s flying when
              </li>
            </ul>
            <p className="text-xs text-navy-500 italic mt-4 leading-relaxed">
              See something rare on the island this week? Email{" "}
              <a
                href="mailto:hello@theportalocal.com"
                className="text-coral-600 hover:underline"
              >
                hello@theportalocal.com
              </a>{" "}
              with the species, location, and any photo. We&apos;ll add to
              this page.
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
            Make a Day of It
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            Pair a sunrise birding session with breakfast on the island.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/eat"
              className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold"
            >
              Where to Eat
            </Link>
            <Link
              href="/rent"
              className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors"
            >
              Rent a Cart
            </Link>
            <Link
              href="/my-trip"
              className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors"
            >
              Build a Trip
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
