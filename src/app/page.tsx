import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import FeaturedSpots from "@/components/FeaturedSpots";
import Footer from "@/components/Footer";
import { categories } from "@/data/categories";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      {/* Category Grid */}
      <section className="py-24 relative" id="explore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Browse by Category
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Explore Port Aransas
            </h2>
            <div className="coral-line max-w-xs mx-auto mb-6" />
            <p className="text-lg text-navy-400 max-w-2xl mx-auto font-light">
              Every listing is vetted by locals. Browse by category to find exactly what you need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <FeaturedSpots />

      {/* About Section */}
      <section className="py-24" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Our Mission
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
              Why Port A Local?
            </h2>
            <div className="coral-line max-w-xs mx-auto mb-8" />
            <p className="text-lg text-navy-400 leading-relaxed mb-12 font-light">
              Port Aransas is one of the most beloved beach towns on the Texas coast, but finding
              the real gems has always been word-of-mouth. We built Port A Local to change that —
              a single place where visitors and residents can discover businesses that are genuinely
              local, genuinely good, and genuinely cared about by the community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌴</span>
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">Island Curated</h3>
                <p className="text-sm text-navy-400 font-light">
                  Every business is reviewed and approved by people who live and work on the island.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">Community First</h3>
                <p className="text-sm text-navy-400 font-light">
                  We exist to serve Port Aransas — connecting visitors with businesses that make this town great.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white border border-sand-200 card-hover">
                <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-2">No Pay-to-Play</h3>
                <p className="text-sm text-navy-400 font-light">
                  Listings aren&apos;t for sale. You earn your spot by being great at what you do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Businesses */}
      <section className="py-24 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Join Our Community
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 mb-4">
            Own a Business in Port A?
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-6" />
          <p className="text-lg text-navy-200 max-w-2xl mx-auto mb-10 font-light">
            If you run a local business and want to be featured on Port A Local,
            we&apos;d love to hear from you. Our vetting process is simple and free.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl btn-coral text-lg tracking-wide"
          >
            Get Listed
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
