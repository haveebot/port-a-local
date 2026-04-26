import Link from "next/link";
import type { Metadata } from "next";
import LighthouseMark from "@/components/brand/LighthouseMark";
import {
  CATEGORIES,
  type ListingMode,
} from "@/data/locals-types";
import {
  getActiveListings,
  getListingsByCategory,
} from "@/data/locals-listings";
import LocalsBetaBanner from "@/components/locals/LocalsBetaBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locals — rent gear, hire services in Port Aransas",
  description:
    "Rent or hire from people who actually live here. Beach gear, watercraft, photographers, captains, cleaning, errand running — Port Aransas locals offering what they have and what they do.",
};

export default async function LocalsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const mode: ListingMode | "all" =
    sp.mode === "rent" || sp.mode === "hire" ? sp.mode : "all";
  const filterCat = sp.cat;

  const allListings = getActiveListings();
  const visibleCats = CATEGORIES.filter(
    (c) => mode === "all" || c.mode === mode,
  );

  return (
    <main className="min-h-screen bg-sand-50">
      <LocalsBetaBanner />

      <header className="bg-navy-900 text-sand-100 border-b border-coral-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-coral-300 mb-2 hover:text-coral-200 transition-colors group"
          >
            <LighthouseMark size={16} variant="light" detail="icon" />
            <span className="group-hover:underline decoration-coral-400/40">
              Port A Local · Locals
            </span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Rent it. Hire them. From locals.
          </h1>
          <p className="text-sand-300 font-light mt-2 max-w-2xl">
            Real people in Port Aransas with stuff they&apos;ll rent and skills
            they&apos;ll bring to your trip. Not an app. Not a contractor pool.
            Locals.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Mode pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <ModeChip
            label={`All (${visibleCatsTotal(allListings, "all")})`}
            href="/locals"
            active={mode === "all"}
          />
          <ModeChip
            label="Rent"
            href="/locals?mode=rent"
            active={mode === "rent"}
          />
          <ModeChip
            label="Hire"
            href="/locals?mode=hire"
            active={mode === "hire"}
          />
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleCats.map((c) => {
            const items = getListingsByCategory(c.id);
            const isActive = filterCat === c.id;
            return (
              <div
                key={c.id}
                className={
                  isActive
                    ? "bg-white border-2 border-coral-400 rounded-xl p-5"
                    : "bg-white border border-sand-200 rounded-xl p-5"
                }
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-coral-600 mb-0.5">
                      {c.mode === "rent" ? "Rent" : "Hire"}
                    </p>
                    <h3 className="font-display font-bold text-navy-900 text-lg leading-tight">
                      {c.label}
                    </h3>
                  </div>
                  {items.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                      {items.length} live
                    </span>
                  )}
                </div>
                <p className="text-sm text-navy-600 font-light mb-3">
                  {c.blurb}
                </p>
                {items.length === 0 ? (
                  <Link
                    href={`/locals/inquiry?cat=${c.id}`}
                    className="text-xs text-coral-600 underline decoration-coral-300 hover:decoration-coral-500"
                  >
                    Looking for this? Tell us →
                  </Link>
                ) : (
                  <ul className="space-y-2 mt-3">
                    {items.map((l) => (
                      <li
                        key={l.id}
                        className="border-t border-sand-100 pt-2"
                      >
                        <p className="font-display font-bold text-sm text-navy-900">
                          {l.title}{" "}
                          <span className="text-navy-400 font-light text-xs">
                            · {l.provider}
                          </span>
                        </p>
                        <p className="text-xs text-navy-600 font-light mt-1">
                          {l.description}
                        </p>
                        {l.pricingNote && (
                          <p className="text-[11px] font-mono text-navy-500 mt-1">
                            {l.pricingNote}
                          </p>
                        )}
                        <Link
                          href={`/locals/inquiry?listing=${l.id}`}
                          className="inline-block mt-2 text-xs text-coral-600 underline decoration-coral-300"
                        >
                          Request a quote →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Provider CTAs */}
        <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/locals/offer?mode=rent"
            className="block bg-navy-900 text-sand-100 border border-coral-500/30 rounded-xl p-6 hover:border-coral-500/60 transition-all"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              Got stuff?
            </p>
            <p className="font-display text-lg font-bold leading-tight mb-1">
              List it for rent.
            </p>
            <p className="text-sm text-sand-300 font-light">
              Beach gear sitting in your garage. A jet ski you use twice a
              year. A spare paddleboard. List it — we route renters to you.
            </p>
            <p className="text-xs text-coral-300 mt-3">Get started →</p>
          </Link>
          <Link
            href="/locals/offer?mode=hire"
            className="block bg-navy-900 text-sand-100 border border-coral-500/30 rounded-xl p-6 hover:border-coral-500/60 transition-all"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-coral-300 mb-1">
              Got skills?
            </p>
            <p className="font-display text-lg font-bold leading-tight mb-1">
              Offer your services.
            </p>
            <p className="text-sm text-sand-300 font-light">
              Photographer. Captain. Cleaner. Yoga teacher. Sitter. List
              what you do — we send the inquiries to you.
            </p>
            <p className="text-xs text-coral-300 mt-3">Get started →</p>
          </Link>
        </section>

        <p className="text-xs text-navy-500 font-light mt-8 text-center max-w-2xl mx-auto">
          We&apos;re purposefully small at the start. Curated locals only —
          we vet everyone who lists. Property repairs (plumbing, AC, locks,
          hurricane prep) go through{" "}
          <Link
            href="/maintenance"
            className="underline decoration-sand-300 hover:text-coral-600"
          >
            /maintenance
          </Link>{" "}
          where John handles them, not /locals.
        </p>
      </div>
    </main>
  );
}

function visibleCatsTotal(
  listings: ReturnType<typeof getActiveListings>,
  mode: ListingMode | "all",
): number {
  if (mode === "all") return listings.length;
  return listings.filter((l) => {
    const cat = CATEGORIES.find((c) => c.id === l.category);
    return cat?.mode === mode;
  }).length;
}

function ModeChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-navy-900 text-sand-50"
          : "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-white border border-sand-300 text-navy-600 hover:border-navy-400"
      }
    >
      {label}
    </Link>
  );
}
