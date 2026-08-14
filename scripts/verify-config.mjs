import { pathToFileURL } from "node:url";

export const liveRequirements = {
  "Öffentliche URL": ["NEXT_PUBLIC_SITE_URL"],
  "Shopify Storefront": ["SHOPIFY_STORE_DOMAIN"],
  "Shopify Token": ["SHOPIFY_STOREFRONT_PRIVATE_TOKEN", "SHOPIFY_STOREFRONT_PUBLIC_TOKEN"],
  "Shopify API-Version": ["SHOPIFY_STOREFRONT_API_VERSION"],
  "Händlerdaten": ["LEGAL_NAME", "LEGAL_OWNER", "LEGAL_STREET", "LEGAL_POSTCODE", "LEGAL_CITY", "LEGAL_EMAIL", "LEGAL_PHONE"],
  "Widerrufszustellung": ["RESEND_API_KEY", "REVOCATION_EMAIL_FROM"],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const shopifyDomainPattern = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export function validatePreproductionEnv(env) {
  const errors = [];
  const warnings = [];

  if (env.SHOP_MODE !== "demo") errors.push("SHOP_MODE muss für Pre-Production auf demo stehen.");

  try {
    const siteUrl = new URL(env.NEXT_PUBLIC_SITE_URL ?? "");
    if (siteUrl.protocol !== "https:") errors.push("Pre-Production-URL muss HTTPS verwenden.");
    if (["localhost", "127.0.0.1", "::1"].includes(siteUrl.hostname)) errors.push("Pre-Production-URL darf nicht localhost sein.");
  } catch {
    errors.push("NEXT_PUBLIC_SITE_URL ist keine gültige öffentliche URL.");
  }

  const shopifyDomain = env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  if (!shopifyDomainPattern.test(shopifyDomain)) errors.push("SHOPIFY_STORE_DOMAIN muss eine gültige *.myshopify.com-Domain sein.");
  if (env.SHOPIFY_STOREFRONT_API_VERSION?.trim() !== "2026-07") {
    errors.push("SHOPIFY_STOREFRONT_API_VERSION muss bis zum getesteten Upgrade 2026-07 bleiben.");
  }
  if (!env.RESEND_API_KEY?.trim()) errors.push("RESEND_API_KEY fehlt für den vorbereiteten Transaktions-E-Mail-Transport.");
  if (!emailPattern.test(env.REVOCATION_EMAIL_FROM?.trim() ?? "")) {
    errors.push("REVOCATION_EMAIL_FROM ist keine gültige E-Mail-Adresse.");
  }

  const publicSecrets = Object.entries(env)
    .filter(([key, value]) => key.startsWith("NEXT_PUBLIC_") && /(TOKEN|SECRET|KEY)/i.test(key) && value?.trim())
    .map(([key]) => key);
  if (publicSecrets.length) errors.push(`Server-Secrets dürfen nicht öffentlich exponiert werden: ${publicSecrets.join(", ")}.`);

  if (!env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim() && !env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim()) {
    warnings.push("Kein Storefront-Token gesetzt; der Demo-Katalog bleibt die absichtliche Pre-Production-Datenquelle.");
  }
  return { errors, warnings, ok: errors.length === 0 };
}

export function validateEnv(env) {
  const errors = [];
  const warnings = [];
  const live = env.SHOP_MODE === "live";
  if (!live) warnings.push("SHOP_MODE ist nicht live; Checkout und Indexierung bleiben gesperrt.");

  for (const [group, keys] of Object.entries(liveRequirements)) {
    if (group === "Shopify Token") {
      if (!keys.some((key) => env[key]?.trim())) errors.push(`${group}: privater oder öffentlicher Storefront-Token fehlt.`);
      continue;
    }
    const missing = keys.filter((key) => !env[key]?.trim());
    if (missing.length) errors.push(`${group}: ${missing.join(", ")} fehlt.`);
  }

  const url = env.NEXT_PUBLIC_SITE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      if (live && parsed.protocol !== "https:") errors.push("Öffentliche URL muss im Live-Modus HTTPS verwenden.");
      if (live && ["localhost", "127.0.0.1"].includes(parsed.hostname)) errors.push("Öffentliche URL darf im Live-Modus nicht localhost sein.");
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL ist keine gültige URL.");
    }
  }

  const shopifyDomain = env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
  if (shopifyDomain && !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shopifyDomain)) {
    errors.push("SHOPIFY_STORE_DOMAIN muss eine gültige *.myshopify.com-Domain sein.");
  }
  if (env.SHOPIFY_STOREFRONT_API_VERSION?.trim() && env.SHOPIFY_STOREFRONT_API_VERSION.trim() !== "2026-07") {
    errors.push("SHOPIFY_STOREFRONT_API_VERSION muss bis zum getesteten Upgrade 2026-07 bleiben.");
  }

  if (env.LEGAL_EMAIL?.trim() && !emailPattern.test(env.LEGAL_EMAIL.trim())) errors.push("LEGAL_EMAIL ist keine gültige E-Mail-Adresse.");
  if (env.REVOCATION_EMAIL_FROM?.trim() && !emailPattern.test(env.REVOCATION_EMAIL_FROM.trim())) errors.push("REVOCATION_EMAIL_FROM ist keine gültige E-Mail-Adresse.");
  if (env.LEGAL_POSTCODE?.trim() && !/^\d{5}$/.test(env.LEGAL_POSTCODE.trim())) errors.push("LEGAL_POSTCODE muss für Deutschland aus fünf Ziffern bestehen.");

  if (!env.LEGAL_LUCID_NUMBER?.trim()) warnings.push("Keine LUCID-Nummer gesetzt; physischer Versand darf ohne geklärte Verpackungspflichten nicht starten.");
  if (!env.LEGAL_VAT_ID?.trim()) warnings.push("Keine USt-IdNr. gesetzt; prüfen, ob eine vorhanden und im Impressum anzugeben ist.");
  return { live, errors, warnings, ok: live && errors.length === 0 };
}

function main() {
  const result = validateEnv(process.env);
  console.log(`Mode: ${result.live ? "LIVE" : "DEMO"}`);
  for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  if (!result.ok) {
    console.error("Go-live gate: NICHT BESTANDEN");
    process.exitCode = 1;
  } else {
    console.log("Go-live gate: TECHNISCHE KONFIGURATION BESTANDEN");
    console.log("Manuelle Rechts-, Checkout-, Produkt- und Accessibility-Prüfungen bleiben erforderlich.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
