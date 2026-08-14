import Link from "next/link";
import { CartLink } from "@/components/cart-link";

export function SiteHeader({ name, demo }: { name: string; demo: boolean }) {
  return (
    <>
      {demo ? (
        <div className="demo-bar" role="status">
          DEMO-MODUS · Checkout gesperrt, bis Händler- und Shopify-Daten vollständig sind
          <Link href="/startklar">Status prüfen</Link>
        </div>
      ) : null}
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={`${name} Startseite`}>
          {name}<sup>DE</sup>
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link href="/shop">Shop</Link>
          <Link href="/shop?typ=digital">Digital</Link>
          <Link href="/ueber">System</Link>
        </nav>
        <CartLink />
      </header>
    </>
  );
}
