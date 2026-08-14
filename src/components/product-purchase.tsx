"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(product.variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const { addLine } = useCart();
  const variant = product.variants.find((item) => item.id === selectedId) ?? product.variants[0];
  if (!variant) return <p>Dieses Produkt hat aktuell keine kaufbare Variante.</p>;

  function add() {
    addLine({
      variantId: variant!.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant!.title,
      kind: product.kind,
      quantity: 1,
      price: variant!.price,
    });
    setAdded(true);
  }

  return (
    <div className="purchase-box">
      {product.variants.length > 1 ? (
        <fieldset className="variant-picker">
          <legend>Ausführung wählen</legend>
          {product.variants.map((item) => (
            <label key={item.id}>
              <input
                type="radio"
                name="variant"
                value={item.id}
                checked={item.id === variant.id}
                onChange={() => setSelectedId(item.id)}
              />
              <span>{item.title}</span>
              <strong>{formatMoney(item.price)}</strong>
            </label>
          ))}
        </fieldset>
      ) : null}
      <div className="purchase-box__price">
        <span>Gesamtpreis</span>
        <div><strong>{formatMoney(variant.price)}</strong>{variant.compareAtPrice ? <del>{formatMoney(variant.compareAtPrice)}</del> : null}</div>
      </div>
      <p className="tax-note">inkl. MwSt. {variant.requiresShipping ? "zzgl. Versandkosten" : "· keine Versandkosten"}</p>
      <button className="button button--primary button--full" onClick={add} disabled={!variant.availableForSale}>
        {variant.availableForSale ? "In den Warenkorb" : "Aktuell nicht verfügbar"}
      </button>
      <div className="purchase-feedback" role="status" aria-live="polite">
        {added ? <><span>Hinzugefügt.</span> <Link href="/warenkorb">Zum Warenkorb →</Link></> : null}
      </div>
      <ul className="micro-assurances" aria-label="Kaufvorteile">
        <li>Shopify Checkout</li>
        <li>Sichere Zahlung</li>
        <li>14 Tage Widerruf*</li>
      </ul>
      <p className="fine-print">* Gesetzliche Ausnahmen und Erlöschen bei digitalen Inhalten beachten.</p>
    </div>
  );
}
