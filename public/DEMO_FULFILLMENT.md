# Demo-Auslieferung für digitale Produkte

Stand: 14. August 2026

Die drei digitalen Shopify-Demoprodukte sind in der offiziellen Shopify-App **Digital Products** jeweils mit einem externen Link-Asset verbunden. Die öffentlich lesbaren Google-Sheets enthalten nur den jeweiligen Produktnamen, den verifizierten Vercel-Downloadlink und einen Demo-/Lizenzhinweis. Sie enthalten keine Zugangsdaten oder personenbezogenen Kundendaten.

| Produkt | Shopify-Produkt-ID | Asset in Digital Products | Öffentlicher Handoff | ZIP auf Vercel |
| --- | ---: | --- | --- | --- |
| Launch Automation Script | `16487426425177` | Launch Automation Script – Demo-Download | [Google Sheet](https://docs.google.com/spreadsheets/d/1NvnDFDSKfLeJ6MTb9PO0tznIfzLc1mfoGZ-6oeM-MRA/edit?usp=sharing) | [launch-automation-script-DEMO.zip](https://handel-01-shopify-starter.vercel.app/demo-downloads/launch-automation-script-DEMO.zip) |
| Synthetic Horizons | `16487426490713` | Synthetic Horizons – Demo-Download | [Google Sheet](https://docs.google.com/spreadsheets/d/1zfYAOuXFFKXaVjXyT9wlO6N7mcmal47AX_2p-BR-DJs/edit?usp=sharing) | [synthetic-horizons-DEMO.zip](https://handel-01-shopify-starter.vercel.app/demo-downloads/synthetic-horizons-DEMO.zip) |
| Focusboard Desktop | `16487426556249` | Focusboard Desktop – Demo-Download | [Google Sheet](https://docs.google.com/spreadsheets/d/1ZyTkubFBTOfjpbG8i-UafKv7bipQndDdj-j5rkHF4QU/edit?usp=sharing) | [focusboard-desktop-DEMO.zip](https://handel-01-shopify-starter.vercel.app/demo-downloads/focusboard-desktop-DEMO.zip) |

Der physische Artikel **Modular Desk Kit** erhält absichtlich kein digitales Asset.

## Verifizierter Zustand

- Alle drei Google-Sheets: Freigabe `anyone` / `reader`, nicht in der Suche auffindbar.
- Alle drei Shopify-Produktseiten: `Assets (1)`, automatische Auslieferung, unbegrenzter Zugriff und Speicherdatum 14.08.2026.
- Alle drei ZIP-URLs: HTTP 200 und `Content-Type: application/zip`.
- Die ZIP-Dateien liegen zusätzlich versioniert unter `public/demo-downloads`.
- Der Shop bleibt in `SHOP_MODE=demo`; diese Assets schalten den Checkout nicht frei.

## Vor einem echten Verkauf

Die Google-Sheets sind ein funktionsfähiger, bewusst einfacher Demo-Handoff. Für einen Live-Shop müssen je Sortiment und Lizenzmodell mindestens folgende Punkte entschieden und mit Testbestellungen belegt werden:

1. Demo-Handoff durch direkte, bestellungsgebundene Datei-/Lizenzauslieferung ersetzen oder fachlich als endgültigen Auslieferungsweg freigeben.
2. Download-E-Mail, Checkout-Erweiterung, Bestellstatus, erneuter Download, Zugriffslimit, Updates und Erstattung testen.
3. Öffentliche Demo-Dateien entfernen oder austauschen, falls der spätere Inhalt nicht frei zugänglich sein soll.
4. Lizenzumfang, Rechtekette, Dateiversionen, Systemanforderungen, Support- und Updatezeitraum produktspezifisch prüfen.
5. Einwilligung zum vorzeitigen Leistungsbeginn und Kenntnis vom Verlust des Widerrufsrechts im echten Shopify Checkout und in der Vertragsbestätigung prüfen.
