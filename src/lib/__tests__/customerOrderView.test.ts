import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toCustomerOrderSummary,
  CustomerOrderSummary,
  CustomerOrderLine,
} from '@/lib/customerOrderView';
import type { Order, OrderStatus } from '@/data/delivery-types';
import { getRestaurantById } from '@/data/delivery-restaurants';

// Mock the external dependency getRestaurantById
vi.mock('@/data/delivery-restaurants', () => ({
  getRestaurantById: vi.fn(),
}));

// Define a mock restaurant structure
const mockRestaurant = {
  id: 'rest-123',
  name: 'The Mock Bistro',
  // Include other fields if necessary, but only name is used by the function
};

// Define a standard mock order
const mockOrder: Order = {
  id: 'order-abc',
  restaurantId: 'rest-123',
  customer: {
    name: 'John Doe',
    phone: '555-1234',
    deliveryAddress: '123 Main St',
    deliveryNotes: 'Leave at the door.',
  },
  items: [
    {
      itemId: 'item-1',
      itemName: 'Burger Deluxe',
      customerPriceCents: 1500,
      quantity: 2,
      notes: 'No pickles',
    },
    {
      itemId: 'item-2',
      itemName: 'Fries',
      customerPriceCents: 500,
      quantity: 1,
      notes: undefined,
    },
  ],
  subtotalCents: 3500, // (1500 * 2) + (500 * 1)
  deliveryFeeCents: 500,
  serviceFeeCents: 200,
  tipCents: 300,
  taxCents: 300,
  totalCents: 4500,
  // Sensitive/PAL economics fields (must be ignored by the function)
  restaurantCostCents: 1000,
  driverPayoutCents: 1500,
  palNetCents: 1000,
  // Stripe/Payment fields (must be ignored)
  paymentIntentId: 'pi_xyz123',
  checkoutSessionId: 'cs_abc',
  paymentStatus: 'paid',
  // Dispatch/Status fields
  status: 'delivered',
  driverId: 'driver-456',
  // Timestamps
  placedAt: '2023-01-01T10:00:00Z',
  paidAt: '2023-01-01T10:05:00Z',
  dispatchedAt: '2023-01-01T10:10:00Z',
  claimedAt: '2023-01-01T10:15:00Z',
  pickedUpAt: '2023-01-01T10:20:00Z',
  deliveredAt: '2023-01-01T10:30:00Z',
};

