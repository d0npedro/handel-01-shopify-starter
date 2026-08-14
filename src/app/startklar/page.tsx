import type { Metadata } from "next";
import Link from "next/link";
import { readiness, storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Go-live-Status", robots: { index: false, follow: false } };

const checks = [
  { key: "liveMode", label: "Live-Modus", detail: "SHOP_MODE=live erst nach allen Prüfungen setzen." },
  { key: "shopify", label: "Shopify verbunden", detail: "Domain, Storefront-Token und getestete API-Version 2026-07." },
  { key: "merchant", label: "Händlerdaten vollständig", detail: "Name, Vertretung, ladungsfähige Anschrift, E-Mail und Telefon." },
  { key: "revocationEmail", label: "Widerrufszustellung aktiv", detail: "Resend-Schlüssel, Absender und Händler-E-Mail." },
  { key: "lucid", label: "Physischer Versand registriert", detail: "LUCID-Nummer erforderlich, sobald physische Produkte bestellt werden können." },
  { key: "siteUrl", label: "Öffentliche Domain gesetzt", detail: "NEXT_PUBLIC_SITE_URL muss die kanonische HTTPS-Adresse sein." },
] as const;

export default function ReadinessPage() {
  const passed = checks.filter((check) => readiness[check.key]).length;
  return (
    <div className="readiness-page">
      <header><div><p className="eyebrow">Production Gate</p><h1>{passed}/{checks.length}<br /><em>bereit.</em></h1></div><p>Dieser Status prüft keine geheimen Werte öffentlich, sondern nur, ob die erforderlichen Konfigurationsgruppen vorhanden sind. {storeConfig.mode === "demo" ? "Der Checkout bleibt im Demo-Modus gesperrt." : "Der Live-Modus ist aktiv; die manuellen Gates bleiben verbindlich."}</p></header>
      <section className="readiness-list" aria-label="Go-live-Prüfungen">
        {checks.map((check, index) => <article key={check.key} className={readiness[check.key] ? "is-ready" : "is-open"}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{check.label}</h2><p>{check.detail}</p></div><strong>{readiness[check.key] ? "BEREIT" : "OFFEN"}</strong></article>)}
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
      <div className="readiness-actions"><Link className="button button--primary" href="/shop">Demo prüfen</Link><a className="button button--secondary" href="/GO_LIVE_DE.md">Runbook öffnen</a></div>
      <p className="fine-print">Aktueller Modus: {storeConfig.mode.toUpperCase()}. Die vollständige technische Prüfung kann lokal mit <code>npm run verify:config</code> gestartet werden.</p>
    </div>
  );
}
