import test from "node:test";
import assert from "node:assert/strict";
import { validateEnv, validatePreproductionEnv } from "../scripts/verify-config.mjs";

const complete = {
  SHOP_MODE: "live",
  NEXT_PUBLIC_SITE_URL: "https://shop.example.de",
  SHOPIFY_STORE_DOMAIN: "example.myshopify.com",
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "secret",
  SHOPIFY_STOREFRONT_API_VERSION: "2026-07",
  SINGLE_PRODUCT_HANDLE: "modular-desk-kit",
  LEGAL_NAME: "Beispiel GmbH",
  LEGAL_OWNER: "Erika Beispiel",
  LEGAL_STREET: "Beispielweg 1",
  LEGAL_POSTCODE: "10115",
  LEGAL_CITY: "Berlin",
  LEGAL_EMAIL: "shop@example.de",
  LEGAL_PHONE: "+49 30 123456",
  RESEND_API_KEY: "re_test",
  REVOCATION_EMAIL_FROM: "widerruf@example.de",
};

const preproduction = {
  SHOP_MODE: "demo",
  NEXT_PUBLIC_SITE_URL: "https://preprod.example.de",
  SHOPIFY_STORE_DOMAIN: "example.myshopify.com",
  SHOPIFY_STOREFRONT_API_VERSION: "2026-07",
  SINGLE_PRODUCT_HANDLE: "modular-desk-kit",
  RESEND_API_KEY: "re_test",
  REVOCATION_EMAIL_FROM: "widerruf@example.de",
};

test("pre-production passes without live merchant data or Storefront token", () => {
  const result = validatePreproductionEnv(preproduction);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some((warning) => warning.includes("Demo-Katalog")));
});

test("pre-production requires demo mode, public HTTPS, Shopify draft config and email transport", () => {
  const result = validatePreproductionEnv({
    ...preproduction,
    SHOP_MODE: "live",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    SHOPIFY_STORE_DOMAIN: "invalid.example",
    SHOPIFY_STOREFRONT_API_VERSION: "unstable",
    SINGLE_PRODUCT_HANDLE: "Nicht gültig!",
    RESEND_API_KEY: "",
    REVOCATION_EMAIL_FROM: "invalid",
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("SHOP_MODE")));
  assert.ok(result.errors.some((error) => error.includes("localhost")));
  assert.ok(result.errors.some((error) => error.includes("myshopify.com")));
  assert.ok(result.errors.some((error) => error.includes("RESEND_API_KEY")));
  assert.ok(result.errors.some((error) => error.includes("SINGLE_PRODUCT_HANDLE")));
});

test("pre-production rejects secrets exposed through NEXT_PUBLIC variables", () => {
  const result = validatePreproductionEnv({ ...preproduction, NEXT_PUBLIC_SHOPIFY_TOKEN: "never-public" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("NEXT_PUBLIC_SHOPIFY_TOKEN")));
});

test("live configuration passes with all required groups", () => {
  const result = validateEnv(complete);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("checkout cannot be considered ready in demo mode", () => {
  const result = validateEnv({ ...complete, SHOP_MODE: "demo" });
  assert.equal(result.ok, false);
  assert.equal(result.live, false);
});

test("live configuration rejects localhost and missing transactional email", () => {
  const incomplete = { ...complete };
  delete incomplete.RESEND_API_KEY;
  const result = validateEnv({ ...incomplete, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("RESEND_API_KEY")));
  assert.ok(result.errors.some((error) => error.includes("HTTPS")));
  assert.ok(result.errors.some((error) => error.includes("localhost")));
});

test("live configuration rejects an unsafe Shopify host and a non-HTTPS public URL", () => {
  const result = validateEnv({
    ...complete,
    SHOPIFY_STORE_DOMAIN: "attacker.example",
    NEXT_PUBLIC_SITE_URL: "http://shop.example.de",
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("myshopify.com")));
  assert.ok(result.errors.some((error) => error.includes("HTTPS")));
});

test("live configuration rejects an untested Storefront API version", () => {
  const result = validateEnv({ ...complete, SHOPIFY_STOREFRONT_API_VERSION: "unstable" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("2026-07")));
});

test("live configuration validates German postcode and delivery email addresses", () => {
  const result = validateEnv({
    ...complete,
    LEGAL_POSTCODE: "1011",
    LEGAL_EMAIL: "keine-adresse",
    REVOCATION_EMAIL_FROM: "auch-keine-adresse",
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("LEGAL_POSTCODE")));
  assert.ok(result.errors.some((error) => error.includes("LEGAL_EMAIL")));
  assert.ok(result.errors.some((error) => error.includes("REVOCATION_EMAIL_FROM")));
});
