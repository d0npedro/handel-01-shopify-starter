import "server-only";

import { cache } from "react";
import { readiness, shopifyConfig, storeConfig } from "@/lib/config";
import { demoProducts } from "@/lib/demo-products";
import type { Product, ProductKind, ProductVariant } from "@/lib/types";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ShopifyMetafield = { value: string } | null;

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  featuredImage: Product["image"] | null;
  productKind: ShopifyMetafield;
  shortDescription: ShopifyMetafield;
  deliveryNote: ShopifyMetafield;
  license: ShopifyMetafield;
  fileDetails: ShopifyMetafield;
  systemRequirements: ShopifyMetafield;
  manufacturer: ShopifyMetafield;
  manufacturerAddress: ShopifyMetafield;
  manufacturerEmail: ShopifyMetafield;
  safetyInformation: ShopifyMetafield;
  lowestPrice30Days: ShopifyMetafield;
  unitPrice: ShopifyMetafield;
  highlights: ShopifyMetafield;
  variants: { nodes: ProductVariant[] };
};

type ShopifyCheckoutVariantNode = {
  id: string;
  availableForSale: boolean;
  requiresShipping: boolean;
  product: {
    handle: string;
    productType: string;
    tags: string[];
    productKind: ShopifyMetafield;
  };
};

export type CheckoutVariant = {
  id: string;
  productHandle: string;
  availableForSale: boolean;
  requiresShipping: boolean;
  kind: ProductKind;
};

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  vendor
  tags
  featuredImage { url altText width height }
  productKind: metafield(namespace: "custom", key: "product_kind") { value }
  shortDescription: metafield(namespace: "custom", key: "short_description") { value }
  deliveryNote: metafield(namespace: "custom", key: "delivery_note") { value }
  license: metafield(namespace: "custom", key: "license") { value }
  fileDetails: metafield(namespace: "custom", key: "file_details") { value }
  systemRequirements: metafield(namespace: "custom", key: "system_requirements") { value }
  manufacturer: metafield(namespace: "custom", key: "manufacturer") { value }
  manufacturerAddress: metafield(namespace: "custom", key: "manufacturer_address") { value }
  manufacturerEmail: metafield(namespace: "custom", key: "manufacturer_email") { value }
  safetyInformation: metafield(namespace: "custom", key: "safety_information") { value }
  lowestPrice30Days: metafield(namespace: "custom", key: "lowest_price_30d") { value }
  unitPrice: metafield(namespace: "custom", key: "unit_price") { value }
  highlights: metafield(namespace: "custom", key: "highlights") { value }
  variants(first: 20) {
    nodes {
      id
      title
      availableForSale
      requiresShipping
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
    }
  }
