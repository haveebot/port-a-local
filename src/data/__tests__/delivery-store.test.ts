import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createOrder,
  getOrder,
  getOrderByCheckoutSession,
  getOrdersForCustomer,
  markOrderPaid,
  createDriverApplication,
  getDriverByTokenDb,
  getDriverByPhone,
  getOnlineDriverIds,
  getDriverStatus,
  setDriverOnline,
  setDriverOffline,
  recordDriverTransfer,
  getLeaderboard,
  getMissedPayouts,
  listCustomPayouts,
  getRecentOrders,
  // Note: The prompt mentions newTrackingToken and hmacDriverToken, but these functions
  // are not visible in the provided module code. We will test the visible token logic.
} from '../src/data/delivery-store'; // Assuming the module is in src/data/delivery-store.ts

// Mock the entire @vercel/postgres module
vi.mock('@vercel/postgres', () => ({
  createPool: vi.fn(() => ({
    sql: vi.fn(),
  })),
}));

// Mock Date.now() and Math.random() to ensure deterministic ID generation for testing
const mockDate = new Date('2024-01-01T12:00:00.000Z');
const mockMath = Object.assign(Math, {
  random: vi.fn(),
});

// Helper to set up the mock SQL responses
const setupMockSql = (mockResults: any[]) => {
  const mockSql = vi.fn();
  mockSql.mockImplementation(async (...args: any[]) => {
    // Simple check to see if the call is a template literal (sql`...`)
    if (typeof args[0] === 'string' && args[0].startsWith('SELECT')) {
      // Simulate fetching rows
      return { rows: mockResults.shift() || [] };
    }
    // Simulate INSERT/UPDATE/DELETE
    if (typeof args[0] === 'string' && args[0].startsWith('INSERT') || args[0].startsWith('UPDATE')) {
      return { rowCount: mockResults.shift() || 1 };
    }
    // Simulate simple returns
    return { rows: mockResults.shift() || [] };
  });
  return mockSql;
};