describe('toCustomerOrderSummary', () => {
  const mockGetRestaurantById = getRestaurantById as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the dependency to return the mock restaurant
    mockGetRestaurantById.mockReturnValue(mockRestaurant);
  });

  it('should correctly map a standard order into a customer-safe summary', () => {
    const summary = toCustomerOrderSummary(mockOrder);

    // 1. Check basic structure and data integrity
    expect(summary.id).toBe(mockOrder.id);
    expect(summary.restaurantId).toBe(mockOrder.restaurantId);
    expect(summary.restaurantName).toBe(mockRestaurant.name);
    expect(summary.status).toBe(mockOrder.status);
    expect(summary.paymentStatus).toBe(mockOrder.paymentStatus);
    expect(summary.placedAt).toBe(mockOrder.placedAt);
    expect(summary.paidAt).toBe(mockOrder.paidAt);
    expect(summary.deliveredAt).toBe(mockOrder.deliveredAt);
    expect(summary.itemCount).toBe(3); // 2 + 1
    expect(summary.totalCents).toBe(mockOrder.totalCents);
    expect(summary.subtotalCents).toBe(mockOrder.subtotalCents);
    expect(summary.deliveryFeeCents).toBe(mockOrder.deliveryFeeCents);
    expect(summary.serviceFeeCents).toBe(mockOrder.serviceFeeCents);
    expect(summary.tipCents).toBe(mockOrder.tipCents);
    expect(summary.taxCents).toBe(mockOrder.taxCents);

    // 2. Check customer details
    expect(summary.customer.name).toBe(mockOrder.customer.name);
    expect(summary.customer.deliveryAddress).toBe(mockOrder.customer.deliveryAddress);
    expect(summary.customer.deliveryNotes).toBe(mockOrder.customer.deliveryNotes);

    // 3. Check items array round-trip
    expect(summary.items).toHaveLength(2);
    expect(summary.items[0]).toEqual({
      itemName: 'Burger Deluxe',
      quantity: 2,
      customerPriceCents: 1500,
      notes: 'No pickles',
    });
    expect(summary.items[1]).toEqual({
      itemName: 'Fries',
      quantity: 1,
      customerPriceCents: 500,
      notes: undefined,
    });
  });

  it('should strip all sensitive PAL economics and internal fields', () => {
    const summary = toCustomerOrderSummary(mockOrder);

    // Check for the absence of sensitive fields
    expect(summary).not.toHaveProperty('driverPayoutCents');
    expect(summary).not.toHaveProperty('restaurantCostCents');
    expect(summary).not.toHaveProperty('palNetCents');
    expect(summary).not.toHaveProperty('paymentIntentId');
    expect(summary).not.toHaveProperty('checkoutSessionId');
    // Ensure the original Order object structure is not leaked
    expect(Object.keys(summary)).toEqual(expect.arrayContaining([
      'id',
      'restaurantId',
      'restaurantName',
      'status',
      'paymentStatus',
      'placedAt',
      'paidAt',
      'dispatchedAt',
      'pickedUpAt',
      'deliveredAt',
      'itemCount',
      'totalCents',
      'subtotalCents',
      'deliveryFeeCents',
      'serviceFeeCents',
      'tipCents',
      'taxCents',
      'customer',
      'items',
    ]));
  });

  it('should handle an order with an empty items array', () => {
    const emptyOrder: Order = {
      ...mockOrder,
      items: [],
      subtotalCents: 0,
      totalCents: 500,
      // Resetting other fields to reflect empty order
      deliveryFeeCents: 500,
      serviceFeeCents: 0,
      tipCents: 0,
      taxCents: 0,
      restaurantCostCents: 0,
      driverPayoutCents: 0,
      palNetCents: 0,
      paymentIntentId: undefined,
      status: 'placed',
      placedAt: '2023-01-01T10:00:00Z',
      // Keep other timestamps/customer data consistent
    };

    const summary = toCustomerOrderSummary(emptyOrder);

    expect(summary.items).toEqual([]);
    expect(summary.itemCount).toBe(0);
    expect(summary.totalCents).toBe(500);
  });

  it('should handle an order with no tip', () => {
    const noTipOrder: Order = {
      ...mockOrder,
      tipCents: 0,
      totalCents: 4200, // 4500 - 300
      // Ensure other fields are consistent
    };

    const summary = toCustomerOrderSummary(noTipOrder);

    expect(summary.tipCents).toBe(0);
    expect(summary.totalCents).toBe(4200);
  });

  it('should correctly handle item notes being optional or undefined', () => {
    const orderWithNotes: Order = {
      ...mockOrder,
      items: [
        {
          itemId: 'item-1',
          itemName: 'Burger Deluxe',
          customerPriceCents: 1500,
          quantity: 1,
          notes: 'Allergic to nuts', // Explicit note
        },
        {
          itemId: 'item-2',
          itemName: 'Fries',
          customerPriceCents: 500,
          quantity: 1,
          notes: undefined, // No note
        },
      ],
      subtotalCents: 2000,
      totalCents: 3000,
      deliveryFeeCents: 500,
      serviceFeeCents: 200,
      tipCents: 300,
      taxCents: 0,
      restaurantCostCents: 0,
      driverPayoutCents: 0,
      palNetCents: 0,
      paymentIntentId: undefined,
      status: 'paid',
      placedAt: '2023-01-01T10:00:00Z',
      paidAt: '2023-01-01T10:05:00Z',
      dispatchedAt: '2023-01-01T10:10:00Z',
      claimedAt: '2023-01-01T10:15:00Z',
      pickedUpAt: '2023-01-01T10:20:00Z',
      deliveredAt: '2023-01-01T10:30:00Z',
    };

    const summary = toCustomerOrderSummary(orderWithNotes);

    expect(summary.items[0].notes).toBe('Allergic to nuts');
    expect(summary.items[1].notes).toBeUndefined();
  });

  it('should handle all possible OrderStatus values', async () => {
    const statuses: OrderStatus[] = [
      'placed',
      'paid',
      'dispatching',
      'claimed',
      'picked_up',
      'delivered',
      'canceled',
      'refunded',
    ];

    for (const status of statuses) {
      const order: Order = {
        ...mockOrder,
        status: status,
        // Resetting timestamps to ensure the status change is reflected
        placedAt: '2023-01-01T10:00:00Z',
        paidAt: status === 'paid' ? '2023-01-01T10:05:00Z' : undefined,
        dispatchedAt: status === 'dispatching' ? '2023-01-01T10:10:00Z' : undefined,
        claimedAt: status === 'claimed' ? '2023-01-01T10:15:00Z' : undefined,
        pickedUpAt: status === 'picked_up' ? '2023-01-01T10:20:00Z' : undefined,
        deliveredAt: status === 'delivered' ? '2023-01-01T10:30:00Z' : undefined,
      };

      const summary = toCustomerOrderSummary(order);
      expect(summary.status).toBe(status);
    }
  });
});
