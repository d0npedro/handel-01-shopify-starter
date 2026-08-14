import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Das System" };
export default function AboutPage() {
  return <div className="story-page"><header><p className="eyebrow">System / 01</p><h1>Ein Shop,<br /><em>viele Leben.</em></h1><p>HANDEL/01 trennt Marke und Sortiment von der Commerce-Infrastruktur. So wird aus einer Idee schnell ein belastbares Geschäft — ohne beim nächsten Konzept wieder bei null zu starten.</p></header><section><span>01</span><div><h2>Shopify als Quelle</h2><p>Produkte, Varianten, Bestand, Märkte und Bestellungen werden zentral in Shopify gepflegt. Die Storefront API liefert nur das, was der Shop braucht.</p></div></section><section><span>02</span><div><h2>Headless auf Vercel</h2><p>Next.js rendert schnell, suchmaschinenfreundlich und barrierearm. Vercel übernimmt Deployment, CDN und Server-Funktionen.</p></div></section><section><span>03</span><div><h2>Sicherer Wechsel</h2><p>Farben, Schriften, Inhalte, Produktarten und Metafelder sind modular. Der Live-Modus bleibt gesperrt, bis Recht, Shop und E-Mail vollständig konfiguriert sind.</p></div></section><Link className="button button--primary" href="/startklar">Go-live vorbereiten</Link></div>;
}
