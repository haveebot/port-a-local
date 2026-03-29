import { notFound } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Badge from "@/components/Badge";
import Footer from "@/components/Footer";
import { getBusinessBySlug, getAllBusinessSlugs } from "@/data/businesses";
import { getCategoryBySlug } from "@/data/categories";

export function generateStaticParams() {
  return getAllBusinessSlugs();
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category: categorySlug, slug } = await params;
  const business = getBusinessBySlug(slug);
  const category = getCategoryBySlug(categorySlug);

  if (!business || !category) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="pt-28 pb-16 wave-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-palm-300 mb-8">
            <Link href="/" className="hover:text-gold-500 transition-colors">
              Home
            </Link>
            <span className="text-gold-500/40">/</span>
            <Link
              href={`/${category.slug}`}
              className="hover:text-gold-500 transition-colors"
            >
              {category.icon} {category.name}
            </Link>
            <span className="text-gold-500/40">/</span>
            <span className="text-palm-700">{business.name}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-palm-900 mb-2">
                {business.name}
              </h1>
              <p className="text-xl text-palm-400 font-light">{business.tagline}</p>
            </div>
            <Badge size="lg" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {business.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-gold-50 text-gold-800 text-sm font-medium border border-gold-200/50"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="rounded-2xl bg-white border border-sand-200 p-8">
                <h2 className="font-display text-xl font-bold text-palm-900 mb-4">About</h2>
                <p className="text-palm-500 leading-relaxed">
                  {business.description}
                </p>
              </div>

              {/* Hours of Operation */}
              {business.hoursOfOperation && (
                <div className="rounded-2xl bg-white border border-sand-200 p-8">
                  <h2 className="font-display text-xl font-bold text-palm-900 mb-4">Hours of Operation</h2>
                  <div className="space-y-2">
                    {Object.entries(business.hoursOfOperation).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-1.5 border-b border-sand-100 last:border-0">
                        <span className="text-sm font-medium text-palm-700">{day}</span>
                        <span className={`text-sm ${hours === "Closed" ? "text-coral-500 font-medium" : "text-palm-400"}`}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu */}
              {business.menu && business.menu.length > 0 && (
                <div className="rounded-2xl bg-white border border-sand-200 p-8">
                  <h2 className="font-display text-xl font-bold text-palm-900 mb-6">Menu</h2>
                  <div className="space-y-8">
                    {business.menu.map((section) => (
                      <div key={section.section}>
                        <h3 className="font-display text-lg font-semibold text-gold-700 mb-3 pb-2 border-b border-gold-100">
                          {section.section}
                        </h3>
                        <div className="space-y-3">
                          {section.items.map((item) => (
                            <div key={item.name} className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-sm font-medium text-palm-800">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-palm-400 mt-0.5">{item.description}</p>
                                )}
                              </div>
                              {item.price && (
                                <span className="text-sm font-medium text-gold-600 whitespace-nowrap">
                                  {item.price}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule / Cruises / Tours */}
              {business.schedule && business.schedule.length > 0 && (
                <div className="rounded-2xl bg-white border border-sand-200 p-8">
                  <h2 className="font-display text-xl font-bold text-palm-900 mb-6">Schedule & Pricing</h2>
                  <div className="space-y-6">
                    {business.schedule.map((entry) => (
                      <div key={entry.name} className="p-4 rounded-xl bg-palm-50 border border-palm-100">
                        <h3 className="font-display font-semibold text-palm-900 mb-2">{entry.name}</h3>
                        {entry.description && (
                          <p className="text-sm text-palm-500 mb-3">{entry.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {entry.times.map((time) => (
                            <span
                              key={time}
                              className="px-3 py-1 rounded-full bg-white text-palm-700 text-xs font-medium border border-palm-200"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                        {entry.price && (
                          <p className="text-sm font-medium text-gold-600 mt-2">{entry.price}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rentals */}
              {business.rentals && business.rentals.length > 0 && (
                <div className="rounded-2xl bg-white border border-sand-200 p-8">
                  <h2 className="font-display text-xl font-bold text-palm-900 mb-6">Rental Rates</h2>
                  <div className="space-y-3">
                    {business.rentals.map((rental) => (
                      <div key={rental.name} className="flex justify-between items-center p-3 rounded-lg bg-sand-50 border border-sand-100">
                        <div>
                          <p className="text-sm font-medium text-palm-800">{rental.name}</p>
                          <p className="text-xs text-palm-400">{rental.duration}</p>
                          {rental.description && (
                            <p className="text-xs text-palm-300 mt-0.5">{rental.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gold-600">{rental.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {business.amenities && business.amenities.length > 0 && (
                <div className="rounded-2xl bg-white border border-sand-200 p-8">
                  <h2 className="font-display text-xl font-bold text-palm-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {business.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gold-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-palm-500">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verified Partner Badge */}
              {business.verifiedPartner && (
                <div className="rounded-2xl bg-gold-50 border border-gold-200 p-4 text-center">
                  <p className="text-sm font-bold text-gold-800 font-display">Verified Partner</p>
                  <p className="text-xs text-gold-600 mt-1">Official Port A Local partner</p>
                </div>
              )}

              {/* Contact Card */}
              <div className="rounded-2xl bg-white border border-sand-200 p-6">
                <h3 className="font-display font-bold text-palm-900 mb-4">Details</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-palm-700">Address</p>
                      <p className="text-sm text-palm-400">{business.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-palm-700">Phone</p>
                      <p className="text-sm text-palm-400">{business.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-palm-700">Hours</p>
                      <p className="text-sm text-palm-400">{business.hours}</p>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-palm-700">Website</p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gold-600 hover:text-gold-700 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                  {business.priceRange && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-palm-700">Price Range</p>
                        <p className="text-sm text-palm-400">{business.priceRange}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl bg-palm-50 border border-palm-100 p-6 text-center">
                <p className="text-sm text-palm-600 font-medium mb-3">
                  Is this your business?
                </p>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg btn-gold text-sm"
                >
                  Claim Listing
                </a>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Link
              href={`/${category.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {category.name}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
