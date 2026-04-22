import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import IslandConditions from "@/components/IslandConditions";
import Link from "next/link";
import type { Metadata } from "next";
import PortalIcon, { EmojiIcon } from "@/components/brand/PortalIcon";

export const metadata: Metadata = {
  title: "Fishing Report & Conditions — Port Aransas, TX | Port A Local",
  description:
    "What's biting in Port Aransas. Seasonal fish species, bait recommendations, regulations, live conditions, and links to the latest fishing reports from local guides.",
};

const seasons = [
  {
    name: "Spring",
    months: "March – May",
    icon: "🌸",
    species: [
      { name: "Speckled Trout", detail: "Active on flats, channel edges, grass beds" },
      { name: "Redfish", detail: "Moving onto shallow flats, feeding aggressively" },
      { name: "Jack Crevalle", detail: "Arrive in large schools, aggressive strikes" },
      { name: "Pompano", detail: "Cruise the surf during spring migration" },
      { name: "King Mackerel", detail: "Begin moving into nearshore waters" },
      { name: "Sheepshead", detail: "Good through early spring around structure" },
    ],
  },
  {
    name: "Summer",
    months: "June – August",
    icon: "☀️",
    species: [
      { name: "Red Snapper", detail: "Peak season — federal charter season June through October" },
      { name: "King Mackerel", detail: "Strong offshore and nearshore" },
      { name: "Tarpon", detail: "Roll through the surf and jetties (catch & release)" },
      { name: "Cobia (Ling)", detail: "Follow rays and turtles nearshore" },
      { name: "Mahi-Mahi", detail: "Offshore at rigs and weed lines" },
      { name: "Sharks", detail: "Blacktip, bull sharks common when water exceeds 78°F" },
    ],
  },
  {
    name: "Fall",
    months: "September – November",
    icon: "🍂",
    species: [
      { name: "Bull Redfish", detail: "Stack at the jetties during migration — best months" },
      { name: "Flounder", detail: "Stage before November spawning run (closed Nov 1 – Dec 14)" },
      { name: "Speckled Trout", detail: "Excellent action in bays" },
      { name: "Wahoo", detail: "Start biting offshore in October" },
      { name: "Pompano", detail: "Return to the surf during fall migration" },
    ],
  },
  {
    name: "Winter",
    months: "December – February",
    icon: "❄️",
    species: [
      { name: "Black Drum", detail: "Prime season — both small and large" },
      { name: "Sheepshead", detail: "Peak season around jetties, pilings, structure" },
      { name: "Redfish", detail: "Good on warmer afternoons, jetties and channels" },
      { name: "Bull Redfish", detail: "North jetty produces January through April" },
    ],
  },
];

const fishingTypes = [
  { name: "Bay Fishing", icon: "🌊", species: "Redfish, trout, flounder, drum", description: "Wade the grass flats in 2-4 feet of water or drift over oyster reefs. The bread and butter of Port A fishing." },
  { name: "Surf Fishing", icon: "🏖️", species: "Whiting, pompano, redfish, sharks", description: "Long rods, cut bait, and patience. Best on moving tides. 4WD recommended to reach remote stretches." },
  { name: "Offshore", icon: "🚤", species: "Red snapper, kingfish, cobia, mahi, tuna", description: "Half-day (5-20 miles), full-day (30-60 miles), or overnight bluewater trips to the rigs and reefs." },
  { name: "Pier Fishing", icon: "🎣", species: "Trout, drum, pompano, tarpon", description: "Horace Caldwell Pier — 1,240 feet into the Gulf, open 24 hours, lighted for night fishing. $3/person, $4/pole." },
  { name: "Jetty Fishing", icon: "🪨", species: "Redfish, sheepshead, trout, mackerel", description: "South Jetty by foot, North Jetty via the Jetty Boat. Where Gulf and channel collide — prime conditions." },
  { name: "Kayak Fishing", icon: "🛶", species: "Sight-cast redfish, trout, flounder", description: "Launch from Roberts Point Park or Lydia Ann Channel. Shallow grass flats at 1-3 feet. Tides matter more than time." },
];

const regulations = [
  { species: "Redfish", bag: "3/day", size: "20-28\" slot", note: "One oversized with Red Drum Tag" },
  { species: "Speckled Trout", bag: "5/day", size: "15-25\" slot", note: "One over 25\" allowed" },
  { species: "Flounder", bag: "5/day", size: "14\" min", note: "CLOSED Nov 1 – Dec 14" },
  { species: "Black Drum", bag: "5/day", size: "14-30\" slot", note: "One over 52\" allowed" },
  { species: "Sheepshead", bag: "5/day", size: "15\" min", note: "" },
  { species: "Red Snapper", bag: "4/day", size: "15\" min", note: "TX state waters open year-round" },
  { species: "King Mackerel", bag: "3/day", size: "27\" fork", note: "" },
  { species: "Tarpon", bag: "1/day", size: "85\" min", note: "Catch & release under 85\"" },
];

