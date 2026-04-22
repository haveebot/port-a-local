import Navigation from "@/components/Navigation";
import BusinessCard from "@/components/BusinessCard";
import Footer from "@/components/Footer";
import { getBusinessesByCategory } from "@/data/businesses";
import type { Metadata } from "next";
import Link from "next/link";
import PortalIcon, { type PortalIconName } from "@/components/brand/PortalIcon";

export const metadata: Metadata = {
  title: "Services — Port A Local | Port Aransas, TX",
  description:
    "Book golf cart rentals, beach setups & maintenance directly through Port A Local. Plus every local service provider on the island — vetted and approved.",
};

const PORTALS: Array<{
  href: string;
  iconName: PortalIconName;
  title: string;
  description: string;
  cta: string;
}> = [
  {
    href: "/rent",
    iconName: "cart",
    title: "Golf Cart Rentals",
    description:
      "The best way to get around the island. Reserve your cart and we handle the rest — delivery available.",
    cta: "Reserve Now",
  },
  {
    href: "/beach",
    iconName: "beach",
    title: "Beach Rentals",
    description:
      "Cabana setups and chair & umbrella packages delivered straight to your spot on the sand.",
    cta: "Book a Setup",
  },
  {
    href: "/maintenance",
    iconName: "maintenance",
    title: "Maintenance",
    description:
      "Need something fixed? Submit a request and our trusted local crew gets on it — Priority Dispatch available.",
    cta: "Submit a Request",
  },
];

export default function ServicesPage() {
  const businesses = getBusinessesByCategory("services");

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Header */}
      <section className="pt-28 pb-14 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <PortalIcon name="services" className="w-12 h-12 text-coral-400 shrink-0" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50">
              Services
            </h1>
          </div>
          <p className="text-lg text-navy-200 mt-2 max-w-2xl font-light">
            Book direct through Port A Local or browse every local service provider on the island. Either way, you&apos;re covered.
          </p>
        </div>
      </section>

      {/* Book Direct — PAL Portals */}
      <section className="py-16 bg-sand-50 relative">
        <div className="absolute top-0 left-0 right-0 coral-line" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-coral-500 text-sm font-medium tracking-[0.2em] uppercase mb-2">
              Book Direct
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
              Skip the calls. We handle it.
            </h2>
            <p className="text-navy-400 mt-2 font-light">
              Reserve online in minutes. Our local team confirms and takes care of the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTALS.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                className="group block rounded-2xl bg-white border border-sand-200 overflow-hidden card-hover"
              >
                <div className="h-1 bg-gradient-to-r from-navy-600 via-coral-400 to-gold-400" />
                <div className="p-8">
                  <PortalIcon name={portal.iconName} className="w-12 h-12 mb-4 text-navy-900 group-hover:text-coral-500 transition-colors" />
                  <h3 className="font-display text-xl font-bold text-navy-900 group-hover:text-coral-600 transition-colors mb-2">
                    {portal.title}
                  </h3>
                  <p className="text-navy-400 text-sm leading-relaxed mb-6">
                    {portal.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-coral-500 group-hover:text-coral-600 transition-colors">
                    {portal.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-navy-900 border-y border-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-navy-400 text-sm font-medium tracking-[0.2em] uppercase">
            Every local service provider on the island
          </p>
        </div>
      </div>

      {/* Services Directory */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          ) : (
            <p className="text-center text-navy-400 py-16">
              No service listings yet.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient relative">
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-coral-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Service Providers
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-sand-50 mb-4">
            Run a service business in Port A?
          </h2>
          <div className="gold-line max-w-xs mx-auto mb-6" />
          <p className="text-navy-200 max-w-xl mx-auto mb-8 font-light">
            Get your business in front of visitors and property owners looking for local, trusted service on the island.
          </p>
          <a
            href="mailto:hello@theportalocal.com?subject=Add my service business to Port A Local"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl btn-coral text-base font-semibold tracking-wide"
          >
            Get Listed
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
