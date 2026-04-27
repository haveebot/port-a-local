// Customer-safe view of an Order. Strips PAL economics (driver share,
// PAL net, restaurant cost) so they never reach the iOS client.

import { getRestaurantById } from "@/data/delivery-restaurants";
import type { Order, OrderStatus } from "@/data/delivery-types";

export interface CustomerOrderLine {
  itemName: string;
  quantity: number;
  customerPriceCents: number;
  notes?: string;
}

export interface CustomerOrderSummary {
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
  /** Top-line totals only — no per-line economics breakdown. */
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
  items: CustomerOrderLine[];
}

export function toCustomerOrderSummary(order: Order): CustomerOrderSummary {
  const restaurant = getRestaurantById(order.restaurantId);
  return {
    id: order.id,
    restaurantId: order.restaurantId,
    restaurantName: restaurant?.name ?? "Restaurant",
    status: order.status,
    paymentStatus: order.paymentStatus,
    placedAt: order.placedAt,
    paidAt: order.paidAt,
    dispatchedAt: order.dispatchedAt,
    pickedUpAt: order.pickedUpAt,
    deliveredAt: order.deliveredAt,
    itemCount: order.items.reduce((sum, l) => sum + l.quantity, 0),
    totalCents: order.totalCents,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    serviceFeeCents: order.serviceFeeCents,
    tipCents: order.tipCents,
    taxCents: order.taxCents,
    customer: {
      name: order.customer.name,
      deliveryAddress: order.customer.deliveryAddress,
      deliveryNotes: order.customer.deliveryNotes,
    },
    items: order.items.map((l) => ({
      itemName: l.itemName,
      quantity: l.quantity,
      customerPriceCents: l.customerPriceCents,
      notes: l.notes,
    })),
  };
}
