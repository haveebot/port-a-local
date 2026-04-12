import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Island Essentials — Everything You Need to Know | Port A Local",
  description:
    "Your arrival guide to Port Aransas, TX. Ferry info, beach rules, golf cart rules, parking, weather, emergency contacts, and insider tips from locals.",
};

const essentials = [
  {
    icon: "⛴️",
    title: "Getting Here — The Ferry",
    items: [
      "The Port Aransas ferry is free, 24/7, 365 days a year. No reservation needed.",
      "Board from Port Street stacking lanes in Aransas Pass. Crossing takes ~10 minutes.",
      "Peak waits: Spring Break and summer weekends can mean 30-60+ minute waits. Arrive early or use the alternate route via SH 361 from Corpus Christi through Padre Island.",
      "Real-time ferry info: tune to AM 530 radio or check @PortA_Ferry on X.",
      "Watch for dolphins in the channel — they ride the ferry wake.",
    ],
    link: { label: "Ferry Wait Times (TxDOT)", url: "https://www.txdot.gov/about/districts/corpus-christi/port-aransas-ferry.html" },
  },
  {
    icon: "🛺",
    title: "Golf Cart Rules",
    items: [
      "Golf carts are the main way to get around Port Aransas. They're street-legal on most roads.",
      "Must have a valid driver's license to operate.",
      "Headlights and taillights required if driving after dark.",
      "Stay off SH 361 (the highway) — carts are not allowed on state highways.",
      "Speed limit in town is typically 20-30 mph. Carts max out around 25.",
      "Seatbelts required for all passengers if the cart has them.",
      "No driving on the beach — carts are for roads only.",
    ],
    link: { label: "Rent a Cart on Port A Local", url: "/rent" },
  },
  {
    icon: "🏖️",
    title: "Beach Rules & Tips",
    items: [
      "Beach driving is allowed on most Port Aransas beaches with a valid Nueces County beach parking permit ($12/year for residents, $12/day for visitors).",
      "4WD recommended — 2WD vehicles get stuck regularly. If you get stuck, call a tow service, not 911.",
      "No glass on the beach — ever. Cans and plastic only.",
      "Build fires only in designated areas and fully extinguish before leaving.",
      "Leashed dogs are welcome on the beach.",
      "Clean up everything you bring. Pack it in, pack it out.",
      "Rip currents are real. Swim near lifeguard stations when possible. If caught, swim parallel to shore.",
    ],
  },
  {
    icon: "🅿️",
    title: "Parking",
    items: [
      "Downtown Port Aransas has free street parking — no meters.",
      "Beach parking requires a Nueces County beach parking permit if you drive onto the sand.",
      "During peak season (Spring Break, summer), downtown fills up fast. Walk or cart if possible.",
      "The ferry stacking lanes can back up — don't park in them thinking they're regular parking.",
    ],
  },
  {
    icon: "🌊",
    title: "Weather & Water Safety",
    items: [
      "Gulf water temps range from ~60°F in winter to ~85°F in summer.",
      "Jellyfish are common May through October. Shuffle your feet when entering the water to avoid stingrays.",
      "Afternoon thunderstorms are frequent in summer — they build fast and hit hard. Get off the beach if you see lightning.",
      "Sunscreen is mandatory. The Gulf sun is stronger than you think, especially with the water reflection.",
      "Mosquitoes can be intense at dawn and dusk, especially after rain. Bring repellent.",
    ],
    link: { label: "Check Live Conditions", url: "/live" },
  },
  {
    icon: "🐬",
    title: "Wildlife",
    items: [
      "Dolphins are everywhere — in the ship channel, around the ferry, and in the bay. Watch from shore or take a dolphin tour.",
      "Sea turtles nest on Port Aransas beaches from April through August. If you see a nest (marked with stakes and tape), keep your distance.",
      "The Amos Rehabilitation Keep (ARK) at UTMSI rehabilitates injured sea turtles and birds. Free to visit.",
      "Don't feed the wildlife — including pelicans, seagulls, and feral cats.",
      "Whooping cranes winter at the Aransas National Wildlife Refuge across the bay (November-March). World's rarest crane.",
    ],
  },
  {
    icon: "🎣",
    title: "Fishing Basics",
    items: [
      "Texas fishing license required for anyone 17+. Buy online at TPWD.gov or at Island Tackle.",
      "Saltwater stamp required in addition to the fishing license.",
      "Popular catches: redfish, speckled trout, flounder, sheepshead, black drum, tarpon (catch & release only).",
      "Pier fishing: Horace Caldwell Pier ($5 entry) and Ancel Brundrett Pier (free).",
      "Jetty fishing: walk out on the north jetty via the Jetty Boat from Fisherman's Wharf.",
      "Charter fishing: book a half-day or full-day trip through Deep Sea Headquarters, Woody's Last Stand, or Fisherman's Wharf.",
    ],
    link: { label: "Find Fishing Charters", url: "/fish" },
  },
  {
    icon: "🍽️",
    title: "Dining Tips",
    items: [
      "Reservations recommended for Venetian Hot Plate, Roosevelt's, Tortuga's, and Lisabella's — especially weekends.",
      "Many restaurants close Monday and/or Tuesday. Check hours before heading out.",
      "\"Cook your catch\" — Virginia's On The Bay and FINS Grill will cook the fish you caught that day.",
      "Breakfast spots fill up fast on weekends. The Island Cafe and Island Bakery are local favorites — go early.",
      "Happy hours are real. Castaway's, FINS, BierHaus, Stingray's, and Bron's Backyard all run solid deals.",
    ],
    link: { label: "Gully It — Find a Restaurant", url: "/gully?q=seafood" },
  },
  {
    icon: "🏥",
    title: "Emergency & Medical",
    items: [
      "Emergency: call 911.",
      "Port Aransas Police: (361) 749-4545.",
      "Nueces County EMS serves Port Aransas — ambulance response from on-island station.",
      "Nearest hospital: Corpus Christi Medical Center (~45 min via SH 361 or ferry + I-37).",
      "Urgent care: Port Aransas has limited urgent care. For serious injuries, go to Corpus Christi.",
      "Hurricane evacuation: follow SH 361 south to Corpus Christi. Do not wait for the ferry — use the highway route.",
    ],
  },
  {
    icon: "📱",
    title: "Connectivity & Essentials",
    items: [
      "Cell service is generally good on the island (AT&T, Verizon, T-Mobile all have coverage).",
      "WiFi is available at most hotels, restaurants, and coffee shops. Coffee Waves is a popular work spot.",
      "Grocery: closest full grocery store is the IGA in Port Aransas or HEB in Aransas Pass (across the ferry).",
      "Gas: fill up before you get on the island. There are a few stations in town but prices are higher.",
      "ATMs: available at most gas stations and some restaurants. Many places are card-only.",
    ],
  },
];

export default function EssentialsPage() {
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
            Your Arrival Guide
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Island Essentials
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Everything you need to know before you get on the ferry. Save this page to your phone — you&apos;ll thank us later.
          </p>
        </div>
      </section>

      {/* Quick jump nav */}
      <section className="py-6 bg-sand-50 border-b border-sand-200 sticky top-[72px] z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {essentials.map((section) => (
              <a
                key={section.title}
                href={`#${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white text-navy-600 border border-sand-200 hover:border-coral-300 hover:text-coral-600 transition-colors"
              >
                {section.icon} {section.title.split("—")[0].trim()}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
          {essentials.map((section) => (
            <div
              key={section.title}
              id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  {section.title}
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm text-navy-600 leading-relaxed font-light">{item}</span>
                    </li>
                  ))}
                </ul>

                {section.link && (
                  <div className="mt-6 pt-4 border-t border-sand-100">
                    <Link
                      href={section.link.url}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-coral-500 hover:text-coral-600 transition-colors"
                    >
                      {section.link.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            You know the essentials. Now find the good stuff.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gully" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Gully It
            </Link>
            <Link href="/guides" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Browse Guides
            </Link>
            <Link href="/live" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Check Conditions
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
