import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  customerPrice,
  getCategoriesFor,
  getItemsFor,
  getRestaurant,
  isOpenNow,
} from "@/data/delivery-restaurants";
import { isDeliveryLive } from "@/data/delivery-launch";
import PreviewBanner from "@/components/deliver/PreviewBanner";
import RestaurantOrderClient from "./RestaurantOrderClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}): Promise<Metadata> {
  const { restaurant } = await params;
  const r = getRestaurant(restaurant);
  if (!r) return { title: "PAL Delivery" };
  return {
    title: `${r.name} — delivery from PAL`,
    description: r.shortDescription,
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurant: string }>;
}) {
  const { restaurant: slug } = await params;
  const r = getRestaurant(slug);
  if (!r) notFound();

  const categories = getCategoriesFor(r.id);
  const items = getItemsFor(r.id);
  const open = isOpenNow(r);
  const live = isDeliveryLive();

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
      {!live && <PreviewBanner />}
      <header
        className="border-b border-sand-200 bg-white"
        style={{ borderTopColor: r.accent ?? "#C84A2C", borderTopWidth: 4 }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/deliver"
            className="text-xs text-navy-500 hover:text-coral-600 underline decoration-sand-300 mb-2 inline-block"
          >
            ← All restaurants
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900">
                {r.name}
              </h1>
              <p className="text-sm text-navy-600 font-light mt-1 max-w-2xl">
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
        </div>
      </header>

      <RestaurantOrderClient
        restaurantSlug={r.slug}
        restaurantName={r.name}
        isOpen={open}
        live={live}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        items={displayItems}
      />
    </main>
  );
}
