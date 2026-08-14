import type { Metadata } from "next";
import { FilterGrid } from "@/components/filter-grid";
import { storeConfig } from "@/lib/config";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = { title: "Shop", description: "Physische Produkte, Skripte, generierte Musik und Software entdecken." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  const demo = storeConfig.mode === "demo";
  return (
    <section className="catalog-page">
      <header className="catalog-header"><div><p className="eyebrow">Katalog / {demo ? "Demo" : "Shop"}</p><h1>Ideen, die<br /><em>lieferbar</em> werden.</h1></div><p>Ein gemischter Katalog als Vorlage: echte Warenlogik für Versandprodukte und digitale Bereitstellung für Code, Audio und Apps.</p></header>
      <FilterGrid products={products} initialFilter={params.typ} />
    </section>
  );
}
