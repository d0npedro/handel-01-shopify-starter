import "server-only";

const value = (key: string) => process.env[key]?.trim() ?? "";
export const STOREFRONT_API_VERSION = "2026-07";

function isPublicHttpsUrl(candidate: string) {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function isShopifyDomain(candidate: string) {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(candidate);
}

function isEmailAddress(candidate: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) && candidate.length <= 254;
}

export const storeConfig = {
  mode: value("SHOP_MODE") === "live" ? "live" : "demo",
  name: value("NEXT_PUBLIC_STORE_NAME") || "HANDEL/01",
  tagline: value("NEXT_PUBLIC_STORE_TAGLINE") || "Ein System. Jede Idee.",
  siteUrl: value("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  merchant: {
    name: value("LEGAL_NAME") || "[FIRMENNAME EINTRAGEN]",
    owner: value("LEGAL_OWNER") || "[VERTRETUNGSBERECHTIGTE PERSON EINTRAGEN]",
    street: value("LEGAL_STREET") || "[STRASSE UND HAUSNUMMER EINTRAGEN]",
    postcode: value("LEGAL_POSTCODE") || "[PLZ EINTRAGEN]",
    city: value("LEGAL_CITY") || "[ORT EINTRAGEN]",
    country: value("LEGAL_COUNTRY") || "Deutschland",
    email: value("LEGAL_EMAIL") || "[E-MAIL EINTRAGEN]",
    phone: value("LEGAL_PHONE") || "[TELEFON EINTRAGEN]",
    register: value("LEGAL_REGISTER"),
    registerNumber: value("LEGAL_REGISTER_NUMBER"),
    vatId: value("LEGAL_VAT_ID"),
    lucidNumber: value("LEGAL_LUCID_NUMBER"),
  },
};

export const shopifyConfig = {
  domain: value("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, ""),
  privateToken: value("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
  publicToken: value("SHOPIFY_STOREFRONT_PUBLIC_TOKEN"),
  apiVersion: value("SHOPIFY_STOREFRONT_API_VERSION") || STOREFRONT_API_VERSION,
};

export const emailConfig = {
  apiKey: value("RESEND_API_KEY"),
  from: value("REVOCATION_EMAIL_FROM"),
  merchant: value("LEGAL_EMAIL"),
};

export const readiness = {
  liveMode: storeConfig.mode === "live",
  shopify: Boolean(
    isShopifyDomain(shopifyConfig.domain) &&
      (shopifyConfig.privateToken || shopifyConfig.publicToken) &&
      shopifyConfig.apiVersion === STOREFRONT_API_VERSION,
  ),
  merchant: Boolean(
    ["LEGAL_NAME", "LEGAL_OWNER", "LEGAL_STREET", "LEGAL_POSTCODE", "LEGAL_CITY", "LEGAL_PHONE"].every((key) => value(key)) &&
      /^\d{5}$/.test(value("LEGAL_POSTCODE")) &&
      isEmailAddress(value("LEGAL_EMAIL")),
  ),
  revocationEmail: Boolean(emailConfig.apiKey && isEmailAddress(emailConfig.from) && isEmailAddress(emailConfig.merchant)),
  lucid: Boolean(value("LEGAL_LUCID_NUMBER")),
  siteUrl: isPublicHttpsUrl(value("NEXT_PUBLIC_SITE_URL")),
};

export function assertCheckoutReady({ requiresPhysical = false }: { requiresPhysical?: boolean } = {}) {
  const missing: string[] = [];
  if (!readiness.liveMode) missing.push("SHOP_MODE=live");
  if (!readiness.shopify) missing.push("Shopify Storefront API");
  if (!readiness.merchant) missing.push("Händlerpflichtangaben");
  if (!readiness.revocationEmail) missing.push("Widerrufs-E-Mail");
  if (!readiness.siteUrl) missing.push("öffentliche Shop-URL");
  if (requiresPhysical && !readiness.lucid) missing.push("LUCID-Registrierung für physischen Versand");
  if (missing.length) {
    throw new Error(`Checkout ist noch nicht freigegeben: ${missing.join(", ")}`);
  }
}
