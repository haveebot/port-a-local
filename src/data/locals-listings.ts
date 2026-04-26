/**
 * PAL Locals — listings (manual seed v1)
 *
 * Providers are added by hand for now. Once /locals/offer signups land
 * in admin@, Winston reviews + adds approved listings here. When volume
 * justifies, we'll move this to Postgres + an admin UI in Wheelhouse.
 *
 * The seed below is INTENTIONALLY EMPTY at v1 — we want the page to
 * render the "no listings yet, here's what we want" framing so the
 * supply-side CTAs (Offer your stuff / Offer your services) are the
 * first thing a viewer engages with.
 *
 * To add: append a Listing entry. Use the category id from
 * locals-types.ts. Set isActive=true. Done.
 */

import type { Listing } from "./locals-types";

export const LISTINGS: Listing[] = [];

export function getActiveListings(): Listing[] {
  return LISTINGS.filter((l) => l.isActive).sort(
    (a, b) =>
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

export function getListingsByCategory(categoryId: string): Listing[] {
  return getActiveListings().filter((l) => l.category === categoryId);
}

export function getListingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}
