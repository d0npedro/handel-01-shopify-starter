const value = (key: string) => process.env[key]?.trim() ?? "";

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
    register: value("LEGAL_REGISTER") || "[REGISTERGERICHT, FALLS VORHANDEN]",
    registerNumber: value("LEGAL_REGISTER_NUMBER") || "[REGISTERNUMMER, FALLS VORHANDEN]",
    vatId: value("LEGAL_VAT_ID") || "[UST-ID, FALLS VORHANDEN]",
    lucidNumber: value("LEGAL_LUCID_NUMBER") || "[LUCID-NUMMER VOR PHYSISCHEM VERSAND EINTRAGEN]",
  },
};

export const shopifyConfig = {
  domain: value("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, ""),
  privateToken: value("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
  publicToken: value("SHOPIFY_STOREFRONT_PUBLIC_TOKEN"),
  apiVersion: value("SHOPIFY_STOREFRONT_API_VERSION") || "2026-07",
};

export const emailConfig = {
  apiKey: value("RESEND_API_KEY"),
  from: value("REVOCATION_EMAIL_FROM"),
  merchant: value("LEGAL_EMAIL"),
};

export const readiness = {
  liveMode: storeConfig.mode === "live",
  shopify: Boolean(shopifyConfig.domain && (shopifyConfig.privateToken || shopifyConfig.publicToken)),
  merchant: ["LEGAL_NAME", "LEGAL_OWNER", "LEGAL_STREET", "LEGAL_POSTCODE", "LEGAL_CITY", "LEGAL_EMAIL", "LEGAL_PHONE"].every(
    (key) => Boolean(value(key)),
  ),
  revocationEmail: Boolean(emailConfig.apiKey && emailConfig.from && emailConfig.merchant),
  lucid: Boolean(value("LEGAL_LUCID_NUMBER")),
  siteUrl: Boolean(value("NEXT_PUBLIC_SITE_URL") && value("NEXT_PUBLIC_SITE_URL") !== "http://localhost:3000"),
};

export function assertCheckoutReady() {
  const missing: string[] = [];
  if (!readiness.liveMode) missing.push("SHOP_MODE=live");
  if (!readiness.shopify) missing.push("Shopify Storefront API");
  if (!readiness.merchant) missing.push("Händlerpflichtangaben");
  if (!readiness.revocationEmail) missing.push("Widerrufs-E-Mail");
  if (!readiness.siteUrl) missing.push("öffentliche Shop-URL");
  if (missing.length) {
    throw new Error(`Checkout ist noch nicht freigegeben: ${missing.join(", ")}`);
  }
}
