import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/config";
import { getProducts } from "@/lib/shopify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticPaths = ["", "/shop", "/ueber", "/kontakt", "/impressum", "/datenschutz", "/agb", "/widerrufsbelehrung", "/versand-zahlung", "/barrierefreiheit"];
  return [...staticPaths.map((path) => ({ url: `${storeConfig.siteUrl}${path}`, lastModified: new Date(), changeFrequency: path === "/shop" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.6 })), ...products.map((product) => ({ url: `${storeConfig.siteUrl}/produkt/${product.handle}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }))];
}
