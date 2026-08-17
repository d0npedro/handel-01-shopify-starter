import type { Metadata } from "next";
import Link from "next/link";
import { preproductionReadiness, preproductionReady, readiness, storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Pre-Production- und Go-live-Status", robots: { index: false, follow: false } };

const preproductionChecks = [
  { key: "safeDemoMode", label: "Sicherer Demo-Modus", detail: "Checkout und Indexierung bleiben bis zur Live-Abnahme gesperrt." },
  { key: "publicPreview", label: "Öffentliche Preview", detail: "Die kanonische HTTPS-Domain ist für Abnahme und Stakeholder erreichbar." },
  { key: "shopifyDraft", label: "Shopify vorbereitet", detail: "Shop-Domain, API-Version 2026-07 und der Handle des einzigen Artikels sind hinterlegt." },
  { key: "emailProvider", label: "E-Mail-Transport vorbereitet", detail: "Resend-Schlüssel und verifizierbares Absenderformat sind serverseitig vorhanden." },
] as const;

const productionChecks = [
  { key: "liveMode", label: "Live-Modus", detail: "SHOP_MODE=live erst nach allen Prüfungen setzen." },
  { key: "shopify", label: "Shopify verbunden", detail: "Domain, Storefront-Token und getestete API-Version 2026-07." },
  { key: "merchant", label: "Händlerdaten vollständig", detail: "Name, Vertretung, ladungsfähige Anschrift, E-Mail und Telefon." },
  { key: "revocationEmail", label: "Widerrufszustellung aktiv", detail: "Resend-Schlüssel, Absender und Händler-E-Mail." },
  { key: "lucid", label: "Physischer Versand registriert", detail: "LUCID-Nummer erforderlich, sobald physische Produkte bestellt werden können." },
  { key: "siteUrl", label: "Öffentliche Domain gesetzt", detail: "NEXT_PUBLIC_SITE_URL muss die kanonische HTTPS-Adresse sein." },
  { key: "singleProduct", label: "Ein Artikel gewählt", detail: "SINGLE_PRODUCT_HANDLE verweist auf genau den Artikel der Landingpage." },
] as const;

export default function ReadinessPage() {
  const preproductionPassed = preproductionChecks.filter((check) => preproductionReadiness[check.key]).length;
  const productionPassed = productionChecks.filter((check) => readiness[check.key]).length;
  return (
    <div className="readiness-page">
      <header><div><p className="eyebrow">Pre-Production Gate</p><h1>{preproductionPassed}/{preproductionChecks.length}<br /><em>bereit.</em></h1></div><p>Dieser Status veröffentlicht keine geheimen Werte, sondern prüft nur notwendige Konfigurationsgruppen. {preproductionReady ? "Die Pre-Production-Umgebung ist technisch abnahmebereit; der Checkout bleibt absichtlich gesperrt." : "Mindestens ein technisches Pre-Production-Gate ist noch offen."}</p></header>
      <section className="readiness-list" aria-label="Pre-Production-Prüfungen">
        {preproductionChecks.map((check, index) => <article key={check.key} className={preproductionReadiness[check.key] ? "is-ready" : "is-open"}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{check.label}</h2><p>{check.detail}</p></div><strong>{preproductionReadiness[check.key] ? "BEREIT" : "OFFEN"}</strong></article>)}
      </section>
      <section className="readiness-next">
        <div><p className="eyebrow">Production Gate</p><h2>{productionPassed}/{productionChecks.length}<br />live-bereit.</h2></div>
        <p>Pre-Production und Livebetrieb sind bewusst getrennt. Token, echte Händlerdaten, LUCID und Live-Modus bleiben verbindliche Sperren für reale Bestellungen.</p>
      </section>
      <section className="readiness-list" aria-label="Go-live-Prüfungen">
        {productionChecks.map((check, index) => <article key={check.key} className={readiness[check.key] ? "is-ready" : "is-open"}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{check.label}</h2><p>{check.detail}</p></div><strong>{readiness[check.key] ? "BEREIT" : "OFFEN"}</strong></article>)}
      </section>
      <section className="readiness-next">
        <div><p className="eyebrow">Zusätzliche manuelle Gates</p><h2>Technik allein<br />reicht nicht.</h2></div>
        <ol>
          <li>Rechtstexte durch Rechtsberatung auf Unternehmen, Produkte, Apps und Länder anpassen.</li>
          <li>Physische Waren: LUCID, Systembeteiligung, GPSR-Daten und ggf. ElektroG/BattG prüfen.</li>
          <li>Digitale Waren: Download-App, EU-Umsatzsteuer, Lizenz, Kompatibilität und Updates testen.</li>
          <li>Shopify Checkout auf deutsche Sprache, Preis-/Versandangaben, Bestellbutton und E-Mails prüfen.</li>
          <li>Cookie-/Pixel-Setup mit Shopify Customer Privacy API verbinden und Consent testen.</li>
          <li>Barrierefreiheit von Storefront, Checkout, Medien und Apps manuell sowie automatisiert prüfen.</li>
          <li>Testbestellung für physisch, digital und gemischt inklusive Widerruf durchführen.</li>
        </ol>
      </section>
      <div className="readiness-actions"><Link className="button button--primary" href="/">Demo prüfen</Link><a className="button button--secondary" href="/GO_LIVE_DE.md">Runbook öffnen</a></div>
      <p className="fine-print">Aktueller Modus: {storeConfig.mode.toUpperCase()}. Pre-Production wird mit <code>npm run verify:preprod</code>, der spätere Livebetrieb zusätzlich mit <code>npm run verify:config</code> geprüft.</p>
    </div>
  );
}
