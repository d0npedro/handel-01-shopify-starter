"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";

type CheckoutState = "idle" | "loading" | "error";

export function CartPage({ demo }: { demo: boolean }) {
  const { lines, count, hydrated, removeLine, updateQuantity } = useCart();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [digitalSupplyConsent, setDigitalSupplyConsent] = useState(false);
  const [digitalWithdrawalAcknowledged, setDigitalWithdrawalAcknowledged] = useState(false);
  const [state, setState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");
  const hasDigital = lines.some((line) => line.kind !== "physical");
  const currencyCode = lines[0]?.price.currencyCode ?? "EUR";
  const total = lines.reduce((sum, line) => sum + Number(line.price.amount) * line.quantity, 0);

  const canCheckout =
    lines.length > 0 &&
    termsAccepted &&
    (!hasDigital || (digitalSupplyConsent && digitalWithdrawalAcknowledged));

  async function checkout() {
    if (!canCheckout) return;
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((line) => ({ merchandiseId: line.variantId, quantity: line.quantity, kind: line.kind })),
          consent: { termsAccepted, digitalSupplyConsent, digitalWithdrawalAcknowledged },
        }),
      });
      const result = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Checkout konnte nicht geöffnet werden.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout konnte nicht geöffnet werden.");
      setState("error");
    }
  }

  if (!hydrated) return <div className="cart-loading" aria-live="polite">Warenkorb wird geladen …</div>;
  if (!lines.length) {
    return (
      <section className="empty-cart">
        <span className="giant-index">00</span>
        <div><p className="eyebrow">Noch ganz leicht</p><h1>Dein Warenkorb ist leer.</h1><p>Unser ausgewählter Artikel wartet {demo ? "in der Demo" : "auf der Startseite"}.</p><Link className="button button--primary" href="/">Produkt ansehen</Link></div>
      </section>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-lines" aria-labelledby="cart-title">
        <div className="page-kicker"><span>CHECKOUT / 01</span><span>{lines.length.toString().padStart(2, "0")} POSITIONEN</span></div>
        <h1 id="cart-title">Warenkorb</h1>
        {lines.map((line, index) => (
          <article className="cart-line" key={line.variantId}>
            <span className="cart-line__index">{String(index + 1).padStart(2, "0")}</span>
            <div className={`cart-line__swatch cart-line__swatch--${line.kind}`} aria-hidden="true" />
            <div className="cart-line__main">
              <p className="eyebrow">{line.kind === "physical" ? "Physisch" : "Digital"}</p>
              <h2><Link href="/">{line.title}</Link></h2>
              {line.variantTitle !== "Standard" ? <p>{line.variantTitle}</p> : null}
              <button className="link-button" onClick={() => removeLine(line.variantId)}>Entfernen</button>
            </div>
            <label className="quantity-field">Menge<input type="number" min="1" max="10" inputMode="numeric" value={line.quantity} onChange={(event) => updateQuantity(line.variantId, Number(event.target.value))} /></label>
            <strong>{formatMoney({ amount: (Number(line.price.amount) * line.quantity).toFixed(2), currencyCode: line.price.currencyCode })}</strong>
          </article>
        ))}
      </section>

      <aside className="checkout-panel" aria-labelledby="summary-title">
        <p className="eyebrow">Bestellübersicht</p>
        <h2 id="summary-title">Bereit?</h2>
        <dl>
          <div><dt>Artikel</dt><dd>{count} Stück</dd></div>
          <div><dt>Versand</dt><dd>im Checkout</dd></div>
          <div className="checkout-total"><dt>Zwischensumme vor Versand</dt><dd>{formatMoney({ amount: total.toFixed(2), currencyCode })}</dd></div>
        </dl>
        <p className="tax-note">Gesamtpreise inkl. gesetzlicher MwSt. Versandkosten werden vor der zahlungspflichtigen Bestellung im Shopify Checkout angezeigt.</p>

        <div className="checkout-consents">
          <label className="check-row">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
            <span>Ich habe die <Link href="/agb">AGB</Link> und die <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link> gelesen.</span>
          </label>
          {hasDigital ? (
            <>
              <label className="check-row">
                <input type="checkbox" checked={digitalSupplyConsent} onChange={(event) => setDigitalSupplyConsent(event.target.checked)} />
                <span>Ich stimme ausdrücklich zu, dass vor Ablauf der Widerrufsfrist mit der Bereitstellung der digitalen Inhalte begonnen wird.</span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={digitalWithdrawalAcknowledged} onChange={(event) => setDigitalWithdrawalAcknowledged(event.target.checked)} />
                <span>Mir ist bekannt, dass mein Widerrufsrecht mit Beginn der digitalen Bereitstellung erlischt.</span>
              </label>
            </>
          ) : null}
        </div>

        <button className="button button--primary button--full" onClick={checkout} disabled={!canCheckout || state === "loading" || demo}>
          {state === "loading" ? "Shopify Checkout wird geöffnet …" : demo ? "Checkout im Demo-Modus gesperrt" : "Weiter zum sicheren Checkout"}
        </button>
        {demo ? <p className="checkout-message">Demo-Produkte und Warenkorb funktionieren. Für echte Zahlungen zuerst die <Link href="/startklar">Go-live-Prüfung</Link> abschließen.</p> : null}
        {state === "error" ? <p className="form-error" role="alert">{message}</p> : null}
        <div className="payment-list" role="group" aria-label="Zahlungsabwicklung"><span>ZAHLUNGSARTEN</span><span>WERDEN IM</span><span>SHOPIFY CHECKOUT</span><span>ANGEZEIGT</span></div>
      </aside>
    </div>
  );
}
