/**
 * PAL Delivery — type model
 *
 * Three sides:
 *   1. Restaurants (NOT onboarded — we list, we deliver from them, retail
 *      payment at pickup; PAL is the demand layer + the runner)
 *   2. Drivers (contracted, dispatched via SMS, paid via Venmo v1 / Stripe
 *      Connect v2)
 *   3. Customers (anonymous; phone + name + delivery address per order,
 *      no account required)
 *
 * Money flow v1: Customer pays full retail (with built-in markup) +
 * delivery fee + service fee + tip + tax through Stripe Checkout. PAL
 * collects everything. Driver pays restaurant in cash or via PAL
 * card-on-file at pickup. Daily Venmo to drivers.
 */

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** A window during which delivery from this restaurant is available */
export interface DeliveryWindow {
  day: Weekday;
  /** "HH:mm" 24h, in America/Chicago */
  open: string;
  /** "HH:mm" 24h, in America/Chicago */
  close: string;
}

/**
 * A restaurant we deliver FROM. They have not opted in — we list, we
 * route demand, our agent walks in and pays retail at pickup.
 */
export interface DeliveryRestaurant {
  id: string;
  slug: string;
  name: string;
  /** Pickup address (as a driver would type into Maps) */
  pickupAddress: string;
  /** Optional pickup notes for the driver — "ask for online order at the bar" */
  pickupNotes?: string;
  /** Phone — drivers can call if there's a problem */
  phone?: string;
  /** Optional crosslink to a businesses.ts listing */
  businessSlug?: string;
  /** Short description shown on the /deliver landing page */
  shortDescription: string;
  /** Cuisine tags for filtering — e.g. ["Cajun", "Seafood"] */
  cuisineTags: string[];
  /** Hex accent color for the restaurant card; defaults to coral */
  accent?: string;
  /** Delivery hours — empty = no delivery configured yet */
  deliveryHours: DeliveryWindow[];
  /**
   * Markup pct baked INTO menu prices to absorb menu drift +
   * driver-pays-retail spread. Stored on the restaurant so different
   * spots can carry different buffers (10-15% range).
   */
  markupPct: number;
  /** When false, restaurant is hidden from /deliver */
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  /** Sort order within restaurant */
  sort: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  /** Base retail price BEFORE markup (the price the restaurant charges) */
  basePriceCents: number;
  isAvailable: boolean;
  sort: number;
}

/**
 * A contracted driver. Same shape as a Wheelhouse participant in spirit,
 * but kept separate so deliver-side ops doesn't bleed into the internal
 * coordination dashboard.
 */
export interface DeliveryDriver {
  id: string;
  name: string;
  /** SMS number for dispatch */
  phone: string;
  email?: string;
  /** When false, driver doesn't receive dispatch SMS */
  isActive: boolean;
  /** Bearer token, included in dispatch SMS link */
  token: string;
  /** Payout method — manual v1, Stripe Connect v2 */
  payoutMethod: "venmo" | "cash" | "check";
  /** Venmo handle, e.g. "@winston-caraker" */
  payoutHandle?: string;
}

/* -------------------- Orders -------------------- */

export type OrderStatus =
  | "placed" /* customer submitted, awaiting payment */
  | "paid" /* Stripe confirmed; about to dispatch */
  | "dispatching" /* drivers notified, awaiting claim */
  | "claimed" /* driver accepted */
  | "picked_up" /* driver has the food */
  | "delivered" /* dropped off */
  | "canceled" /* customer or admin canceled */
  | "refunded";

export interface OrderLineItem {
  itemId: string;
  /** Snapshot at time of order — names/prices change, the order doesn't */
  itemName: string;
  /** Customer-facing price = basePrice * (1 + markupPct/100), rounded */
  customerPriceCents: number;
  quantity: number;
  /** Optional special instructions, per line */
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    deliveryAddress: string;
    /** "Leave at the door, blue beach house" — reaches the driver */
    deliveryNotes?: string;
  };
  items: OrderLineItem[];
  /** Cart subtotal at customer-facing prices */
  subtotalCents: number;
  /** Flat per-order delivery fee (configurable; default $5) */
  deliveryFeeCents: number;
  /** PAL service fee (configurable; default $2) */
  serviceFeeCents: number;
  /** Customer-chosen tip at checkout */
  tipCents: number;
  /** Computed sales tax (Texas 8.25%) */
  taxCents: number;
  totalCents: number;
  /** What the restaurant gets in cash at pickup */
  restaurantCostCents: number;
  /** What PAL pays the driver: 50% markup + 50% delivery + 100% tip */
  driverPayoutCents: number;
  /** What PAL keeps: 50% markup + 50% delivery + 100% service */
  palNetCents: number;
  // Stripe
  paymentIntentId?: string;
  checkoutSessionId?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  // Dispatch
  status: OrderStatus;
  driverId?: string;
  // Timestamps (ISO)
  placedAt: string;
  paidAt?: string;
  dispatchedAt?: string;
  claimedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}
