import { pathToFileURL } from "node:url";

export const liveRequirements = {
  "Öffentliche URL": ["NEXT_PUBLIC_SITE_URL"],
  "Shopify Storefront": ["SHOPIFY_STORE_DOMAIN"],
  "Shopify Token": ["SHOPIFY_STOREFRONT_PRIVATE_TOKEN", "SHOPIFY_STOREFRONT_PUBLIC_TOKEN"],
  "Händlerdaten": ["LEGAL_NAME", "LEGAL_OWNER", "LEGAL_STREET", "LEGAL_POSTCODE", "LEGAL_CITY", "LEGAL_EMAIL", "LEGAL_PHONE"],
  "Widerrufszustellung": ["RESEND_API_KEY", "REVOCATION_EMAIL_FROM"],
};

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