const reportLinks = [
  { name: "TPWD Weekly Fishing Report", url: "https://tpwd.texas.gov/fishboat/fish/action/reptform2.php?lake=PORT+ARANSAS", description: "Official state report from Captain Kenny Kramer" },
  { name: "FishingBooker Reports", url: "https://fishingbooker.com/reports/destination/us/TX/port-aransas", description: "Daily reports with top catches and conditions" },
  { name: "Captain Experiences", url: "https://captainexperiences.com/fishing-reports/locations/texas/port-aransas", description: "Weekly reports from local charter captains" },
  { name: "Saltwater Angler Magazine", url: "https://www.saltyangler.com/corpus-christi-fishing-reports/", description: "Broader Corpus Christi/Port A area coverage" },
];

export default function FishingReportPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-300 text-sm font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
            Tight Lines
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Fishing Report
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            What&apos;s biting, where to fish, and what you need to know. Real-time conditions from NOAA, seasonal species guide, and links to the latest reports from local captains.
          </p>
        </div>
      </section>

      {/* Live Conditions */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Right Now
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Current Conditions
            </h2>
            <p className="text-navy-400 font-light">
              Water temp, wind, and tides from NOAA Station 8775237 — Port Aransas.
            </p>
          </div>
          <IslandConditions />
        </div>
      </section>

      {/* Seasonal Species */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              What&apos;s Biting
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Species by Season
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasons.map((season) => (
              <div key={season.name} className="bg-white rounded-2xl border border-sand-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <EmojiIcon emoji={season.icon} className="w-7 h-7 text-navy-900 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-navy-900">{season.name}</h3>
                    <p className="text-xs text-navy-400">{season.months}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {season.species.map((sp) => (
                    <div key={sp.name} className="flex items-start gap-2">
                      <span className="text-coral-400 mt-1 text-xs">●</span>
                      <div>
                        <span className="text-sm font-medium text-navy-900">{sp.name}</span>
                        <span className="text-sm text-navy-400 ml-1">— {sp.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Fishing */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              How to Fish
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Types of Fishing in Port A
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fishingTypes.map((type) => (
              <div key={type.name} className="bg-white rounded-xl border border-sand-200 p-5">
                <EmojiIcon emoji={type.icon} className="w-7 h-7 mx-auto mb-3 text-navy-900" />
                <h3 className="font-display font-bold text-navy-900 text-sm mb-1">{type.name}</h3>
                <p className="text-xs text-coral-500 font-medium mb-2">{type.species}</p>
                <p className="text-xs text-navy-400 font-light leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulations */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Know the Rules
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Bag & Size Limits
            </h2>
            <p className="text-navy-400 font-light text-sm">
              TPWD 2025-2026 season (Sep 1 – Aug 31). Always verify at{" "}
              <a href="https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits" target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:text-coral-600">tpwd.texas.gov</a>.
              Texas fishing license + saltwater endorsement required for ages 17+.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 border-b border-sand-200">
                    <th className="text-left px-4 py-3 font-semibold text-navy-700">Species</th>
                    <th className="text-left px-4 py-3 font-semibold text-navy-700">Daily Bag</th>
                    <th className="text-left px-4 py-3 font-semibold text-navy-700">Size</th>
                    <th className="text-left px-4 py-3 font-semibold text-navy-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {regulations.map((reg) => (
                    <tr key={reg.species} className="border-b border-sand-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-navy-900">{reg.species}</td>
                      <td className="px-4 py-3 text-navy-600">{reg.bag}</td>
                      <td className="px-4 py-3 text-navy-600">{reg.size}</td>
                      <td className="px-4 py-3 text-navy-400 text-xs">{reg.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Reports Links */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              From the Captains
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Latest Fishing Reports
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white rounded-xl border border-sand-200 p-5 card-hover"
              >
                <PortalIcon name="fish" className="w-7 h-7 flex-shrink-0 text-navy-900" />
                <div>
                  <p className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors text-sm">
                    {link.name}
                  </p>
                  <p className="text-xs text-navy-400 mt-1">{link.description}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/fish" className="inline-flex items-center gap-2 btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Find a Fishing Charter
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
