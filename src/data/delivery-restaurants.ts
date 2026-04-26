/**
 * PAL Delivery — restaurant + menu seeds.
 *
 * V1 manual config — easy for Winston to edit, git-tracked, no admin UI.
 * Two restaurants live: Crazy Cajun + Dairy Queen Port Aransas.
 *
 * To add a restaurant:
 *   1. Append to RESTAURANTS with id/slug/address/hours/markup
 *   2. Append CATEGORIES (sections of the menu)
 *   3. Append MENU_ITEMS (one entry per item; basePriceCents = retail
 *      price the restaurant charges; markup is applied at display time)
 *
 * To pause delivery from a restaurant: set isActive=false.
 *
 * To update a price: edit basePriceCents. The markup buffer (set per
 * restaurant) absorbs small drift; large changes should be edited
 * directly.
 */

import type {
  DeliveryRestaurant,
  MenuCategory,
  MenuItem,
} from "./delivery-types";

export const RESTAURANTS: DeliveryRestaurant[] = [
  {
    id: "crazy-cajun",
    slug: "crazy-cajun",
    name: "The Crazy Cajun",
    pickupAddress: "303 Beach Ave, Port Aransas, TX 78373",
    pickupNotes:
      "Tell the host it's a PAL Delivery pickup; they'll have it bagged at the front.",
    phone: "(361) 749-5069",
    businessSlug: "crazy-cajun-seafood-restaurant",
    shortDescription:
      "Boiled seafood dumped on the table since 1987. Hungry Cajun, gumbo, étouffée — to your beach house.",
    cuisineTags: ["Cajun", "Seafood"],
    accent: "#C84A2C",
    deliveryHours: [
      // Generous launch hours — driver will know if restaurant is actually
      // open before pickup. Tighten once we have steady ops.
      { day: "monday", open: "10:00", close: "21:00" },
      { day: "tuesday", open: "10:00", close: "21:00" },
      { day: "wednesday", open: "10:00", close: "21:00" },
      { day: "thursday", open: "10:00", close: "21:00" },
      { day: "friday", open: "10:00", close: "21:00" },
      { day: "saturday", open: "10:00", close: "21:00" },
      { day: "sunday", open: "10:00", close: "21:00" },
    ],
    markupPct: 45,
    isActive: true,
  },
  {
    id: "dq-port-a",
    slug: "dairy-queen",
    name: "Dairy Queen — Port Aransas",
    pickupAddress: "307 W Cotter Ave, Port Aransas, TX 78373",
    pickupNotes:
      "Drive-thru is fastest after 6pm — driver should ask for the PAL pickup at the window.",
    phone: "(361) 749-3339",
    shortDescription:
      "The classic island DQ. Blizzards, burgers, baskets — comfort food to the sand.",
    cuisineTags: ["American", "Burgers", "Ice Cream"],
    accent: "#E1242C",
    deliveryHours: [
      // Generous launch hours — DQ is essentially open all day every day.
      { day: "monday", open: "10:00", close: "21:00" },
      { day: "tuesday", open: "10:00", close: "21:00" },
      { day: "wednesday", open: "10:00", close: "21:00" },
      { day: "thursday", open: "10:00", close: "21:00" },
      { day: "friday", open: "10:00", close: "21:00" },
      { day: "saturday", open: "10:00", close: "21:00" },
      { day: "sunday", open: "10:00", close: "21:00" },
    ],
    markupPct: 45,
    isActive: true,
  },
];

export const CATEGORIES: MenuCategory[] = [
  // Crazy Cajun
  { id: "cc-dump", restaurantId: "crazy-cajun", name: "The Dump", sort: 1 },
  { id: "cc-baskets", restaurantId: "crazy-cajun", name: "Baskets", sort: 2 },
  { id: "cc-cajun", restaurantId: "crazy-cajun", name: "Cajun Specialties", sort: 3 },
  { id: "cc-sides", restaurantId: "crazy-cajun", name: "Sides", sort: 4 },
  { id: "cc-drinks", restaurantId: "crazy-cajun", name: "Drinks", sort: 5 },
  // DQ
  { id: "dq-burgers", restaurantId: "dq-port-a", name: "Burgers & Sandwiches", sort: 1 },
  { id: "dq-baskets", restaurantId: "dq-port-a", name: "Baskets & Sides", sort: 2 },
  { id: "dq-blizzards", restaurantId: "dq-port-a", name: "Blizzards", sort: 3 },
  { id: "dq-treats", restaurantId: "dq-port-a", name: "Cones, Sundaes & Shakes", sort: 4 },
  { id: "dq-drinks", restaurantId: "dq-port-a", name: "Drinks", sort: 5 },
];

