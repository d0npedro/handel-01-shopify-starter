import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { storeConfig } from "@/lib/config";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts();
  const demo = storeConfig.mode === "demo";
  return (
    <>
      <section className="hero">
        <div className="hero__meta"><span>SHOPIFY SYSTEM / DE</span><span>PHYSISCH + DIGITAL</span></div>
        <div className="hero__copy"><p className="eyebrow">Ein System. Jede Idee.</p><h1>Verkaufen,<br /><em>ohne neu</em><br />anzufangen.</h1></div>
        <div className="hero__object" aria-hidden="true"><div className="hero-disc"><span>01</span><i /></div><div className="hero-card"><span>MODULAR<br />COMMERCE</span><b>↗</b></div></div>
        <div className="hero__bottom"><p>Ein präziser, schneller Ausgangspunkt für Waren, Code, Audio und Software — mit Shopify im Rücken.</p><Link className="button button--primary" href="/shop">Katalog öffnen <span>↗</span></Link></div>
      </section>

      <section className="manifesto">
        <p className="section-index">01 / SYSTEM</p>
        <div><h2>Nicht auf eine Idee gebaut.<br /><em>Auf deine nächsten zehn.</em></h2><p>Produkte wechseln. Infrastruktur bleibt. Katalog, Warenkorb, Checkout, Pflichtinformationen und Design passen sich an.</p></div>
      </section>

      <section className="featured-section">
        <div className="section-heading"><div><p className="eyebrow">{demo ? "Demo-Katalog" : "Katalog"}</p><h2>Vier Wege,<br />Wert zu liefern.</h2></div><Link href="/shop">Alle Produkte <span>↗</span></Link></div>
        <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="system-grid">
        <article><span>01</span><h3>Shopify Core</h3><p>Produkte, Märkte, Bestand, Steuern und sichere Zahlungen bleiben zentral in Shopify.</p></article>
        <article><span>02</span><h3>Vercel Edge</h3><p>Schnelle Auslieferung, automatische Deployments und skalierbare Server-Funktionen.</p></article>
        <article><span>03</span><h3>DE Ready</h3><p>Preislogik, Rechtshinweise, Widerruf, Datenschutz und Barrierefreiheit als belastbare Basis.</p></article>
        <article className="system-grid__accent"><span>04</span><h3>Deine Idee</h3><p>Branding, Sortiment und Inhalte austauschen — das Commerce-System bleibt.</p><Link href="/startklar">Go-live-Status ↗</Link></article>
      </section>
    </>
  );
}
