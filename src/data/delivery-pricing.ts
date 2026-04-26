/**
 * PAL Delivery — pricing config + cart math.
 *
 * Single source of truth for the customer-facing prices. Editing these
 * constants moves the entire economy.
 *
 * Economics model (locked 2026-04-25):
 *   - Each restaurant carries its own markupPct (default 30%) baked into
 *     customer-facing prices.
 *   - Markup is split 50/50: half to the driver, half to PAL.
 *   - Delivery fee is split 50/50: half to the driver, half to PAL.
 *   - Service fee: 100% to PAL.
 *   - Tip: 100% to driver.
 *
 * Driver payout per order = 50% markup + 50% delivery + 100% tip.
 * PAL net per order      = 50% markup + 50% delivery + 100% service.
 * Restaurant cost        = sum(basePrice × qty) — paid in cash at pickup.
 */

import {
  customerPrice,
  getMenuItem,
  getRestaurant,
} from "./delivery-restaurants";
import type { OrderLineItem } from "./delivery-types";

/** Flat per-order delivery fee (split 50/50 between driver and PAL). */
export const DELIVERY_FEE_CENTS = 500;
/** Flat per-order PAL service fee (100% to PAL). */
export const SERVICE_FEE_CENTS = 200;
/** Texas state + PA local sales tax — applied to subtotal only. */
export const TAX_RATE = 0.0825;
/** Driver's share of the markup amount, 0-1. */
export const DRIVER_MARKUP_SHARE = 0.5;
/** Driver's share of the delivery fee, 0-1. */
export const DRIVER_DELIVERY_SHARE = 0.5;

/** Tip presets shown at checkout, as percentages of subtotal */
export const TIP_PRESETS_PCT = [15, 20, 25];

export interface CartItemInput {
  itemId: string;
  quantity: number;
  notes?: string;
}

export interface PricedCart {
  restaurantId: string;
  lineItems: OrderLineItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  /** Tip is supplied by caller, not derived */
  tipCents: number;
  taxCents: number;
  totalCents: number;
  /** What the restaurant gets at pickup (sum of basePrice × qty) */
  restaurantCostCents: number;
  /** What PAL pays the driver: 50% markup + 50% delivery + 100% tip */
  driverPayoutCents: number;
  /** What PAL keeps: 50% markup + 50% delivery + 100% service */
  palNetCents: number;
}

export class CartError extends Error {}

/**
 * Validate a cart against current menu data + price it. Throws if any
 * item is unknown, unavailable, or from a different restaurant than the
 * first one in the cart (no multi-restaurant carts in v1).
 */
export function priceCart(
  rawItems: CartItemInput[],
  tipCents: number,
): PricedCart {
  if (rawItems.length === 0) {
    throw new CartError("Cart is empty.");
  }
  const lineItems: OrderLineItem[] = [];
  let subtotalCents = 0;
  let restaurantCostCents = 0;
  let restaurantId: string | null = null;

  for (const ci of rawItems) {
    const item = getMenuItem(ci.itemId);
    if (!item) {
      throw new CartError(`Unknown menu item: ${ci.itemId}`);
    }
    if (!item.isAvailable) {
      throw new CartError(`Item not available: ${item.name}`);
    }
    if (restaurantId === null) {
      restaurantId = item.restaurantId;
    } else if (item.restaurantId !== restaurantId) {
      throw new CartError(
        "Multi-restaurant carts aren't supported yet — finish this order first.",
      );
    }
    const r = getRestaurant(getRestaurantSlug(item.restaurantId));
    if (!r) {
      throw new CartError("Restaurant unavailable.");
    }
    const qty = Math.max(1, Math.min(20, Math.floor(ci.quantity)));
    const unit = customerPrice(item, r.markupPct);
    const lineTotal = unit * qty;
    subtotalCents += lineTotal;
    restaurantCostCents += item.basePriceCents * qty;
    lineItems.push({
      itemId: item.id,
      itemName: item.name,
      customerPriceCents: unit,
      quantity: qty,
      notes: ci.notes,
    });
  }

  const safeTip = Math.max(0, Math.floor(tipCents));
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents =
    subtotalCents +
    DELIVERY_FEE_CENTS +
    SERVICE_FEE_CENTS +
    safeTip +
    taxCents;

  // Economics split — drives driver Venmo + PAL revenue tracking
  const markupCents = subtotalCents - restaurantCostCents;
  const driverMarkupShare = Math.round(markupCents * DRIVER_MARKUP_SHARE);
  const driverDeliveryShare = Math.round(
    DELIVERY_FEE_CENTS * DRIVER_DELIVERY_SHARE,
  );
  const driverPayoutCents = driverMarkupShare + driverDeliveryShare + safeTip;
  const palNetCents =
    (markupCents - driverMarkupShare) +
    (DELIVERY_FEE_CENTS - driverDeliveryShare) +
    SERVICE_FEE_CENTS;

  return {
    restaurantId: restaurantId!,
    lineItems,
    subtotalCents,
    deliveryFeeCents: DELIVERY_FEE_CENTS,
    serviceFeeCents: SERVICE_FEE_CENTS,
    tipCents: safeTip,
    taxCents,
    totalCents,
    restaurantCostCents,
    driverPayoutCents,
    palNetCents,
  };
}

// Lookup restaurant slug by id — local helper so we don't depend on the
// restaurant id and slug being identical (they happen to be in v1).
function getRestaurantSlug(restaurantId: string): string {
  // In current seeds id === slug. If they ever diverge, this needs work.
  return restaurantId;
}

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
