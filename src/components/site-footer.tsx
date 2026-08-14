import Link from "next/link";

export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <p className="eyebrow">Commerce, bereit für die nächste Idee.</p>
        <h2>{name}</h2>
        <p>Ein modularer Shopify-Starter für physische und digitale Produkte.</p>
      </div>
      <div className="footer-links">
        <div><h3>Shop</h3><Link href="/shop">Alle Produkte</Link><Link href="/versand-zahlung">Versand & Zahlung</Link><Link href="/kontakt">Kontakt</Link></div>
        <div><h3>Recht</h3><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/agb">AGB</Link><Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link></div>
        <div><h3>Zugang</h3><Link className="revocation-link" href="/vertrag-widerrufen">Vertrag widerrufen</Link><Link href="/barrierefreiheit">Barrierefreiheit</Link><Link href="/startklar">Go-live-Status</Link></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {name}</span>
        <span>Preise inkl. MwSt.</span>
        <button className="link-button" type="button" data-open-consent>Cookie-Einstellungen</button>
      </div>
    </footer>
  );
}
