# HANDEL/01 — Shopify Starter DE

Ein modularer, headless Shopify-Shop als Ausgangspunkt für neue Shop-Ideen. Die Storefront läuft mit Next.js 16 auf Vercel; Shopify bleibt die Quelle für Produkte, Varianten, Märkte, Bestand, Steuern und Checkout.

Enthalten sind Demo-Produkte für:

- physische Waren mit Lieferzeit, Hersteller- und GPSR-Sicherheitsangaben,
- herunterladbare Skripte,
- transparent gekennzeichnete, generierte Musik mit Lizenzdaten,
- Software mit Systemanforderungen, Dateiinformationen und Update-Hinweisen.

## Sicherheitsmodell

Der Shop startet absichtlich mit `SHOP_MODE=demo`. In diesem Modus sind Demo-Katalog und Warenkorb funktionsfähig, der Shopify Checkout ist aber gesperrt und Suchmaschinen werden über `robots.txt` ausgeschlossen. `SHOP_MODE=live` darf erst gesetzt werden, wenn `npm run verify:config`, Rechtstextprüfung, Testbestellungen und die manuelle Checkliste in [docs/GO_LIVE_DE.md](docs/GO_LIVE_DE.md) bestanden sind.

Die enthaltenen Rechtstexte sind strukturierte Muster und keine Rechtsberatung. Sie müssen auf Unternehmen, Rechtsform, Sortiment, Apps, Datenflüsse, Zahlungsarten und Märkte angepasst und fachlich geprüft werden.

## Lokal starten

Voraussetzungen: Node.js 22.x und npm.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Danach: `http://localhost:3000`.

Qualitätsprüfung:

```powershell
npm run check
npm run verify:config
```

## Shopify verbinden

1. Shopify-Shop anlegen und den Vertriebskanal **Headless** installieren.
2. Storefront im Headless-Kanal erstellen.
3. Store-Domain und privaten Storefront-Token in `.env.local` eintragen.
4. Demo-Produkte aus [shopify/demo-products.csv](shopify/demo-products.csv) importieren.
5. Metafelder gemäß [shopify/METAFIELDS.md](shopify/METAFIELDS.md) anlegen und ausfüllen.
6. Digitale Varianten als nicht physisch konfigurieren (`requiresShipping=false`).
7. Shopify Digital Products oder eine geeignete Download-/Lizenz-App einrichten; der verifizierte Demo-Aufbau ist in [docs/DEMO_FULFILLMENT.md](docs/DEMO_FULFILLMENT.md) dokumentiert.
8. Markets für Deutschland und EUR aktivieren; Steuer- und Versandprofile prüfen.

Verwendete Storefront API: `2026-07`. Shopify veröffentlicht vierteljährlich eine neue stabile Version; mindestens einmal pro Quartal prüfen und aktualisieren.

## Produktklassifizierung

Das Metafeld `custom.product_kind` akzeptiert:

- `physical`
- `script`
- `music`
- `software`

Ohne Metafeld leitet der Starter den Typ aus Produkttyp, Tags und `requiresShipping` ab.

## Checkout und digitale Inhalte

Die Storefront erstellt den Warenkorb serverseitig über `cartCreate` und leitet auf die von Shopify gelieferte `checkoutUrl` weiter. Bei digitalen Inhalten werden zwei getrennte ausdrückliche Zustimmungen erfasst und als Cart Attributes an Shopify übergeben:

- Beginn der Bereitstellung vor Ablauf der Widerrufsfrist,
- Kenntnis vom Erlöschen des Widerrufsrechts.

Ein Warenkorb mit physischen Produkten wird im Live-Modus zusätzlich serverseitig gesperrt, solange keine `LEGAL_LUCID_NUMBER` hinterlegt ist. Shopify-Domain und öffentliche URL werden vor jeder Checkout-Freigabe streng validiert.

Der endgültige Shopify Checkout, Bestellbutton und die Bestätigungs-E-Mails müssen im echten Shop auf Deutsch und mit einer vollständigen Testbestellung geprüft werden.

Die drei digitalen Demo-Produkte besitzen bereits getrennte Assets in Shopify Digital Products. Die aktuelle Demo-Auslieferung und die vor Livegang zu ersetzenden beziehungsweise zu prüfenden Teile stehen in [docs/DEMO_FULFILLMENT.md](docs/DEMO_FULFILLMENT.md).

## Elektronischer Widerruf

`/vertrag-widerrufen` implementiert den zweistufigen Ablauf mit den Schaltflächen „Weiter zur Prüfung“ und „Widerruf bestätigen“. Die API sendet den vollständigen Inhalt, Datum, Uhrzeit und Referenz gleichzeitig an Händler und Verbraucher. Dafür werden benötigt:

```env
RESEND_API_KEY=...
REVOCATION_EMAIL_FROM=widerruf@deine-domain.de
LEGAL_EMAIL=service@deine-domain.de
```

Ohne diese Werte ist die Übermittlung sichtbar deaktiviert. Vor Livegang Absenderdomain verifizieren und reale Zustellung testen.

## Vercel

Alle Variablen aus `.env.example` im Vercel-Projekt setzen. Zunächst im Demo-Modus deployen, Domain und alle Seiten prüfen, danach erst die Live-Gates abschließen.

```powershell
vercel deploy -y
vercel deploy --prod -y
```

## Ordner

```text
src/app/                 App Router, Seiten und APIs
src/components/          Storefront-Komponenten
src/lib/                 Shopify, Konfiguration, Datenmodelle
shopify/                 CSV und Metafeld-Schema
docs/                    deutsches Go-live-Runbook
scripts/                 Konfigurationsprüfung
tests/                   dependency-freie Strukturtests
```

## Wichtige externe Konfiguration

Der Code kann keine Händlerregistrierung, LUCID-Systembeteiligung, Rechtsberatung, Shopify-Vertragsdaten oder Zahlungsanbieter-Freischaltung ersetzen. Der Go-live-Status im Shop und das Runbook unterscheiden deshalb technische Bereitschaft von externen Pflichten.
