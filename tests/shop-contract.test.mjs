import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("electronic revocation keeps the statutory two-step labels", async () => {
  const source = await readFile(new URL("../src/components/revocation-form.tsx", import.meta.url), "utf8");
  assert.match(source, /Weiter zur Prüfung/);
  assert.match(source, /Widerruf bestätigen/);
});

test("digital checkout requires separate supply and withdrawal acknowledgements", async () => {
  const source = await readFile(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8");
  assert.match(source, /digitalSupplyConsent/);
  assert.match(source, /digitalWithdrawalAcknowledged/);
  assert.match(source, /createCheckout/);
});

test("checkout records consent time and legal text version on the Shopify cart", async () => {
  const source = await readFile(new URL("../src/lib/shopify.ts", import.meta.url), "utf8");
  assert.match(source, /consent_recorded_at/);
  assert.match(source, /legal_text_version/);
  assert.match(source, /digital_supply_before_withdrawal_period/);
  assert.match(source, /digital_withdrawal_loss_acknowledged/);
});

test("physical checkout is gated by LUCID readiness", async () => {
  const [checkout, config] = await Promise.all([
    readFile(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/config.ts", import.meta.url), "utf8"),
  ]);
  assert.match(checkout, /requiresPhysical: hasPhysical/);
  assert.match(config, /LUCID-Registrierung für physischen Versand/);
});

test("demo mode prevents indexing and checkout", async () => {
  const [robots, config] = await Promise.all([
    readFile(new URL("../src/app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/config.ts", import.meta.url), "utf8"),
  ]);
  assert.match(robots, /disallow: "\/"/);
  assert.match(config, /assertCheckoutReady/);
  assert.match(config, /SHOP_MODE=live/);
});

test("live catalog never falls back to local demo products", async () => {
  const source = await readFile(new URL("../src/lib/shopify.ts", import.meta.url), "utf8");
  assert.match(source, /if \(storeConfig\.mode === "demo"\) return demoProducts/);
  assert.match(source, /Live-Katalog benötigt eine konfigurierte Shopify Storefront API/);
  assert.doesNotMatch(source, /if \(!hasShopifyConnection\(\)\) return demoProducts/);
});

test("checkout resolves every requested variant directly from Shopify", async () => {
  const [checkout, shopify] = await Promise.all([
    readFile(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/shopify.ts", import.meta.url), "utf8"),
  ]);
  assert.match(checkout, /getCheckoutVariants/);
  assert.doesNotMatch(checkout, /getProducts/);
  assert.match(shopify, /nodes\(ids: \$ids\)/);
  assert.match(shopify, /noStore: true/);
});

test("single-product storefront and checkout reject catalog drift", async () => {
  const [landing, shopRoute, productRoute, aboutRoute, cart, checkout, shopify, sitemap] = await Promise.all([
    readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/shop/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/produkt/[handle]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/ueber/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/cart-provider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/shopify.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  assert.match(landing, /getPrimaryProduct/);
  assert.doesNotMatch(landing, /getProducts\(\)/);
  assert.match(shopRoute, /redirect\("\/"\)/);
  assert.match(productRoute, /permanentRedirect\("\/"\)/);
  assert.match(aboutRoute, /permanentRedirect\("\/"\)/);
  assert.match(cart, /line\.handle === productHandle/);
  assert.match(cart, /handel01_single_product_cart_v1/);
  assert.match(shopify, /productHandle: node\.product\.handle/);
  assert.match(checkout, /productHandle !== storeConfig\.singleProductHandle/);
  assert.doesNotMatch(sitemap, /getProducts/);
});

test("landing page publishes product and FAQ structured data with safe JSON serialization", async () => {
  const source = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /"@type": "Product"/);
  assert.match(source, /"@type": "FAQPage"/);
  assert.match(source, /replace\(\/<\/g, "\\\\u003c"\)/);
});

test("write APIs require exact same-origin JSON requests", async () => {
  const [validation, checkout, revocation] = await Promise.all([
    readFile(new URL("../src/lib/validation.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/widerruf/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(validation, /new URL\(origin\)\.origin === new URL\(request\.url\)\.origin/);
  assert.match(validation, /content-type/);
  assert.match(checkout, /isJsonRequest/);
  assert.match(revocation, /isJsonRequest/);
});

test("pre-production status stays separate from the production checkout gate", async () => {
  const [health, readinessPage, config] = await Promise.all([
    readFile(new URL("../src/app/api/health/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/app/startklar/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/config.ts", import.meta.url), "utf8"),
  ]);
  assert.match(health, /preproduction: \{ ready: preproductionReady/);
  assert.match(health, /production: \{ ready: Object\.values\(readiness\)\.every\(Boolean\)/);
  assert.match(health, /checks: readiness/);
  assert.match(readinessPage, /Pre-Production Gate/);
  assert.match(readinessPage, /Production Gate/);
  assert.match(readinessPage, /verify:preprod/);
  assert.match(config, /export const preproductionReady/);
  assert.match(config, /export function assertCheckoutReady/);
});

test("published go-live runbook stays in sync with its source", async () => {
  const [source, published] = await Promise.all([
    readFile(new URL("../docs/GO_LIVE_DE.md", import.meta.url), "utf8"),
    readFile(new URL("../public/GO_LIVE_DE.md", import.meta.url), "utf8"),
  ]);
  const normalizeLineEndings = (value) => value.replace(/\r\n/g, "\n");
  assert.equal(normalizeLineEndings(published), normalizeLineEndings(source));
});

test("published demo fulfillment guide stays in sync with its source", async () => {
  const [source, published] = await Promise.all([
    readFile(new URL("../docs/DEMO_FULFILLMENT.md", import.meta.url), "utf8"),
    readFile(new URL("../public/DEMO_FULFILLMENT.md", import.meta.url), "utf8"),
  ]);
  const normalizeLineEndings = (value) => value.replace(/\r\n/g, "\n");
  assert.equal(normalizeLineEndings(published), normalizeLineEndings(source));
});
