"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface MenuCategoryView {
  id: string;
  name: string;
}
interface MenuItemView {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  priceCents: number;
  sort: number;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface CartLine {
  itemId: string;
  qty: number;
  notes?: string;
}

const CART_KEY = "pal-deliver-cart";

function loadCart(restaurantSlug: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${CART_KEY}-${restaurantSlug}`);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}
function saveCart(restaurantSlug: string, cart: CartLine[]) {
  try {
    window.localStorage.setItem(
      `${CART_KEY}-${restaurantSlug}`,
      JSON.stringify(cart),
    );
  } catch {
    // ignore
  }
}

export default function RestaurantOrderClient({
  restaurantSlug,
  restaurantName,
  isOpen,
  categories,
  items,
}: {
  restaurantSlug: string;
  restaurantName: string;
  isOpen: boolean;
  categories: MenuCategoryView[];
  items: MenuItemView[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(loadCart(restaurantSlug));
  }, [restaurantSlug]);

  useEffect(() => {
    saveCart(restaurantSlug, cart);
  }, [restaurantSlug, cart]);

  const itemsById = useMemo(() => {
    const m = new Map<string, MenuItemView>();
    items.forEach((it) => m.set(it.id, it));
    return m;
  }, [items]);

  const subtotalCents = useMemo(() => {
    return cart.reduce((sum, l) => {
      const it = itemsById.get(l.itemId);
      return sum + (it?.priceCents ?? 0) * l.qty;
    }, 0);
  }, [cart, itemsById]);

  const itemCount = cart.reduce((n, l) => n + l.qty, 0);

  function addItem(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === itemId);
      if (existing) {
        return prev.map((l) =>
          l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [...prev, { itemId, qty: 1 }];
    });
  }
  function removeItem(itemId: string) {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    );
  }

  function goCheckout() {
    if (cart.length === 0 || !isOpen) return;
    // Stash cart in sessionStorage for checkout page (and navigate)
    try {
      window.sessionStorage.setItem(
        "pal-deliver-checkout",
        JSON.stringify({
          restaurantSlug,
          restaurantName,
          cart,
        }),
      );
    } catch {
      // ignore
    }
    router.push("/deliver/checkout");
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {!isOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-900">
            This restaurant isn&apos;t accepting orders right now. Browse the
            menu and come back during their hours.
          </div>
        )}

        {categories.map((cat) => {
          const catItems = items
            .filter((it) => it.categoryId === cat.id)
            .sort((a, b) => a.sort - b.sort);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id} className="mb-8">
              <h2 className="font-display text-xl font-bold text-navy-900 mb-3">
                {cat.name}
              </h2>
              <ul className="bg-white border border-sand-200 rounded-xl divide-y divide-sand-100">
                {catItems.map((it) => {
                  const inCart = cart.find((l) => l.itemId === it.id);
                  return (
                    <li
                      key={it.id}
                      className="flex items-start gap-4 p-4 hover:bg-sand-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-navy-900 text-sm">
                          {it.name}
                        </p>
                        {it.description && (
                          <p className="text-xs text-navy-500 font-light mt-1 leading-snug">
                            {it.description}
                          </p>
                        )}
                        <p className="text-sm font-mono text-navy-900 mt-2 tabular-nums">
                          {fmt(it.priceCents)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {inCart ? (
                          <>
                            <button
                              onClick={() => removeItem(it.id)}
                              className="w-8 h-8 rounded-full border border-sand-300 text-navy-700 hover:border-coral-400 font-bold"
                              aria-label="Remove one"
                              disabled={!isOpen}
                            >
                              −
                            </button>
                            <span className="font-mono text-sm w-6 text-center tabular-nums">
                              {inCart.qty}
                            </span>
                            <button
                              onClick={() => addItem(it.id)}
                              className="w-8 h-8 rounded-full bg-navy-900 text-sand-50 hover:bg-coral-600 font-bold"
                              aria-label="Add one"
                              disabled={!isOpen}
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => addItem(it.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-sand-50 hover:bg-coral-600 disabled:bg-sand-300 disabled:cursor-not-allowed"
                            disabled={!isOpen}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Sticky cart bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-navy-900 text-sand-50 border-t border-coral-500/30 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              className="text-left flex-1"
            >
              <p className="font-display font-bold text-sm">
                Cart · {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                {fmt(subtotalCents)}
              </p>
              <p className="text-[11px] text-sand-300">
                Tap to review before checkout
              </p>
            </button>
            <button
              onClick={goCheckout}
              disabled={!isOpen}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-coral-500 text-white hover:bg-coral-600 disabled:bg-coral-500/50"
            >
              Checkout →
            </button>
          </div>

          {drawerOpen && (
            <div className="bg-navy-800 border-t border-navy-700 max-h-80 overflow-y-auto">
              <ul className="max-w-3xl mx-auto px-4 sm:px-6 py-3 divide-y divide-navy-700">
                {cart.map((l) => {
                  const it = itemsById.get(l.itemId);
                  if (!it) return null;
                  return (
                    <li
                      key={l.itemId}
                      className="flex items-center justify-between py-2 gap-3"
                    >
                      <span className="text-sm text-sand-100">
                        {l.qty}× {it.name}
                      </span>
                      <span className="text-sm font-mono text-sand-100 tabular-nums">
                        {fmt(it.priceCents * l.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
