import { apiUrl } from "./config";
import { loadSession } from "./auth";

export type OrderStatus =
  | "placed"
  | "paid"
  | "dispatching"
  | "claimed"
  | "picked_up"
  | "delivered"
  | "canceled"
  | "refunded";

export interface OrderLine {
  itemName: string;
  quantity: number;
  customerPriceCents: number;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  placedAt: string;
  paidAt?: string;
  dispatchedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  itemCount: number;
  totalCents: number;
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  tipCents: number;
  taxCents: number;
  customer: {
    name: string;
    deliveryAddress: string;
    deliveryNotes?: string;
  };
  items: OrderLine[];
}

const ORDER_FETCH_TIMEOUT_MS = 8000;

/** Returns auth headers for a logged-in customer, or null if not signed in. */
async function authHeaders(): Promise<Record<string, string> | null> {
  const session = await loadSession();
  if (!session?.sessionToken) return null;
  return { Authorization: `Bearer ${session.sessionToken}` };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ORDER_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchMyOrders(): Promise<CustomerOrder[]> {
  const headers = await authHeaders();
  if (!headers) return [];
  const res = await fetchWithTimeout(apiUrl(`/api/customer/orders`), { headers });
  if (!res.ok) throw new Error("Failed to load orders");
  const json = (await res.json()) as { orders: CustomerOrder[] };
  return json.orders ?? [];
}

export async function fetchMyOrder(id: string): Promise<CustomerOrder | null> {
  const headers = await authHeaders();
  if (!headers) return null;
  const res = await fetchWithTimeout(apiUrl(`/api/customer/orders/${id}`), {
    headers,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load order");
  const json = (await res.json()) as { order: CustomerOrder };
  return json.order;
}

/** Friendly label for a status — used by the timeline + status pill. */
export function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "placed":
      return "Order received";
    case "paid":
      return "Payment confirmed";
    case "dispatching":
      return "Finding a runner";
    case "claimed":
      return "Runner on the way to the restaurant";
    case "picked_up":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "canceled":
      return "Canceled";
    case "refunded":
      return "Refunded";
  }
}

export function isTerminal(s: OrderStatus): boolean {
  return s === "delivered" || s === "canceled" || s === "refunded";
}

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