/**
 * Menu items — basePriceCents is the price the RESTAURANT charges.
 * Customer-facing price = basePrice * (1 + markupPct/100), rounded.
 *
 * Prices below are best-effort starter values — Winston/drivers will
 * verify on the first ~5 orders and we'll true them up. Expected drift
 * is absorbed by the markup buffer.
 */
export const MENU_ITEMS: MenuItem[] = [
  // ---------- The Crazy Cajun ----------
  {
    id: "cc-hungry-cajun",
    restaurantId: "crazy-cajun",
    categoryId: "cc-dump",
    name: "The Hungry Cajun",
    description:
      "Their signature dump: shrimp, crab, smoked sausage, corn, new potatoes — boiled in Cajun spice and dumped on butcher paper. Serves 1.",
    basePriceCents: 3995,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "cc-cajun-feast",
    restaurantId: "crazy-cajun",
    categoryId: "cc-dump",
    name: "Cajun Feast for Two",
    description:
      "Doubled Hungry Cajun — for a couple, or one beach-day appetite. Add crawfish in season.",
    basePriceCents: 7295,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "cc-shrimp-basket",
    restaurantId: "crazy-cajun",
    categoryId: "cc-baskets",
    name: "Fried Shrimp Basket",
    description: "Half-pound of fried Gulf shrimp, fries, slaw, hush puppies.",
    basePriceCents: 1895,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "cc-fish-basket",
    restaurantId: "crazy-cajun",
    categoryId: "cc-baskets",
    name: "Fried Fish Basket",
    description: "Hand-breaded Gulf catch, fries, slaw, hush puppies.",
    basePriceCents: 1895,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "cc-gumbo",
    restaurantId: "crazy-cajun",
    categoryId: "cc-cajun",
    name: "Cajun Gumbo (bowl)",
    description: "Andouille, shrimp, dark roux. Served over rice.",
    basePriceCents: 1095,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "cc-etouffee",
    restaurantId: "crazy-cajun",
    categoryId: "cc-cajun",
    name: "Shrimp Étouffée",
    description: "Gulf shrimp simmered in seasoned roux over rice.",
    basePriceCents: 1495,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "cc-redbeans",
    restaurantId: "crazy-cajun",
    categoryId: "cc-cajun",
    name: "Red Beans & Rice with Sausage",
    description: "Slow-cooked red beans, andouille, rice.",
    basePriceCents: 1095,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "cc-side-corn",
    restaurantId: "crazy-cajun",
    categoryId: "cc-sides",
    name: "Boiled Corn (1 ear)",
    basePriceCents: 295,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "cc-side-potatoes",
    restaurantId: "crazy-cajun",
    categoryId: "cc-sides",
    name: "New Potatoes (cup)",
    basePriceCents: 295,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "cc-side-sausage",
    restaurantId: "crazy-cajun",
    categoryId: "cc-sides",
    name: "Smoked Sausage Link",
    basePriceCents: 495,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "cc-drink-tea",
    restaurantId: "crazy-cajun",
    categoryId: "cc-drinks",
    name: "Sweet Tea (32oz)",
    basePriceCents: 395,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "cc-drink-soda",
    restaurantId: "crazy-cajun",
    categoryId: "cc-drinks",
    name: "Fountain Soda (32oz)",
    basePriceCents: 395,
    isAvailable: true,
    sort: 2,
  },

  // ---------- Dairy Queen — Port Aransas ----------
  {
    id: "dq-cheeseburger",
    restaurantId: "dq-port-a",
    categoryId: "dq-burgers",
    name: "Bacon Cheeseburger",
    description: "1/4 lb beef, bacon, cheese, lettuce, tomato, pickles, onion.",
    basePriceCents: 695,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "dq-doublecheeseburger",
    restaurantId: "dq-port-a",
    categoryId: "dq-burgers",
    name: "Double Cheeseburger",
    description: "Two 1/4 lb patties, cheese, lettuce, tomato, pickles, onion.",
    basePriceCents: 795,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "dq-chicken-strip-sandwich",
    restaurantId: "dq-port-a",
    categoryId: "dq-burgers",
    name: "Chicken Strip Sandwich",
    description: "Crispy chicken strips, lettuce, tomato, mayo on a bun.",
    basePriceCents: 695,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "dq-chicken-basket-4",
    restaurantId: "dq-port-a",
    categoryId: "dq-baskets",
    name: "Chicken Strip Basket (4 pc)",
    description: "Four hand-breaded chicken strips, fries, Texas toast, gravy.",
    basePriceCents: 895,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "dq-chicken-basket-6",
    restaurantId: "dq-port-a",
    categoryId: "dq-baskets",
    name: "Chicken Strip Basket (6 pc)",
    description: "Six chicken strips, fries, Texas toast, gravy.",
    basePriceCents: 1095,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "dq-fries-large",
    restaurantId: "dq-port-a",
    categoryId: "dq-baskets",
    name: "Fries (Large)",
    basePriceCents: 295,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "dq-onion-rings",
    restaurantId: "dq-port-a",
    categoryId: "dq-baskets",
    name: "Onion Rings",
    basePriceCents: 295,
    isAvailable: true,
    sort: 4,
  },
  {
    id: "dq-blizzard-oreo-md",
    restaurantId: "dq-port-a",
    categoryId: "dq-blizzards",
    name: "Oreo Blizzard (Medium)",
    description: "Crumbled Oreos blended into vanilla soft serve.",
    basePriceCents: 549,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "dq-blizzard-mm-md",
    restaurantId: "dq-port-a",
    categoryId: "dq-blizzards",
    name: "M&M Blizzard (Medium)",
    description: "Milk-chocolate M&Ms blended into vanilla soft serve.",
    basePriceCents: 549,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "dq-blizzard-strawberry-md",
    restaurantId: "dq-port-a",
    categoryId: "dq-blizzards",
    name: "Strawberry Cheesecake Blizzard (Medium)",
    description: "Strawberries + cheesecake pieces in vanilla soft serve.",
    basePriceCents: 549,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "dq-cone-md",
    restaurantId: "dq-port-a",
    categoryId: "dq-treats",
    name: "Vanilla Cone (Medium)",
    basePriceCents: 295,
    isAvailable: true,
    sort: 1,
  },
  {
    id: "dq-cone-dipped",
    restaurantId: "dq-port-a",
    categoryId: "dq-treats",
    name: "Chocolate-Dipped Cone (Medium)",
    basePriceCents: 345,
    isAvailable: true,
    sort: 2,
  },
  {
    id: "dq-shake-choc",
    restaurantId: "dq-port-a",
    categoryId: "dq-treats",
    name: "Chocolate Shake (Medium)",
    basePriceCents: 449,
    isAvailable: true,
    sort: 3,
  },
  {
    id: "dq-drink-soda",
    restaurantId: "dq-port-a",
    categoryId: "dq-drinks",
    name: "Fountain Soda (Large)",
    basePriceCents: 295,
    isAvailable: true,
    sort: 1,
  },
];

