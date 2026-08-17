import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/kontakt", "/impressum", "/datenschutz", "/agb", "/widerrufsbelehrung", "/versand-zahlung", "/barrierefreiheit"];
  return staticPaths.map((path) => ({ url: `${storeConfig.siteUrl}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.6 }));
}
