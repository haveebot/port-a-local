import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LighthouseMark from "@/components/brand/LighthouseMark";
import {
  customerPrice,
  getCategoriesFor,
  getItemsFor,
  getRestaurant,
  isOpenNow,
} from "@/data/delivery-restaurants";
import { getFoodSpotBySlug } from "@/data/restaurant-encyclopedia";
import RestaurantOrderClient from "./RestaurantOrderClient";
import CallDirectView from "./CallDirectView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}): Promise<Metadata> {
  const { restaurant } = await params;
  const r = getRestaurant(restaurant);
  if (r) {
    return {
      title: `${r.name} — delivery from PAL`,
      description: r.shortDescription,
    };
  }
  // Fallback: encyclopedia lookup for call-direct spots
  const spot = getFoodSpotBySlug(restaurant);
  if (spot) {
    return {
      title: `${spot.name} — Port Aransas | Port A Local`,
      description: spot.tagline,
    };
  }
  return { title: "PAL Delivery" };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const { restaurant: slug } = await params;
  const r = getRestaurant(slug);

  // Two paths:
  //   1) PAL-delivery restaurant — full order flow (existing behavior)
  //   2) Call-direct spot from the /eat encyclopedia — info-only view
  if (!r) {
    const spot = getFoodSpotBySlug(slug);
    if (spot && spot.state === "call-direct") {
      return <CallDirectView spot={spot} />;
    }
    notFound();
  }

  const categories = getCategoriesFor(r.id);
  const items = getItemsFor(r.id);
  const open = isOpenNow(r);

  // Pre-compute display prices for the client component (so cart math
  // matches what the customer saw on the menu)
  const displayItems = items.map((it) => ({
    id: it.id,
    name: it.name,
    description: it.description,
    categoryId: it.categoryId,
    priceCents: customerPrice(it, r.markupPct),
    sort: it.sort,
  }));

  return (
    <main className="min-h-screen bg-sand-50 pb-32">
      <header
        className="border-b border-sand-200 bg-white"
        style={{ borderTopColor: r.accent ?? "#C84A2C", borderTopWidth: 4 }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-navy-400 hover:text-coral-600 transition-colors"
            >
              <LighthouseMark size={14} variant="dark" detail="icon" />
              Port A Local
            </Link>
            <span className="text-navy-300">·</span>
            <Link
              href="/deliver"
              className="text-xs text-navy-500 hover:text-coral-600 underline decoration-sand-300"
            >
              ← All restaurants
            </Link>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                  {r.name}
                </h1>
                {r.isBeta && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-blue-50 text-blue-700 border border-blue-300">
                    ⚡ Beta
                  </span>
                )}
              </div>
              <p className="text-sm text-navy-600 font-light max-w-2xl">
                {r.shortDescription}
              </p>
            </div>
            <span
              className={
                open
                  ? "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0 mt-1"
                  : "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-sand-100 text-navy-500 border border-sand-300 flex-shrink-0 mt-1"
              }
            >
              {open ? "Open · accepting orders" : "Closed"}
            </span>
          </div>
          {r.isBeta && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-[12px] text-blue-900 leading-relaxed">
              <span className="font-bold">⚡ Beta delivery from {r.name}.</span>{" "}
              We don&apos;t formally partner with this restaurant yet — your
              order goes through an operator-confirm step before any charge.
              We&apos;ll text you within ~10 min with a payment link if we can
              pull it off, or a heads-up if we can&apos;t (no charge either way).
              Menu prices may have drifted since we scraped them; we&apos;ll
              confirm the actual total with you before billing.
            </div>
          )}
        </div>
      </header>

      <RestaurantOrderClient
        restaurantSlug={r.slug}
        restaurantName={r.name}
        isOpen={open}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        items={displayItems}
      />
    </main>
  );
}
