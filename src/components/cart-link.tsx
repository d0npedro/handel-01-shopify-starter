"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink() {
  const { count, hydrated } = useCart();
  return (
    <Link href="/warenkorb" className="cart-link" aria-label={`Warenkorb mit ${hydrated ? count : 0} Artikeln`}>
      Warenkorb <span>{hydrated ? String(count).padStart(2, "0") : "00"}</span>
    </Link>
  );
}
