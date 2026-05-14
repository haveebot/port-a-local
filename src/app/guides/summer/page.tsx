import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbListSchema } from "@/components/StructuredData";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export const metadata: Metadata = {
  title: "Summer Like a Local — Port A Summer Guide | Port A Local",
  description:
    "A locally-curated guide to summer in Port Aransas. Beach days, fishing, charters, dolphin cruises, live music, golf carts, and where the locals eat — planned by people who live here.",
  openGraph: {
    title: "Summer Like a Local — Port A Summer Guide",
    description:
      "A locally-curated guide to summer in Port Aransas — activities, restaurants, and what to book ahead.",
  },
};

interface Pick {
  name: string;
  body: string;
}

const activities: Pick[] = [
  {
    name: "A whole day on the beach",
    body: "Drive on, park where you like, and stretch out. Bring chairs and umbrellas, or have Beach Rentals deliver a set-up to your spot. Mornings are the quietest.",
  },
  {
    name: "Fishing — pier, jetty, or offshore",
    body: "Walk on Horace Caldwell Pier for $5 (rod rentals on-site). Take the Jetty Boat from Fisherman's Wharf to the rocks. Or book a half-day with Neptune's Charters, Deep Sea Headquarters, or Woody's Last Stand.",
  },
  {
    name: "Dolphin cruise at golden hour",
    body: "Scarlet Lady's Sunset Dolphin Watch is the easy crowd-pleaser. The Red Dragon Pirate Ship is the kid-pleaser. Reserve a few days ahead in season.",
  },
  {
    name: "A day on San Jose Island",
    body: "Take the Jetty Boat across to undeveloped beach. Pack water, snacks, and shade. There's nothing on the other side except the Gulf and the sand.",
  },
  {
    name: "Live music after dark",
    body: "The Gaff, Shorty's, Bron's Backyard, Treasure Island, Sip Yard. Lineup changes nightly — see this week's roundup.",
  },
  {
    name: "Reserve a golf cart for the week",
    body: "How locals actually get around. Park anywhere. Faster than a bike, slower than a car, more fun than either.",
  },
];

const eats: Pick[] = [
  {
    name: "Tortuga's Saltwater Grill",
    body: "Brunch and dinner on the water. Book ahead in season.",
  },
  {
    name: "Crazy Cajun",
    body: "Family-style boil. No reservations — go early or settle in for a wait worth it.",
  },
  {
    name: "Virginia's On The Bay",
    body: "Oysters, peel-and-eat shrimp, and the cook-your-catch option after a charter day.",
  },
  {
    name: "Lisabella's Bistro & Bar",
    body: "Slow Italian dinner with white tablecloths. Reservations by phone.",
  },
  {
    name: "Roosevelt's at The Tarpon Inn",
    body: "Historic porch, grilled mahi, sunset-friendly. The kind of dinner you remember.",
  },
  {
    name: "The Gaff",
    body: "Punk-pirate beach bar with strong drinks, salt air, and an open mic that runs late.",
  },
];

interface CtaTile {
  heading: string;
  body: string;
  buttonLabel: string;
  href: string;
  bgClass: string;
  iconName?: PortalIconName;
  iconSrc?: string;
}

const ctaTiles: CtaTile[] = [
  {
    heading: "Adventures",
    body: "Fishing, kayak, dolphin tours, the jetty boat — full outdoor guide.",
    buttonLabel: "Explore",
    href: "/guides/outdoor-adventures",
    bgClass: "bg-seafoam-500 hover:bg-seafoam-600",
    iconSrc: "/icons/surfboard.svg",
  },
  {
    heading: "Book the beach",
    body: "Chairs, umbrellas, full set-up — delivered straight to your spot.",
    buttonLabel: "Book",
    href: "/beach",
    bgClass: "bg-coral-500 hover:bg-coral-600",
    iconName: "beach",
  },
  {
    heading: "Reserve your cart",
    body: "The best way to get around. Reserve and we'll deliver to you.",
    buttonLabel: "Reserve",
    href: "/rent",
    bgClass: "bg-ocean-500 hover:bg-ocean-600",
    iconName: "cart",
  },
  {
    heading: "Family-friendly",
    body: "Kid-approved spots, calm-water swims, easy wins for the crew.",
    buttonLabel: "Explore",
    href: "/guides/family-friendly",
    bgClass: "bg-gold-500 hover:bg-gold-600",
    iconName: "castle",
  },
];