/* -------------------- Helpers -------------------- */

export function getRestaurant(slug: string): DeliveryRestaurant | undefined {
  return RESTAURANTS.find((r) => r.slug === slug && r.isActive);
}

export function getActiveRestaurants(): DeliveryRestaurant[] {
  return RESTAURANTS.filter((r) => r.isActive);
}

export function getCategoriesFor(restaurantId: string): MenuCategory[] {
  return CATEGORIES.filter((c) => c.restaurantId === restaurantId).sort(
    (a, b) => a.sort - b.sort,
  );
}

export function getItemsFor(restaurantId: string): MenuItem[] {
  return MENU_ITEMS.filter(
    (i) => i.restaurantId === restaurantId && i.isAvailable,
  ).sort((a, b) => a.sort - b.sort);
}

export function getMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((i) => i.id === id);
}

/** Customer-facing price after markup, rounded to nearest cent (then nickel) */
export function customerPrice(item: MenuItem, markupPct: number): number {
  const raw = item.basePriceCents * (1 + markupPct / 100);
  // Round to nearest 5 cents — looks intentional, not algorithmic
  return Math.round(raw / 5) * 5;
}

/**
 * PAL hard cutoff — orders close at 21:00 (9pm) Central regardless of
 * what individual restaurants list. Protects driver / Winston time and
 * gives the kitchen room to fulfill backlog before they close.
 *
 * To raise/lower: change this constant. To remove: pass a sentinel like
 * 24 * 60 (24:00).
 */
export const PAL_HARD_CUTOFF_MINUTES = 21 * 60; // 21:00 Central

/** Is the restaurant currently delivering (within an open window AND before PAL cutoff)? */
export function isOpenNow(r: DeliveryRestaurant, now = new Date()): boolean {
  // Use the restaurant's local hours (America/Chicago).
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "long",
  });
  const parts = fmt.formatToParts(now);
  const weekday = (parts.find((p) => p.type === "weekday")?.value ?? "")
    .toLowerCase();
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const nowMin = parseInt(hour, 10) * 60 + parseInt(minute, 10);

  // PAL hard cutoff supersedes everything
  if (nowMin >= PAL_HARD_CUTOFF_MINUTES) return false;

  return r.deliveryHours.some((w) => {
    if (w.day !== weekday) return false;
    const [oh, om] = w.open.split(":").map((n) => parseInt(n, 10));
    const [ch, cm] = w.close.split(":").map((n) => parseInt(n, 10));
    const effectiveClose = Math.min(
      ch * 60 + cm,
      PAL_HARD_CUTOFF_MINUTES,
    );
    return nowMin >= oh * 60 + om && nowMin <= effectiveClose;
  });
}