`;

function hasShopifyConnection() {
  return readiness.shopify;
}

function inferKind(
  product: Pick<ShopifyProductNode, "productKind" | "productType" | "tags">,
  requiresShipping: boolean,
): ProductKind {
  const explicit = product.productKind?.value.toLowerCase();
  if (["physical", "script", "music", "software"].includes(explicit ?? "")) {
    return explicit as ProductKind;
  }
  const searchable = `${product.productType} ${product.tags.join(" ")}`.toLowerCase();
  if (searchable.includes("music") || searchable.includes("musik") || searchable.includes("audio")) return "music";
  if (searchable.includes("script") || searchable.includes("skript")) return "script";
  if (searchable.includes("software") || searchable.includes("app")) return "software";
  return requiresShipping ? "physical" : "software";
}

function toProduct(node: ShopifyProductNode): Product {
  const kind = inferKind(node, node.variants.nodes.some((item) => item.requiresShipping));
  const manufacturer =
    node.manufacturer?.value && node.manufacturerAddress?.value && node.manufacturerEmail?.value
      ? {
          name: node.manufacturer.value,
          address: node.manufacturerAddress.value,
          email: node.manufacturerEmail.value,
        }
      : undefined;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    shortDescription: node.shortDescription?.value || node.description.slice(0, 150),
    kind,
    vendor: node.vendor,
    tags: node.tags,
    image: node.featuredImage
      ? { ...node.featuredImage, altText: node.featuredImage.altText || node.title }
      : undefined,
    variants: node.variants.nodes,
    deliveryNote:
      node.deliveryNote?.value ||
      (kind === "physical" ? "Lieferzeit wird im Checkout berechnet" : "Digitale Bereitstellung nach Zahlung"),
    unitPrice: node.unitPrice?.value,
    lowestPrice30Days: node.lowestPrice30Days?.value,
    highlights: node.highlights?.value
      ? node.highlights.value.split("|").map((item) => item.trim()).filter(Boolean)
      : [],
    license: node.license?.value,
    fileDetails: node.fileDetails?.value,
    systemRequirements: node.systemRequirements?.value,
    manufacturer,
    safetyInformation: node.safetyInformation?.value,
  };
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { buyerIp?: string; noStore?: boolean } = {},
) {
  if (!hasShopifyConnection()) throw new Error("Shopify Storefront API ist nicht konfiguriert.");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (shopifyConfig.privateToken) {
    headers["Shopify-Storefront-Private-Token"] = shopifyConfig.privateToken;
  } else if (shopifyConfig.publicToken) {
    headers["X-Shopify-Storefront-Access-Token"] = shopifyConfig.publicToken;
  }
  if (options.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = options.buyerIp;

  const requestInit: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  };
  if (options.noStore) requestInit.cache = "no-store";
  else requestInit.next = { revalidate: 300, tags: ["shopify"] };

  const response = await fetch(
    `https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`,
    requestInit,
  );
  const result = (await response.json()) as GraphQLResponse<T>;
  if (!response.ok || result.errors?.length || !result.data) {
    const detail = result.errors?.map((item) => item.message).join("; ") || response.statusText;
    throw new Error(`Shopify-Anfrage fehlgeschlagen: ${detail}`);
  }
  return result.data;
}

export async function getProducts(): Promise<Product[]> {
  if (!hasShopifyConnection()) {
    if (storeConfig.mode === "demo") return demoProducts;
    throw new Error("Live-Katalog benötigt eine konfigurierte Shopify Storefront API.");
  }
  try {
    const data = await shopifyFetch<{ products: { nodes: ShopifyProductNode[] } }>(`
      query Products @inContext(country: DE, language: DE) {
        products(first: 48, sortKey: CREATED_AT, reverse: true) { nodes { ${PRODUCT_FIELDS} } }
      }
    `);
    return data.products.nodes.map(toProduct);
  } catch (error) {
    if (storeConfig.mode === "demo") return demoProducts;
    throw error;
  }
}

export const getProduct = cache(async (handle: string): Promise<Product | undefined> => {
  if (!hasShopifyConnection()) {
    if (storeConfig.mode === "demo") return demoProducts.find((product) => product.handle === handle);
    throw new Error("Live-Katalog benötigt eine konfigurierte Shopify Storefront API.");
  }
  try {
    const data = await shopifyFetch<{ product: ShopifyProductNode | null }>(
      `query Product($handle: String!) @inContext(country: DE, language: DE) {
        product(handle: $handle) { ${PRODUCT_FIELDS} }
      }`,
      { handle },
    );
    return data.product ? toProduct(data.product) : undefined;
  } catch (error) {
    if (storeConfig.mode === "demo") return demoProducts.find((product) => product.handle === handle);
    throw error;
  }
});

export const getPrimaryProduct = cache(async (): Promise<Product> => {
  const handle = storeConfig.singleProductHandle;
  if (!handle) throw new Error("Für den Ein-Produkt-Shop fehlt SINGLE_PRODUCT_HANDLE.");
  const product = await getProduct(handle);
  if (!product) throw new Error(`Der konfigurierte Shopify-Artikel \"${handle}\" wurde nicht gefunden.`);
  return product;
});

export async function getCheckoutVariants(ids: string[], buyerIp?: string): Promise<CheckoutVariant[]> {
  const uniqueIds = [...new Set(ids)];
  const data = await shopifyFetch<{ nodes: Array<ShopifyCheckoutVariantNode | null> }>(
    `query CheckoutVariants($ids: [ID!]!) @inContext(country: DE, language: DE) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          availableForSale
          requiresShipping
          product {
            handle
            productType
            tags
            productKind: metafield(namespace: "custom", key: "product_kind") { value }
          }
        }
      }
    }`,
    { ids: uniqueIds },
    { buyerIp, noStore: true },
  );

  return data.nodes.flatMap((node) =>
    node
      ? [{
          id: node.id,
          productHandle: node.product.handle,
          availableForSale: node.availableForSale,
          requiresShipping: node.requiresShipping,
          kind: inferKind(node.product, node.requiresShipping),
        }]
      : [],
  );
}

export async function createCheckout(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  consent: { terms: boolean; digitalSupply: boolean; digitalWithdrawal: boolean; recordedAt: string },
  buyerIp?: string,
) {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: Array<{ field: string[] | null; message: string }>;
      warnings: Array<{ message: string }>;
    };
  }>(
    `mutation CartCreate($input: CartInput!) @inContext(country: DE, language: DE) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
        warnings { message }
      }
    }`,
    {
      input: {
        lines,
        buyerIdentity: { countryCode: "DE" },
        attributes: [
          { key: "terms_accepted", value: String(consent.terms) },
          { key: "consent_recorded_at", value: consent.recordedAt },
          { key: "legal_text_version", value: "2026-08-14" },
          { key: "digital_supply_before_withdrawal_period", value: String(consent.digitalSupply) },
          { key: "digital_withdrawal_loss_acknowledged", value: String(consent.digitalWithdrawal) },
        ],
      },
    },
    { buyerIp, noStore: true },
  );
  if (data.cartCreate.userErrors.length || !data.cartCreate.cart) {
    throw new Error(data.cartCreate.userErrors.map((item) => item.message).join("; ") || "Warenkorb konnte nicht erstellt werden.");
  }
  return data.cartCreate.cart;
}
