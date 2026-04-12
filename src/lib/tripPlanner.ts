const TRIP_KEY = "pal-my-trip";

export interface TripItem {
  type: "business" | "story";
  slug: string;
  name: string;
  category: string;
  icon?: string;
  tagline?: string;
  addedAt: string;
}

export function getTripItems(): TripItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TRIP_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToTrip(item: Omit<TripItem, "addedAt">): void {
  const items = getTripItems();
  if (items.some((i) => i.type === item.type && i.slug === item.slug)) return;
  items.push({ ...item, addedAt: new Date().toISOString() });
  localStorage.setItem(TRIP_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("trip-updated"));
}

export function removeFromTrip(type: string, slug: string): void {
  const items = getTripItems().filter((i) => !(i.type === type && i.slug === slug));
  localStorage.setItem(TRIP_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("trip-updated"));
}

export function isInTrip(type: string, slug: string): boolean {
  return getTripItems().some((i) => i.type === type && i.slug === slug);
}

export function clearTrip(): void {
  localStorage.removeItem(TRIP_KEY);
  window.dispatchEvent(new Event("trip-updated"));
}
