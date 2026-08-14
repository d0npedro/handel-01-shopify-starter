"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  hydrated: boolean;
  addLine: (line: CartLine) => void;
  removeLine: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "handel01_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

function safeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CartLine => {
    if (!item || typeof item !== "object") return false;
    const line = item as Partial<CartLine>;
    return Boolean(
      typeof line.variantId === "string" &&
        typeof line.handle === "string" &&
        typeof line.title === "string" &&
        typeof line.quantity === "number" &&
        line.quantity > 0 &&
        line.price &&
        typeof line.price.amount === "string" &&
        typeof line.price.currencyCode === "string",
    );
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextLines: CartLine[] = [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      nextLines = stored ? safeLines(JSON.parse(stored)) : [];
    } catch {
      nextLines = [];
    }
    queueMicrotask(() => {
      setLines(nextLines);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [hydrated, lines]);

  const addLine = useCallback((line: CartLine) => {
    setLines((current) => {
      const existing = current.find((item) => item.variantId === line.variantId);
      if (!existing) return [...current, { ...line, quantity: Math.min(line.quantity, 10) }];
      return current.map((item) =>
        item.variantId === line.variantId
          ? { ...item, quantity: Math.min(item.quantity + line.quantity, 10) }
          : item,
      );
    });
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((current) => current.filter((item) => item.variantId !== variantId));
      return;
    }
    setLines((current) =>
      current.map((item) =>
        item.variantId === variantId ? { ...item, quantity: Math.min(Math.max(quantity, 1), 10) } : item,
      ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const count = useMemo(() => lines.reduce((total, line) => total + line.quantity, 0), [lines]);
  const context = useMemo(
    () => ({ lines, count, hydrated, addLine, removeLine, updateQuantity, clear }),
    [lines, count, hydrated, addLine, removeLine, updateQuantity, clear],
  );

  return <CartContext.Provider value={context}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart muss innerhalb von CartProvider verwendet werden.");
  return context;
}
