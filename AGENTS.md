# Project guidance

- Preserve the `SHOP_MODE=demo` fail-safe. Never make checkout available by weakening `assertCheckoutReady`.
- Keep all Shopify credentials server-only. Do not prefix tokens with `NEXT_PUBLIC_`.
- Use Storefront API version `2026-07` until an intentional quarterly upgrade is tested.
- Product, price, cart and checkout data must come from Shopify in live mode. Demo fallback is allowed only in demo mode.
- Keep physical and digital product disclosures distinct. New product categories require a legal/compliance review.
- The labels `Vertrag widerrufen` and `Widerruf bestätigen` are deliberate legal UI text and must not be made ambiguous.
- Do not add analytics, pixels or marketing scripts outside the consent event flow.
- After editing multiple TSX files, run the React best-practices review, lint, typecheck, tests and build.
- Legal text is a customizable template. Never remove the demo warning while placeholder merchant data remains.
