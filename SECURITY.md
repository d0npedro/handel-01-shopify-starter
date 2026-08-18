# Security

Dieses Repository enthält **keine** Produktions-Secrets. Der Shop startet absichtlich in `SHOP_MODE=demo`. Checkout und Indexierung bleiben gesperrt, bis die Live-Gates bestanden sind.

| Darf ins Git | Darf nicht ins Git |
|---|---|
| `.env.example` | `.env`, `.env.local`, Vercel-Pulls mit echten Werten |
| Demo-Katalog und Demo-Downloads | Storefront-Token, Resend-Keys, Händlerdaten |
| Rechtstext-*Muster* mit Platzhaltern | Ausgefüllte Impressumsdaten eines echten Betriebs |
| Screenshots der öffentlichen Demo | Admin-UI, Token-Masken, Kundendaten |

Shopify-Credentials bleiben serverseitig. Kein Token darf mit `NEXT_PUBLIC_` beginnen.

## Melden

Gefundene Secrets zuerst rotieren, dann privat an den Maintainer. Keinen Key in einem öffentlichen Issue stehen lassen.

Checkout-Fail-safes (`assertCheckoutReady`) nicht umgehen, auch nicht „nur für eine Demo“.
