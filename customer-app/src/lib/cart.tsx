import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { priceCart, type PricedCart } from "@palocal/data/delivery-pricing";
import { getMenuItem } from "@palocal/data/delivery-restaurants";

export interface CartLine {
  itemId: string;
  quantity: number;
  notes?: string;
}

const CART_STORAGE_KEY = "pal-cart-v1";

async function loadStoredCart(): Promise<CartLine[]> {
  try {
    const raw = await SecureStore.getItemAsync(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l): l is CartLine => {
      if (!l || typeof l !== "object") return false;
      const line = l as Partial<CartLine>;
      if (typeof line.itemId !== "string") return false;
      if (typeof line.quantity !== "number" || line.quantity <= 0) return false;
      // Drop lines whose menu entries are gone — restaurants may have
      // changed between the save and load (deploy ships new menu).
      return getMenuItem(line.itemId) != null;
    });
  } catch {
    return [];
  }
}

async function persistCart(lines: CartLine[]): Promise<void> {
  try {
    if (lines.length === 0) {
      await SecureStore.deleteItemAsync(CART_STORAGE_KEY);
    } else {
      await SecureStore.setItemAsync(CART_STORAGE_KEY, JSON.stringify(lines));
    }
  } catch {
    // Best effort — failing to persist shouldn't crash the app.
  }
}

interface CartContextValue {
  /** Lines currently in the cart */
  lines: CartLine[];
  /** Restaurant id pinned to the cart, or null when empty */
  restaurantId: string | null;
  /** Add (or increment) an item. Throws if it's from a different restaurant. */
  add: (itemId: string, qty?: number, notes?: string) => void;
  /** Set absolute quantity (0 removes). */
  setQty: (itemId: string, qty: number) => void;
  /** Remove a line entirely. */
  remove: (itemId: string) => void;
  /** Empty the cart. */
  clear: () => void;
  /** Total quantity across all lines (for tab badges). */
  count: number;
  /** Priced summary (subtotal + fees + tax + total). Null when empty. */
  priced: (tipCents: number) => PricedCart | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export class CartConflictError extends Error {}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const hydratedRef = useRef(false);

  // Hydrate the cart from SecureStore on mount so an app restart doesn't
  // wipe the user's in-progress order.
  useEffect(() => {
    let cancelled = false;
    loadStoredCart().then((stored) => {
      if (cancelled) return;
      if (stored.length > 0) setLines(stored);
      hydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change AFTER hydration completes — otherwise the
  // initial empty state would clobber the saved cart before we read it.
  useEffect(() => {
    if (!hydratedRef.current) return;
    persistCart(lines);
  }, [lines]);

  const restaurantId = useMemo<string | null>(() => {
    if (lines.length === 0) return null;
    const item = getMenuItem(lines[0].itemId);
    return item?.restaurantId ?? null;
  }, [lines]);

  const add = useCallback(
    (itemId: string, qty = 1, notes?: string) => {
      const item = getMenuItem(itemId);
      if (!item) return;
      setLines((prev) => {
        if (prev.length > 0) {
          const first = getMenuItem(prev[0].itemId);
          if (first && first.restaurantId !== item.restaurantId) {
            throw new CartConflictError(
              "Your cart already has items from another restaurant. Clear it before adding from " +
                item.restaurantId +
                "."
            );
          }
        }
        const existing = prev.find((l) => l.itemId === itemId);
        if (existing) {
          return prev.map((l) =>
            l.itemId === itemId ? { ...l, quantity: l.quantity + qty } : l
          );
        }
        return [...prev, { itemId, quantity: qty, notes }];
      });
    },
    []
  );

  const setQty = useCallback((itemId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.itemId !== itemId);
      return prev.map((l) =>
        l.itemId === itemId ? { ...l, quantity: qty } : l
      );
    });
  }, []);

  const remove = useCallback((itemId: string) => {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const priced = useCallback(
    (tipCents: number) => {
      if (lines.length === 0) return null;
      try {
        return priceCart(lines, tipCents);
      } catch {
        return null;
      }
    },
    [lines]
  );

  const value: CartContextValue = {
    lines,
    restaurantId,
    add,
    setQty,
    remove,
    clear,
    count,
    priced,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be inside a CartProvider");
  }
  return ctx;
}
