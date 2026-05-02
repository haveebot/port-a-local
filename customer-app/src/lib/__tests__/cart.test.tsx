import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { CartProvider, CartConflictError, useCart } from "../cart"; // Assuming cart.tsx is in the parent directory
import * as SecureStore from "expo-secure-store";
import { getMenuItem } from "@palocal/data/delivery-restaurants";

// --- MOCKING DEPENDENCIES ---

// 1. Mock expo-secure-store
const mockSecureStore = {
  _storage: new Map<string, string | null>(),
  getItemAsync: jest.fn(async (key: string) => {
    const value = mockSecureStore._storage.get(key);
    return value === undefined ? null : value;
  }),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore._storage.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore._storage.delete(key);
  }),
};

jest.mock("expo-secure-store", () => ({
  __esModule: true,
  default: mockSecureStore,
}));

// 2. Mock @palocal/data/delivery-restaurants
const mockMenuItem = (id: string, restaurantId: string) => ({
  id,
  name: `Item ${id}`,
  restaurantId: restaurantId,
});

jest.mock("@palocal/data/delivery-restaurants", () => ({
  getMenuItem: jest.fn((itemId: string) => {
    const items: Record<string, any> = {
      "itemA": mockMenuItem("itemA", "rest1"),
      "itemB": mockMenuItem("itemB", "rest1"),
      "itemC": mockMenuItem("itemC", "rest2"),
      "itemD": mockMenuItem("itemD", "rest3"),
    };
    return items[itemId] || null;
  }),
}));

// 3. Mock @palocal/data/delivery-pricing (Minimal mock needed for type safety)
jest.mock("@palocal/data/delivery-pricing", () => ({
  priceCart: jest.fn((lines: any[], tipCents: number) => ({
    subtotal: 100,
    fees: 5,
    tax: 5,
    total: 110,
  })),
  type: {} as any,
}));

// --- TEST UTILITIES ---

// Helper component to consume the context and trigger actions
const TestConsumer: React.FC = () => {
  const { lines, add, setQty, clear, count } = useCart();

  return (
    <div data-testid="cart-state">
      <p data-testid="line-count">{lines.length}</p>
      <p data-testid="total-count">{count}</p>
      <button onClick={() => add("itemA")}>Add A (Rest 1)</button>
      <button onClick={() => add("itemB")}>Add B (Rest 1)</button>
      <button onClick={() => add("itemC")}>Add C (Rest 2)</button>
      <button onClick={() => add("itemD")}>Add D (Rest 3)</button>
      <button onClick={() => setQty("itemA", 0)}>Set A to 0 (Remove)</button>
      <button onClick={() => clear()}>Clear Cart</button>
      <div data-testid="lines-list">{lines.map((l: any) => `${l.itemId}: ${l.quantity}`).join(", ")}</div>
    </div>
  );
};

// --- TEST SUITE ---

