# HANDEL/01 — Shopify Ein-Produkt-Template DE

Ein fokussierter, headless Shopify-Shop für genau einen Artikel. Die Storefront läuft mit Next.js 16 auf Vercel; Shopify bleibt im Live-Modus die einzige Quelle für Produkt, Varianten, Preis, Bestand, Steuern, Warenkorb und Checkout.

Die Landingpage bündelt Hero, Kaufbox, Nutzenargumente, Lieferinformationen, Produkt- beziehungsweise Digitalpflichten, FAQ und einen abschließenden Kaufimpuls auf einer Seite. `/shop` und alte Produktdetail-URLs leiten kanonisch auf die Startseite um. Der sichtbare Artikel wird ausschließlich über `SINGLE_PRODUCT_HANDLE` gewählt.

Als Produktarten unterstützt das Template weiterhin:

- physische Waren mit Lieferzeit, Hersteller- und GPSR-Sicherheitsangaben,
- herunterladbare Skripte,
- transparent gekennzeichnete, generierte Musik mit Lizenzdaten,
- Software mit Systemanforderungen, Dateiinformationen und Update-Hinweisen.

## Sicherheitsmodell

Der Shop startet absichtlich mit `SHOP_MODE=demo`. In diesem Modus sind Ein-Produkt-Landingpage und Warenkorb funktionsfähig, der Shopify Checkout ist aber gesperrt und Suchmaschinen werden über `robots.txt` ausgeschlossen. `SHOP_MODE=live` darf erst gesetzt werden, wenn `npm run verify:config`, Rechtstextprüfung, Testbestellungen und die manuelle Checkliste in [docs/GO_LIVE_DE.md](docs/GO_LIVE_DE.md) bestanden sind.

Die Seite `/startklar` und `/api/health` trennen den grünen Pre-Production-Status ausdrücklich vom strengeren Production-Gate. Ein bestandenes Pre-Production-Gate schwächt `assertCheckoutReady` nicht ab und schaltet weder Checkout noch Indexierung frei.

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
npm run verify:preprod
npm run verify:config
```

`verify:preprod` bestätigt den sicheren Demo-Modus, eine öffentliche HTTPS-Preview, Shopify-Domain/API-Version, den gewählten Einzelartikel, den serverseitigen E-Mail-Transport, die Ein-Produkt-Routen und die Social Preview. Das strengere `verify:config` bleibt ausschließlich das Live-Gate und darf in Pre-Production fehlschlagen.

## Shopify verbinden

1. Shopify-Shop anlegen und den Vertriebskanal **Headless** installieren.
2. Storefront im Headless-Kanal erstellen.
3. Store-Domain, privaten Storefront-Token und den Handle des einzigen Artikels als `SINGLE_PRODUCT_HANDLE` in `.env.local` eintragen.
4. Den gewünschten Demo-Artikel aus [shopify/demo-products.csv](shopify/demo-products.csv) importieren oder einen eigenen Artikel anlegen.
5. Metafelder gemäß [shopify/METAFIELDS.md](shopify/METAFIELDS.md) anlegen und ausfüllen.
6. Digitale Varianten als nicht physisch konfigurieren (`requiresShipping=false`).
7. Shopify Digital Products oder eine geeignete Download-/Lizenz-App einrichten; der verifizierte Demo-Aufbau ist in [docs/DEMO_FULFILLMENT.md](docs/DEMO_FULFILLMENT.md) dokumentiert.
8. Markets für Deutschland und EUR aktivieren; Steuer- und Versandprofile prüfen.

Beim Austausch des Demo-Artikels zusätzlich `public/og.png` durch eine zum neuen Produkt passende Social Card ersetzen. Verfügt der Shopify-Artikel über ein Featured Image, verwendet die Landingpage dieses automatisch als sichtbares Produktbild.

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

Alle Variablen aus `.env.example` im Vercel-Projekt setzen. `SINGLE_PRODUCT_HANDLE` muss exakt dem veröffentlichten Shopify-Handle entsprechen. Zunächst im Demo-Modus deployen, Domain und alle Seiten prüfen, danach erst die Live-Gates abschließen.

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