export default function SummerGuide() {
  return (
    <main className="min-h-screen">
      <BreadcrumbListSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Summer in Port A", path: "/guides/summer" },
        ]}
      />
      <Navigation />

      {/* Hero — full-bleed aerial of Horace Caldwell Pier + coastline. */}
      <section className="pt-28 pb-16 relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/pal-aerial.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/55 via-navy-900/35 to-navy-900/80" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-navy-200 mb-6">
            <Link href="/guides" className="hover:text-coral-300 transition-colors">
              Guides
            </Link>
            <span className="text-coral-300/40">/</span>
            <span className="text-sand-100">Summer in Port A</span>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-coral-500/30 bg-coral-500/10 text-coral-200 text-sm font-medium tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            All Summer Long
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 leading-[1.05] mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Summer Like a{" "}
            <span className="italic text-coral-400">Local</span>
          </h1>

          <p className="text-lg sm:text-xl text-sand-100 font-light max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Plan your trip and book ahead to skip the lines for a seamless Summer getaway.
          </p>
        </div>
      </section>

      {/* Pro tip strip */}
      <section className="py-10 bg-coral-50 border-b border-coral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-coral-700 uppercase tracking-[0.25em] font-bold mb-3">
            Pro tip
          </p>
          <p className="text-base sm:text-lg text-navy-900 font-light leading-relaxed">
            Reserve your golf cart, beach set-up, and dinner spots before you cross the ferry. Summer fills up fast — locals know.
          </p>
        </div>
      </section>

      {/* Activities */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm text-coral-700 uppercase tracking-[0.25em] font-bold mb-3">
              Things to do
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900">
              Make the most of summer.
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-8 sm:gap-10">
            {activities.map((p) => (
              <li key={p.name}>
                <p className="font-semibold text-navy-900 text-base sm:text-lg mb-2">
                  {p.name}
                </p>
                <p className="text-base text-navy-700 font-light leading-relaxed">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Plan ahead — tile CTAs (placed mid-page so the action is reachable
          before the user gets lost in copy). */}
      <section className="py-20 sm:py-24 bg-navy-900 relative">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-coral-300 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Plan ahead
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
              Make it a summer to remember.
            </h2>
            <div className="coral-line max-w-xs mx-auto mb-6" />
            <p className="text-lg text-navy-200 font-light max-w-xl mx-auto">
              Book your beach day, reserve a cart, or dig into a full guide. All locally vetted — no runaround.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {ctaTiles.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`group block rounded-3xl ${t.bgClass} transition-colors p-8 sm:p-10 relative overflow-hidden`}
              >
                {t.iconSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.iconSrc}
                    alt=""
                    aria-hidden
                    className="absolute right-4 bottom-4 h-28 sm:h-32 lg:h-36 w-auto pointer-events-none"
                  />
                ) : (
                  t.iconName && (
                    <PortalIcon
                      name={t.iconName}
                      className="absolute right-4 bottom-4 w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 text-white/85 pointer-events-none"
                    />
                  )
                )}
                <div className="relative z-10 max-w-[65%]">
                  <h3 className="font-display italic text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                    {t.heading}
                  </h3>
                  <p className="text-white/85 text-base leading-relaxed mb-8">
                    {t.body}
                  </p>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-900 text-white text-xs tracking-[0.2em] uppercase font-bold group-hover:bg-navy-800 transition-colors">
                    {t.buttonLabel}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section className="py-16 sm:py-20 bg-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm text-coral-700 uppercase tracking-[0.25em] font-bold mb-3">
              Where to eat
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900">
              Tables worth your time.
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-8 sm:gap-10">
            {eats.map((p) => (
              <li key={p.name}>
                <p className="font-semibold text-navy-900 text-base sm:text-lg mb-2">
                  {p.name}
                </p>
                <p className="text-base text-navy-700 font-light leading-relaxed">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
