# Contributing

PRs zu Storefront, Gates, Tests und Doku sind willkommen.

1. Keine Secrets, keine echten Händlerdaten, keine Token in Screenshots.
2. `SHOP_MODE=demo` und `assertCheckoutReady` bleiben verbindlich. Checkout nicht durch Lockern der Gates „testen“.
3. Die Labels `Vertrag widerrufen` und `Widerruf bestätigen` sind gesetzlicher UI-Text. Nicht umbenennen, nicht weichzeichnen.
4. Storefront API bleibt `2026-07`, bis ein quartalsweiser Upgrade getestet ist.
5. Keine Analytics, Pixel oder Marketing-Skripte außerhalb des Consent-Event-Flows.
6. Physische und digitale Pflichtangaben getrennt halten. Neue Produktkategorien brauchen eine fachliche Prüfung.
7. Rechtstexte sind Muster. Die Demo-Warnung bleibt, solange Platzhalter-Händlerdaten gesetzt sind.

Lokal:

```powershell
Copy-Item .env.example .env.local
npm install
npm run check
npm run verify:preprod
```

`verify:config` ist das Live-Gate und darf in der Demo fehlschlagen.
