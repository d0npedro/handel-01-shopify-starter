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

const STORAGE_KEY = "handel01_single_product_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

function safeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 25).filter((item): item is CartLine => {
    if (!item || typeof item !== "object") return false;
    const line = item as Partial<CartLine>;
    return Boolean(
      typeof line.variantId === "string" &&
        typeof line.handle === "string" &&
        typeof line.title === "string" &&
        typeof line.variantTitle === "string" &&
        ["physical", "script", "music", "software"].includes(line.kind ?? "") &&
        typeof line.quantity === "number" &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0 &&
        line.quantity <= 10 &&
        line.price &&
        typeof line.price.amount === "string" &&
        Number.isFinite(Number(line.price.amount)) &&
        Number(line.price.amount) >= 0 &&
        typeof line.price.currencyCode === "string" &&
        /^[A-Z]{3}$/.test(line.price.currencyCode),
    );
  });
}

export function CartProvider({ children, productHandle }: { children: React.ReactNode; productHandle: string }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextLines: CartLine[] = [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      nextLines = stored ? safeLines(JSON.parse(stored)).filter((line) => line.handle === productHandle) : [];
    } catch {
      nextLines = [];
    }
    queueMicrotask(() => {
      setLines(nextLines);
      setHydrated(true);
    });
  }, [productHandle]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing or a full storage quota must not break the cart UI.
    }
  }, [hydrated, lines]);

  const addLine = useCallback((line: CartLine) => {
    if (line.handle !== productHandle) return;
    setLines((current) => {
      const sameProduct = current.filter((item) => item.handle === productHandle);
      const existing = sameProduct.find((item) => item.variantId === line.variantId);
      if (!existing) return [...sameProduct, { ...line, quantity: Math.min(line.quantity, 10) }];
      return sameProduct.map((item) =>
        item.variantId === line.variantId
          ? { ...item, quantity: Math.min(item.quantity + line.quantity, 10) }
          : item,
      );
    });
  }, [productHandle]);

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
