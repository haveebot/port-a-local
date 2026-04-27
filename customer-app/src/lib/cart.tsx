import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { priceCart, type PricedCart } from "@palocal/data/delivery-pricing";
import { getMenuItem } from "@palocal/data/delivery-restaurants";

export interface CartLine {
  itemId: string;
  quantity: number;
  notes?: string;
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
