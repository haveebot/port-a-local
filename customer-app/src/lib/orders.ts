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

async function customerQuery(): Promise<URLSearchParams | null> {
  const session = await loadSession();
  if (!session?.email) return null;
  const params = new URLSearchParams();
  params.set("email", session.email);
  return params;
}

export async function fetchMyOrders(): Promise<CustomerOrder[]> {
  const params = await customerQuery();
  if (!params) return [];
  const res = await fetch(apiUrl(`/api/customer/orders?${params.toString()}`));
  if (!res.ok) throw new Error("Failed to load orders");
  const json = (await res.json()) as { orders: CustomerOrder[] };
  return json.orders ?? [];
}

export async function fetchMyOrder(id: string): Promise<CustomerOrder | null> {
  const params = await customerQuery();
  if (!params) return null;
  const res = await fetch(
    apiUrl(`/api/customer/orders/${id}?${params.toString()}`)
  );
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
