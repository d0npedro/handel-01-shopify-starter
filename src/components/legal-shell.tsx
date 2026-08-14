import Link from "next/link";
import { storeConfig } from "@/lib/config";

export function LegalShell({ eyebrow, title, intro, updated = "14. August 2026", children }: { eyebrow: string; title: string; intro: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="legal-layout">
      <aside className="legal-aside">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <span>Stand: {updated}</span>
        <nav aria-label="Rechtliche Seiten"><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/agb">AGB</Link><Link href="/widerrufsbelehrung">Widerruf</Link></nav>
      </aside>
      <article className="legal-copy">
        {storeConfig.mode === "demo" ? (
          <div className="legal-warning" role="note"><strong>Mustertext im Demo-Modus</strong><p>Vor dem Verkauf müssen alle eckigen Platzhalter durch echte Händlerdaten ersetzt und die Texte durch eine qualifizierte Rechtsberatung an Geschäftsmodell, Sortiment, Länder und Apps angepasst werden.</p></div>
        ) : null}
        {children}
      </article>
    </div>
  );
}

export function MerchantAddress() {
  const merchant = storeConfig.merchant;
  return <address>{merchant.name}<br />Vertreten durch: {merchant.owner}<br />{merchant.street}<br />{merchant.postcode} {merchant.city}<br />{merchant.country}</address>;
}