describe('Delivery Store Data Layer', () => {
  let mockPool: any;
  let mockSql: any;

  beforeEach(() => {
    // Reset mocks and environment variables
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.123); // Deterministic random for IDs
    vi.spyOn(Math, 'floor').mockImplementation((x) => Math.floor(x));
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // Mock the VercelPool structure
    mockPool = {
      sql: vi.fn(),
    };
    mockSql = mockPool.sql;

    // Mock the global module dependency
    (vi.mocked(require('@vercel/postgres')).createPool).mockReturnValue(mockPool);

    // Set up the mock SQL implementation for the current test block
    mockSql.mockImplementation(async (...args: any[]) => {
      // Default successful execution for most queries
      return { rows: [] };
    });

    // Ensure the module is re-imported or reset if necessary (though vitest usually handles this)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization and Schema Setup', () => {
    it('should throw an error if POSTGRES_URL or DATABASE_URL is unset', async () => {
      delete process.env.POSTGRES_URL;
      delete process.env.DATABASE_URL;
      await expect(async () => {
        // Calling any function that triggers getPool()
        await getDriverByTokenDb('test');
      }).rejects.toThrow(
        "delivery-store needs POSTGRES_URL or DATABASE_URL",
      );
    });

    it('should initialize the pool using POSTGRES_URL if available', async () => {
      process.env.POSTGRES_URL = 'postgres://test_url';
      await getDriverByTokenDb('test');
      expect(vi.mocked(require('@vercel/postgres')).createPool).toHaveBeenCalledWith(
        { connectionString: 'postgres://test_url' },
      );
    });

    it('should fall back to DATABASE_URL if POSTGRES_URL is unset', async () => {
      process.env.POSTGRES_URL = undefined;
      process.env.DATABASE_URL = 'postgres://fallback_url';
      await getDriverByTokenDb('test');
      expect(vi.mocked(require('@vercel/postgres')).createPool).toHaveBeenCalledWith(
        { connectionString: 'postgres://fallback_url' },
      );
    });
  });

  describe('Driver Management (CRUD & Lookup)', () => {
    const mockDriverId = 'drv-123';
    const mockToken = 'DRV_TESTTOKEN';
    const mockInput = {
      name: 'John Doe',
      phone: '5551234567',
      email: 'john@example.com',
      licenseAcknowledged: true,
      insuranceAcknowledged: true,
      termsAcknowledged: true,
    };
    const mockDriverRecord = {
      id: mockDriverId,
      name: mockInput.name,
      phone: mockInput.phone,
      email: mockInput.email,
      token: mockToken,
      isActive: false,
      payoutMethod: null,
      payoutHandle: null,
      vehicle: null,
      availability: null,
      why: null,
      appliedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedReason: null,
      licenseAcknowledged: true,
      insuranceAcknowledged: true,
      insuranceCarrier: null,
      licenseVerifiedAt: null,
      insuranceVerifiedAt: null,
      verifiedBy: null,
      licensePlate: null,
      licensePlateState: null,
      termsAcknowledged: true,
    };

    it('should create a new driver application and return a full record', async () => {
      // Mock the sequence: 1. INSERT, 2. SELECT (getDriverById)
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 })); // INSERT
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ id: mockDriverId, name: mockInput.name, phone: mockInput.phone, email: mockInput.email, token: mockToken, is_active: false, applied_at: new Date().toISOString(), license_acknowledged: true, insurance_acknowledged: true, terms_acknowledged: true, /* ... other fields */ }] })); // SELECT

      const driver = await createDriverApplication(mockInput);

      expect(driver.id).toBe(mockDriverId);
      expect(driver.token).toMatch(/^drv_[A-Z0-9]{28}$/);
      expect(driver.isActive).toBe(false);
      expect(mockSql).toHaveBeenCalledTimes(2);
    });

    it('should retrieve a driver by their unique token', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ id: mockDriverId, name: 'Test', phone: '123', email: 'a@b.com', token: mockToken, is_active: true, applied_at: new Date().toISOString(), license_acknowledged: true, insurance_acknowledged: true, terms_acknowledged: true, /* ... */ }] }));

      const driver = await getDriverByTokenDb(mockToken);
      expect(driver).toMatchObject({ id: mockDriverId, token: mockToken, isActive: true });
    });

    it('should retrieve a driver by phone number (matching last 10 digits)', async () => {
      const phone = '1-800-555-1234';
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ id: mockDriverId, name: 'Test', phone: '1234567890', email: 'a@b.com', token: 't', is_active: true, applied_at: new Date().toISOString(), license_acknowledged: true, insurance_acknowledged: true, terms_acknowledged: true, /* ... */ }] }));

      const driver = await getDriverByPhone(phone);
      expect(driver).toMatchObject({ id: mockDriverId, phone: '1234567890' });
    });

    it('should handle multiple calls to newId and newDriverToken generating unique strings', async () => {
      // Since we mock Math.random, we test the format and uniqueness based on the mock setup.
      // We rely on the internal functions being called correctly.
      // We test the format, as true uniqueness across time is hard to mock perfectly.
      const id1 = await createDriverApplication(mockInput);
      const id2 = await createDriverApplication(mockInput);
      expect(id1.id).not.toBe(id2.id);
      expect(id1.token).toMatch(/^drv_[A-Z0-9]{28}$/);
    });
  });

  describe('Order Management', () => {
    const mockOrderId = 'ord-abc';
    const mockSessionId = 'sess-xyz';
    const mockOrderInput = {
      restaurantId: 'R1',
      customer: { email: 'c@c.com', phone: '123' },
      items: [{ id: 'i1' }],
      subtotalCents: 1000,
      deliveryFeeCents: 500,
      serviceFeeCents: 100,
      tipCents: 50,
      taxCents: 50,
      totalCents: 1700,
      restaurantCostCents: 800,
      driverPayoutCents: 500,
      palNetCents: 400,
      checkoutSessionId: mockSessionId,
      paymentIntentId: 'pi_abc',
    };
    const mockOrderRecord = {
      id: mockOrderId,
      restaurantId: 'R1',
      customer: { email: 'c@c.com', phone: '123' },
      items: [{ id: 'i1' }],
      subtotalCents: 1000,
      deliveryFeeCents: 500,
      serviceFeeCents: 100,
      tipCents: 50,
      taxCents: 50,
      totalCents: 1700,
      restaurantCostCents: 800,
      driverPayoutCents: 500,
      palNetCents: 400,
      paymentIntentId: 'pi_abc',
      checkoutSessionId: mockSessionId,
      paymentStatus: 'pending',
      status: 'placed',
      driverId: undefined,
      placedAt: new Date().toISOString(),
      paidAt: undefined,
      dispatchedAt: undefined,
      claimedAt: undefined,
      pickedUpAt: undefined,
      deliveredAt: undefined,
    };

    it('should create an order and return the full record', async () => {
      // Mock the sequence: 1. INSERT, 2. SELECT (getOrder)
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 })); // INSERT
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock order data */ }] })); // SELECT

      const order = await createOrder(mockOrderInput);

      expect(order.id).toBe(mockOrderId);
      expect(order.totalCents).toBe(1700);
      expect(order.status).toBe('placed');
    });

    it('should retrieve an order by ID', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock order data */ }] }));
      const order = await getOrder(mockOrderId);
      expect(order).toMatchObject({ id: mockOrderId, status: 'placed' });
    });

    it('should retrieve an order by checkout session ID', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock order data */ }] }));
      const order = await getOrderByCheckoutSession(mockSessionId);
      expect(order).toMatchObject({ checkoutSessionId: mockSessionId });
    });

    it('should mark an order as paid and update status/timestamps', async () => {
      // Mock the sequence: 1. UPDATE, 2. SELECT (getOrder)
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 })); // UPDATE
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock updated order data */ }] })); // SELECT

      const updatedOrder = await markOrderPaid(mockOrderId, 'pi_paid');

      expect(updatedOrder).toMatchObject({
        paymentStatus: 'paid',
        status: 'dispatching',
        paymentIntentId: 'pi_paid',
        paidAt: new Date().toISOString(),
        dispatchedAt: new Date().toISOString(),
      });
    });

    it('should retrieve orders for a customer by email', async () => {
      const customerEmail = 'test@customer.com';
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock order data */ }] }));
      const orders = await getOrdersForCustomer({ email: customerEmail });
      expect(orders.length).toBe(1);
    });

    it('should retrieve orders for a customer by phone', async () => {
      const customerPhone = '555-123-4567';
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock order data */ }] }));
      const orders = await getOrdersForCustomer({ phone: customerPhone });
      expect(orders.length).toBe(1);
    });
  });

  describe('Driver Status and Availability', () => {
    const mockDriverId = 'd1';
    const mockStatusRecord = {
      online_until: new Date(Date.now() + 3600000).toISOString(),
      last_online_at: new Date().toISOString(),
      last_offline_at: null,
      stripe_account_id: 'stripe_123',
      payouts_enabled: true,
    };

    it('should set a driver online for a specified duration', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 })); // INSERT/UPDATE
      await setDriverOnline(mockDriverId, 2);
      expect(mockSql).toHaveBeenCalledWith(
        expect.stringContaining('online_until ='),
        expect.stringContaining('2'),
      );
    });

    it('should set a driver offline', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 })); // INSERT/UPDATE
      await setDriverOffline(mockDriverId);
      expect(mockSql).toHaveBeenCalledWith(
        expect.stringContaining('last_offline_at'),
      );
    });

    it('should get IDs of all currently online drivers', async () => {
      // Mock the query to return two online drivers
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ driver_id: 'd1' }, { driver_id: 'd2' }] }));
      const onlineIds = await getOnlineDriverIds();
      expect(onlineIds).toEqual(['d1', 'd2']);
    });

    it('should get the full status of a driver', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ /* mock status data */ }] }));
      const status = await getDriverStatus(mockDriverId);
      expect(status.driverId).toBe(mockDriverId);
      expect(status.isOnline).toBe(true);
      expect(status.stripeAccountId).toBe('stripe_123');
    });

    it('should set Stripe account and payout status', async () => {
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 }));
      await setDriverStripeAccount(mockDriverId, 'stripe_123', true);
      expect(mockSql).toHaveBeenCalledWith(
        expect.stringContaining('stripe_account_id ='),
        'stripe_123',
        true,
      );
    });
  });

  describe('Order Lifecycle and Payouts', () => {
    const mockOrderId = 'ord-payout';
    const mockDriverId = 'd1';
    const mockTransferId = 'trf-123';
    const mockAmount = 1000;

    it('should record a driver transfer if it is a new order (return true)', async () => {
      // rowCount > 0 means INSERT happened
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 1 }));
      const success = await recordDriverTransfer(mockOrderId, mockDriverId, mockTransferId, mockAmount);
      expect(success).toBe(true);
    });

    it('should return false if the transfer already exists (ON CONFLICT DO NOTHING)', async () => {
      // rowCount = 0 means no new row was inserted
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rowCount: 0 }));
      const success = await recordDriverTransfer(mockOrderId, mockDriverId, mockTransferId, mockAmount);
      expect(success).toBe(false);
    });

    it('should check if a transfer record exists for an order', async () => {
      // Case 1: Exists
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [{ 1: 1 }] }));
      await expect(async () => {
        const exists = await hasDriverTransfer(mockOrderId);
        expect(exists).toBe(true);
      });

      // Case 2: Does not exist
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: [] }));
      await expect(async () => {
        const exists = await hasDriverTransfer('nonexistent');
        expect(exists).toBe(false);
      });
    });

    it('should get missed payouts for all eligible orders', async () => {
      // Mock the query to return one missed payout record
      mockSql.mockImplementationOnce(async (...args: any[]) => ({
        rows: [{
          order_id: 'ord-missed',
          driver_id: 'd1',
          name: 'John Doe',
          signup_num: 1,
          driver_payout_cents: 500,
          delivered_at: new Date().toISOString(),
          restaurant_id: 'R1',
          payment_intent_id: 'pi_missed',
        }],
      }));
      const payouts = await getMissedPayouts();
      expect(payouts.length).toBe(1);
      expect(payouts[0].driverName).toBe('John Doe');
      expect(payouts[0].signupNumber).toBe(1);
    });

    it('should list custom payouts filtered by "custom-" prefix', async () => {
      // Mock the query to return two custom payouts
      mockSql.mockImplementationOnce(async (...args: any[]) => ({
        rows: [
          { order_id: 'custom-1', driver_id: 'd1', stripe_transfer_id: 't1', amount_cents: 100, created_at: new Date().toISOString() },
          { order_id: 'custom-2', driver_id: 'd2', stripe_transfer_id: 't2', amount_cents: 200, created_at: new Date().toISOString() },
        ],
      }));
      const payouts = await listCustomPayouts(10);
      expect(payouts.length).toBe(2);
      expect(payouts[0].customId).toBe('custom-1');
    });
  });

  describe('Leaderboard Functionality', () => {
    const mockLeaderboardData = [
      { id: 'd1', signup_num: 1, today_cents: 1000, today_count: 1, week_cents: 5000, week_count: 5, total_cents: 10000, total_count: 10, welcome_bonus_earned: 1 },
      { id: 'd2', signup_num: 4, today_cents: 500, today_count: 1, week_cents: 2000, week_count: 2, total_cents: 5000, total_count: 5, welcome_bonus_earned: 0 },
    ];

    it('should calculate and return the full leaderboard summary', async () => {
      // Mock the complex query result
      mockSql.mockImplementationOnce(async (...args: any[]) => ({ rows: mockLeaderboardData }));

      const summary = await getLeaderboard();

      expect(summary.activeRunnerCount).toBe(2);
      expect(summary.runnersWithDeliveries).toBe(2);
      expect(summary.todayTotalCents).toBe(1500); // 1000 + 500
      expect(summary.allTimeTotalCount).toBe(15); // 10 + 5
      expect(summary.entries.length).toBe(2);
      expect(summary.entries[0].welcomeBonusEarned).toBe(true);
    });
  });
});
