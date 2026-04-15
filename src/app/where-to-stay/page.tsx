import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { businesses } from "@/data/businesses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Where to Stay in Port Aransas — Lodging Guide | Port A Local",
  description:
    "Hotels, vacation rentals, condos, cottages, RV resorts, and camping in Port Aransas, TX. Neighborhood breakdowns and honest recommendations from locals.",
};

const neighborhoods = [
  {
    name: "Downtown / Old Town",
    icon: "🏘️",
    vibe: "Walkable, historic, close to everything",
    description:
      "The heart of Port Aransas — within walking or carting distance of restaurants, bars, shops, and the harbor. Older cottages, boutique hotels, and historic properties. This is where the Tarpon Inn has stood since 1886. Best for visitors who want to be in the middle of the action without driving.",
    bestFor: ["Walkability", "Nightlife", "Dining", "First-timers"],
    lodging: ["The Tarpon Inn", "Amelia's Landing Hotel", "Alister Square Inn", "Hotel Lydia"],
  },
  {
    name: "Beachfront / On The Beach",
    icon: "🏖️",
    vibe: "Gulf views, steps from the sand",
    description:
      "Condos and resorts directly on the beach along On The Beach Drive. Wake up to the sound of waves. Most properties have pools, beach access, and balconies facing the Gulf. Higher price point but the location is the whole point — you're here for the beach.",
    bestFor: ["Beach access", "Families", "Sunrises", "Relaxation"],
    lodging: ["Port Royal Ocean Resort", "Beachgate Condosuites", "Sand Dollar City", "Sea and Sand Cottages"],
  },
  {
    name: "Mid-Island / Highway 361",
    icon: "🛣️",
    vibe: "Convenient, affordable, easy access",
    description:
      "Hotels and vacation rentals along SH 361 between downtown and the beach. Chain hotels (Hampton Inn, Best Western, Days Inn) plus locally owned options. More affordable than beachfront, easy driving access to everything. Good base camp if budget matters more than views.",
    bestFor: ["Budget-friendly", "Families", "Road trippers", "Longer stays"],
    lodging: ["Hampton Inn", "Best Western", "Days Inn", "Island Hotel", "Shark Reef Resort"],
  },
  {
    name: "RV & Camping",
    icon: "🏕️",
    vibe: "Outdoor living on the Gulf Coast",
    description:
      "Port Aransas has some of the best beachfront RV camping in Texas. Full-hookup resorts with pools and amenities, rustic parks with character, and IB Magee Beach Park — a county park where you camp right on the Gulf for almost nothing. Winter Texans fill the parks November through March.",
    bestFor: ["RV travelers", "Budget camping", "Winter Texans", "Nature lovers"],
    lodging: ["IB Magee Beach Park", "On The Beach RV Resort", "Pioneer RV Resort", "Aloha Beach RV Resort"],
  },
];

const rentalManagers = businesses.filter(
  (b) => b.category === "stay" && b.tags.some((t) => t.includes("property management") || t.includes("vacation rental"))
);

const tips = [
  "Book early for Spring Break (March) and summer weekends — Port A fills up fast.",
  "Winter Texan season (November–March) is quieter, cheaper, and the weather is mild. Great time to visit.",
  "Vacation rentals often have 2-3 night minimums on weekends and 7-night minimums during peak weeks.",
  "Check if your rental includes beach parking permits and golf cart access — some do, some don't.",
  "Downtown properties mean you can walk or cart everywhere. Beachfront means you'll need a cart to eat out.",
  "Ask about hurricane policies. Most properties have cancellation terms for tropical weather.",
];

export default function WhereToStayPage() {
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
            Lodging Guide
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Where to Stay
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            Hotels, vacation rentals, condos, cottages, RV resorts, and camping — every neighborhood on the island, broken down by a local.
          </p>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Know Your Neighborhoods
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Where on the Island?
            </h2>
          </div>

          <div className="space-y-8">
            {neighborhoods.map((hood) => (
              <div key={hood.name} className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{hood.icon}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-navy-900">{hood.name}</h3>
                    <p className="text-sm text-coral-500 font-medium">{hood.vibe}</p>
                  </div>
                </div>

                <p className="text-sm text-navy-500 font-light leading-relaxed mt-4 mb-4">
                  {hood.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hood.bestFor.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-sand-100">
                  <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mb-2">Notable Properties</p>
                  <div className="flex flex-wrap gap-2">
                    {hood.lodging.map((name) => {
                      const biz = businesses.find((b) => b.name === name && b.category === "stay");
                      return biz ? (
                        <Link
                          key={name}
                          href={`/stay/${biz.slug}`}
                          className="text-sm text-coral-500 hover:text-coral-600 transition-colors"
                        >
                          {name} →
                        </Link>
                      ) : (
                        <span key={name} className="text-sm text-navy-400">{name}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vacation Rental Managers */}
      {rentalManagers.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-10">
              <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                Property Management
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
                Vacation Rental Companies
              </h2>
              <p className="text-navy-400 font-light">
                These local companies manage vacation rentals across Port Aransas. Book direct for the best rates and service.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rentalManagers.map((biz) => (
                <Link
                  key={biz.slug}
                  href={`/stay/${biz.slug}`}
                  className="group flex items-start gap-4 bg-white rounded-xl border border-sand-200 p-5 card-hover"
                >
                  <span className="text-2xl flex-shrink-0">🏠</span>
                  <div>
                    <p className="font-semibold text-navy-900 group-hover:text-coral-600 transition-colors text-sm">
                      {biz.name}
                    </p>
                    <p className="text-xs text-navy-400 mt-1 line-clamp-2">{biz.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Insider Tips
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Before You Book
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-navy-600 leading-relaxed font-light">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
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
            You know where to stay. Now find what to do.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/stay" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Browse All Lodging
            </Link>
            <Link href="/guides" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Curated Guides
            </Link>
            <Link href="/essentials" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Island Essentials
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
