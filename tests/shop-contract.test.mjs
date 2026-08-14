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

test("demo mode prevents indexing and checkout", async () => {
  const [robots, config] = await Promise.all([
    readFile(new URL("../src/app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/config.ts", import.meta.url), "utf8"),
  ]);
  assert.match(robots, /disallow: "\/"/);
  assert.match(config, /assertCheckoutReady/);
  assert.match(config, /SHOP_MODE=live/);
});
