# Architektur

HANDEL/01 ist ein **Ein-Produkt-Storefront**. Next.js 16 spricht die Shopify Storefront API. Shopify bleibt im Live-Modus die einzige Quelle für Produkt, Preis, Bestand, Warenkorb und Checkout.

```text
Browser
  └─ Next.js App Router (Vercel)
       ├─ Landingpage  ── getPrimaryProduct()
       │     ├─ live: Shopify Storefront API 2026-07
       │     └─ demo: shopify/demo-products.csv  (nur SHOP_MODE=demo)
       ├─ /api/checkout
       │     ├─ same-origin + JSON
       │     ├─ assertCheckoutReady()
       │     ├─ nur SINGLE_PRODUCT_HANDLE
       │     └─ cartCreate → Shopify checkoutUrl
       ├─ /api/widerruf
       │     └─ Resend an Händler + Verbraucher
       └─ /api/health, /startklar
             └─ Statusgruppen, keine Secrets
```

## Entscheidungsgrenzen

| Verantwortung | Hier | Nicht hier |
|---|---|---|
| Darstellung, Consent, Widerruf-UI | Storefront | Shopify Admin Themes |
| Preis, Steuer, Zahlung, Checkout | Shopify | lokale Preislogik |
| Demo-Katalog | nur `SHOP_MODE=demo` | Live-Fallback |
| Rechtstext-*Muster* | `src/app/*` Legal Pages | fertige Händlertexte |
| Auslieferung digitaler Dateien | Shopify Digital Products / App | dieser Starter als Download-Server |

## Fail-safes

`assertCheckoutReady` in `src/lib/config.ts` ist die letzte Sperre vor `cartCreate`. Ein bestandenes Pre-Production-Gate (`npm run verify:preprod`, Seite `/startklar`) setzt `SHOP_MODE` nicht auf `live` und lockert die Sperre nicht.

Live zusätzlich:

- öffentliche HTTPS-URL, keine localhost-Domain
- gültige `*.myshopify.com` plus Storefront-Token (server-only)
- vollständige Händlerpflichtangaben
- Resend für den elektronischen Widerruf
- `LEGAL_LUCID_NUMBER`, sobald physischer Versand im Warenkorb liegt
- zwei getrennte Digital-Consents als Cart Attributes

`robots.ts` schließt den Shop im Demo-Modus von der Indexierung aus.

## Produktarten

`custom.product_kind` in Shopify: `physical` | `script` | `music` | `software`.

Ohne Metafeld leitet `src/lib/shopify.ts` den Typ aus Produkttyp, Tags und `requiresShipping` ab. Physische Pflichtangaben (GPSR, Hersteller, Sicherheit) und digitale Pflichtangaben (Lizenz, Datei, System) bleiben getrennte Felder.

## Tests

`tests/*.test.mjs` sind dependency-freie Vertragsprüfungen: Demo sperrt Checkout und Indexierung, digitale Consents existieren, LUCID gated physischen Versand, die gesetzlichen Widerruf-Labels bleiben stehen.
