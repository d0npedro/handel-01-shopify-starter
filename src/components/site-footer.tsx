import Link from "next/link";

export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <p className="eyebrow">Ein Produkt. Klar erklärt.</p>
        <h2>{name}</h2>
        <p>Ein fokussiertes Shopify-Template für genau einen Artikel.</p>
      </div>
      <div className="footer-links">
        <div><h3>Produkt</h3><Link href="/#details">Details</Link><Link href="/#lieferung">Lieferung</Link><Link href="/#fragen">Häufige Fragen</Link></div>
        <div><h3>Recht</h3><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/agb">AGB</Link><Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link></div>
        <div><h3>Service</h3><Link href="/versand-zahlung">Versand & Zahlung</Link><Link href="/kontakt">Kontakt</Link><Link className="revocation-link" href="/vertrag-widerrufen">Vertrag widerrufen</Link><Link href="/barrierefreiheit">Barrierefreiheit</Link></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {name}</span>
        <span>Preise inkl. MwSt.</span>
        <button className="link-button" type="button" data-open-consent>Cookie-Einstellungen</button>
      </div>
    </footer>
  );
}
