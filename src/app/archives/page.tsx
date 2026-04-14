import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { archivePhotos, getPhotosByEra } from "@/data/archives";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historical Photo Archives — Port Aransas Through the Decades | Port A Local",
  description:
    "The first organized digital collection of Port Aransas historical photographs. Public domain images from government archives spanning the 1890s to the 1970s — the Tarpon Era, the lighthouse, hurricanes, WWII, and more.",
};

export default function ArchivesPage() {
  const byEra = getPhotosByEra();
  const allTags = Array.from(new Set(archivePhotos.flatMap((p) => p.tags))).sort();

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
            First of Its Kind
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Historical Archives
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto mb-4">
            The first organized digital collection of Port Aransas historical photographs. Sourced from government archives, public libraries, and institutional collections.
          </p>
          <p className="text-sm text-navy-300 font-light max-w-xl mx-auto">
            All images are public domain. This collection grows with every research session. If you have historical photos of Port Aransas, we&apos;d love to include them.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-sand-50">{archivePhotos.length}</p>
              <p className="text-xs text-navy-400 mt-1">Photos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sand-50">{byEra.length}</p>
              <p className="text-xs text-navy-400 mt-1">Decades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sand-50">{allTags.length}</p>
              <p className="text-xs text-navy-400 mt-1">Topics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Photos by Era */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Through the Decades
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Port Aransas in Pictures
            </h2>
          </div>

          <div className="space-y-16">
            {byEra.map(({ era, photos }) => (
              <div key={era}>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-display text-xl font-bold text-navy-900">{era}</h3>
                  <div className="flex-1 h-px bg-sand-200" />
                  <span className="text-sm text-navy-400">{photos.length} {photos.length === 1 ? "photo" : "photos"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photos.map((photo) => (
                    <div key={photo.id} className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
                      {/* Photo — render inline if direct image URL, otherwise link out */}
                      <a
                        href={photo.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-navy-950 aspect-[4/3] relative overflow-hidden group"
                      >
                        {photo.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-navy-100 group-hover:bg-navy-200 transition-colors">
                            <div className="text-center p-6">
                              <span className="text-4xl block mb-3">🏛️</span>
                              <p className="text-sm font-medium text-navy-600 group-hover:text-coral-600 transition-colors">
                                View at {photo.source}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950/80 to-transparent p-3">
                          <p className="text-[10px] text-navy-200 font-medium">{photo.date} · {photo.source}</p>
                        </div>
                      </a>

                      <div className="p-5">
                        <h4 className="font-display font-bold text-navy-900 mb-1">{photo.title}</h4>
                        <p className="text-xs text-coral-500 font-medium mb-3">{photo.date} · {photo.source}</p>
                        <p className="text-sm text-navy-500 font-light leading-relaxed mb-4">
                          {photo.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {photo.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy-50 text-navy-500">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-sand-100">
                          <span className="text-[10px] text-navy-300">{photo.rights}</span>
                          {photo.relatedStory && (
                            <Link
                              href={`/history/${photo.relatedStory}`}
                              className="text-xs font-medium text-coral-500 hover:text-coral-600 transition-colors"
                            >
                              Read the story →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About this collection */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4">About This Collection</h2>
            <div className="space-y-3 text-sm text-navy-500 font-light leading-relaxed">
              <p>
                This is the first attempt to organize Port Aransas historical photographs into a single, publicly accessible digital collection. Every image is sourced from government archives, university libraries, and public domain collections.
              </p>
              <p>
                Port Aransas has an extraordinary photographic record — the Port Aransas Museum alone holds nearly 40,000 historical images, most of which have never been digitized for public access. This archive is a starting point, not an endpoint.
              </p>
              <p>
                If you have historical photographs of Port Aransas — family photos, inherited collections, or institutional materials — we would love to help preserve and share them. Contact us at{" "}
                <a href="mailto:hello@theportalocal.com?subject=Historical%20Photos" className="text-coral-500 hover:text-coral-600">
                  hello@theportalocal.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-sand-50 mb-4">
            The Stories Behind the Photos
          </h2>
          <p className="text-lg text-navy-200 font-light mb-8">
            Every photo in this collection connects to a story. Read the history that shaped Port Aransas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/history" className="btn-coral px-8 py-3 rounded-xl text-sm font-semibold">
              Port A Heritage
            </Link>
            <Link href="/photos" className="px-8 py-3 rounded-xl text-sm font-semibold bg-white/10 text-sand-200 border border-white/20 hover:bg-white/20 transition-colors">
              Community Photos
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
