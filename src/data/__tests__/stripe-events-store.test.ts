import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sql } from '@vercel/postgres';
import * as store from '../src/data/stripe-events-store'; // Assuming the test file is in __tests__

// Mock the entire @vercel/postgres module
vi.mock('@vercel/postgres', () => ({
  sql: vi.fn(),
}));

// Helper function to cast the mocked sql object
const mockedSql = sql as unknown as {
  query: (text: string, params: any[]) => Promise<{ rows: any[] }>;
  // Mocking the template literal usage for INSERT/CREATE
  // We assume the mock implementation handles the template literal execution
  // by calling the underlying query mechanism.
};

describe('Stripe Event Store', () => {
  const EVENT_ID = 'evt_test_123';

  // Setup environment variables and mocks before each test
  beforeEach(() => {
    // Reset environment variable state
    process.env.POSTGRES_URL = 'postgres://user:pass@host:5432/db';

    // Reset mocks
    vi.clearAllMocks();

    // Mock the sql object structure
    mockedSql.query = vi.fn();
    // Mock the template literal usage for DDL/DML statements
    // We mock the entire sql tag function to return a promise that resolves
    // with the expected result structure (e.g., { rows: [...] } for query, or just void for DML).
    (sql as unknown as any) = vi.fn(async (query: string, params?: any[]) => {
      if (query.includes('SELECT 1 FROM stripe_webhook_events')) {
        // This handles the SELECT query used in isEventProcessed
        return { rows: [] }; // Default empty result
      }
      // For INSERT and CREATE TABLE, we just resolve successfully (void return)
      return Promise.resolve({ rows: [] });
    });
  });

  afterEach(() => {
    // Clean up environment variable after each test
    delete process.env.POSTGRES_URL;
  });

  describe('Fallback Mode (POSTGRES_URL unset)', () => {
    beforeEach(() => {
      // Set environment variable to null/undefined to trigger fallback
      process.env.POSTGRES_URL = undefined;
    });

    it('should return false for isEventProcessed when connection is unavailable', async () => {
      const result = await store.isEventProcessed(EVENT_ID);
      expect(result).toBe(false);
      // Ensure no database calls were attempted
      expect(mockedSql.query).not.toHaveBeenCalled();
    });

    it('should do nothing (return void) for markEventProcessed when connection is unavailable', async () => {
      // We expect no errors and no database calls
      await store.markEventProcessed(EVENT_ID);
      expect(mockedSql.query).not.toHaveBeenCalled();
    });
  });

  describe('Database Operations (POSTGRES_URL set)', () => {
    beforeEach(() => {
      // Ensure connection is available for these tests
      process.env.POSTGRES_URL = 'postgres://user:pass@host:5432/db';
    });

    describe('isEventProcessed', () => {
      it('should return false when the event ID row is missing', async () => {
        // Mock query to return no rows
        mockedSql.query.mockResolvedValueOnce({ rows: [] });

        const result = await store.isEventProcessed(EVENT_ID);
        expect(result).toBe(false);
        expect(mockedSql.query).toHaveBeenCalledWith(
          `SELECT 1 FROM stripe_webhook_events WHERE event_id = $1`,
          [EVENT_ID],
        );
      });

      it('should return true when the event ID row exists', async () => {
        // Mock query to return one row
        mockedSql.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

        const result = await store.isEventProcessed(EVENT_ID);
        expect(result).toBe(true);
      });
    });

    describe('markEventProcessed', () => {
      it('should insert the event ID into the store', async () => {
        // Mock the sql tag function to simulate successful DML execution
        (sql as unknown as any) = vi.fn(async (query: string, params: any[]) => {
          if (query.includes('INSERT INTO stripe_webhook_events')) {
            return Promise.resolve({});
          }
        });

        await store.markEventProcessed(EVENT_ID);

        // Check if the correct INSERT statement was executed
        expect(sql).toHaveBeenCalledWith(
          `INSERT INTO stripe_webhook_events (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING`,
          [EVENT_ID],
        );
      });
    });

    describe('Schema Bootstrap (ensureSchema)', () => {
      it('should execute CREATE TABLE IF NOT EXISTS only once (idempotency)', async () => {
        // We need to test the internal state management (_schemaReady)
        // Since the function is internal, we rely on calling the exported functions
        // which internally call ensureSchema.

        // 1. First call (should execute CREATE TABLE)
        // Mock the sql tag to track calls
        (sql as unknown as any) = vi.fn(async (query: string) => {
          if (query.includes('CREATE TABLE')) {
            return Promise.resolve({});
          }
        });

        await store.isEventProcessed(EVENT_ID);

        // Reset mock count to check subsequent calls
        vi.clearAllMocks();

        // 2. Second call (should skip CREATE TABLE)
        await store.markEventProcessed(EVENT_ID);

        // The mock should only have been called for the DML operation (INSERT),
        // proving that the CREATE TABLE statement was not re-executed.
        expect(sql).toHaveBeenCalledTimes(1);
      });
    });
  });
});