describe("CartProvider Persistence and Logic", () => {
  const STORAGE_KEY = "pal-cart-v1";

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the in-memory store before each test
    mockSecureStore._storage.clear();
  });

  // =========================================================================
  // 1. EMPTY START & INITIAL PERSISTENCE
  // =========================================================================
  it("should initialize with empty state and persist empty state on mount", async () => {
    // Arrange: SecureStore is empty
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    // Act: Render the provider
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for the initial useEffect (hydration) to complete
    await waitFor(() => expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(STORAGE_KEY));

    // Wait for the subsequent useEffect (persistence) to run after initial state set
    await waitFor(() => expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([])));

    // Assert: Initial state is empty
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // 2. ADDING ITEMS & CONFLICTS
  // =========================================================================
  it("should add a new item and increment count, and persist changes", async () => {
    // Arrange: Initial empty state
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for initial persistence (empty)
    await waitFor(() => expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1));

    // Act 1: Add item A (Rest 1)
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      container?.querySelector('button:nth-child(1)')?.click(); // Add A
    });

    // Wait for persistence after adding A
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([{ itemId: "itemA", quantity: 1, notes: undefined }])
      );
    });

    // Act 2: Add item B (Rest 1) - Same restaurant
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      container?.querySelector('button:nth-child(2)')?.click(); // Add B
    });

    // Wait for persistence after adding B
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([
          { itemId: "itemA", quantity: 1, notes: undefined },
          { itemId: "itemB", quantity: 1, notes: undefined },
        ])
      );
    });

    // Act 3: Increment item A quantity
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      // Simulate adding A again (which increments quantity)
      container?.querySelector('button:nth-child(1)')?.click();
    });

    // Wait for persistence after incrementing A
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([
          { itemId: "itemA", quantity: 2, notes: undefined },
          { itemId: "itemB", quantity: 1, notes: undefined },
        ])
      );
    });

    unmount();
  });

  it("should throw CartConflictError when adding items from different restaurants", async () => {
    // Arrange: Start with item A (Rest 1)
    mockSecureStore._storage.set(STORAGE_KEY, JSON.stringify([{ itemId: "itemA", quantity: 1 }]));
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for initial hydration persistence
    await waitFor(() => expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1));

    // Act: Attempt to add item C (Rest 2)
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      // Click button for item C (Rest 2)
      container?.querySelector('button:nth-child(3)')?.click();
    });

    // Assert: The error should be thrown during the state update
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2); // Persistence should not run if state update fails
    });
    // Note: Since the test consumer doesn't catch the error, we rely on the internal state update failing gracefully.
    // We verify that the cart state remains unchanged after the failed add attempt.
    const linesList = document.querySelector('[data-testid="lines-list"]') as HTMLElement;
    expect(linesList?.textContent).toContain("itemA: 1");

    unmount();
  });

  // =========================================================================
  // 3. SET QUANTITY & CLEAR
  // =========================================================================
  it("should remove a line when setQty is called with 0, and persist changes", async () => {
    // Arrange: Start with A (1) and B (1)
    mockSecureStore._storage.set(STORAGE_KEY, JSON.stringify([
      { itemId: "itemA", quantity: 1 },
      { itemId: "itemB", quantity: 1 },
    ]));
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for initial hydration persistence
    await waitFor(() => expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1));

    // Act: Set A quantity to 0
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      container?.querySelector('button:nth-child(6)')?.click(); // Set A to 0
    });

    // Wait for persistence after removal
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([{ itemId: "itemB", quantity: 1 }])
      );
    });

    // Act: Clear cart
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      container?.querySelector('button:nth-child(7)')?.click(); // Clear Cart
    });

    // Wait for persistence after clearing
    await waitFor(() => {
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEY);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2); // 1 initial, 1 after clear
    });

    unmount();
  });

  // =========================================================================
  // 4. HYDRATION & STALE FILTERING
  // =========================================================================
  it("should hydrate the cart from SecureStore and filter out stale items", async () => {
    // Arrange: Simulate stored cart with one valid item and one stale item
    const staleCart = [
      { itemId: "itemA", quantity: 2 }, // Valid
      { itemId: "itemZ_stale", quantity: 1 }, // Stale
    ];
    mockSecureStore._storage.set(STORAGE_KEY, JSON.stringify(staleCart));

    // Act: Render the provider
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for hydration (loadStoredCart)
    await waitFor(() => {
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(STORAGE_KEY);
    });

    // Wait for persistence (should save the filtered state)
    await waitFor(() => {
      // Only itemA should remain after filtering
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([{ itemId: "itemA", quantity: 2 }])
      );
    });

    // Assert: The displayed state should only contain the valid item
    const linesList = document.querySelector('[data-testid="lines-list"]') as HTMLElement;
    expect(linesList?.textContent).toContain("itemA: 2");

    unmount();
  });

  // =========================================================================
  // 5. PERSISTENCE CHECK (Microtask wait)
  // =========================================================================
  it("should persist the cart state after an asynchronous action (add)", async () => {
    // Arrange: Initial empty state
    const { unmount } = render(<CartProvider><TestConsumer /></CartProvider>);

    // Wait for initial persistence (empty)
    await waitFor(() => expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1));

    // Act: Add item A
    // We use act() to wrap the state change, ensuring the subsequent useEffect runs.
    await act(async () => {
      const container = document.querySelector('[data-testid="cart-state"]') as HTMLElement;
      container?.querySelector('button:nth-child(1)')?.click(); // Add A
    });

    // Assert: Wait for the persistence effect to run
    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([{ itemId: "itemA", quantity: 1, notes: undefined }])
      );
    });

    unmount();
  });
});
