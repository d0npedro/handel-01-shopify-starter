import type { MetadataRoute } from "next";
import { storeConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  if (storeConfig.mode === "demo") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/warenkorb", "/vertrag-widerrufen", "/startklar"] }, sitemap: `${storeConfig.siteUrl}/sitemap.xml` };
}
