import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.siteUrl),
  title: { default: `${storeConfig.name} — ${storeConfig.tagline}`, template: `%s — ${storeConfig.name}` },
  description: "Fokussierter Shopify-Shop für genau einen Artikel – schnell, klar und für Deutschland vorbereitet.",
  applicationName: storeConfig.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "de_DE", siteName: storeConfig.name, title: `${storeConfig.name} — ${storeConfig.tagline}`, description: "Ein production-ready Ein-Produkt-Shop für Deutschland." },
  twitter: { card: "summary_large_image", title: `${storeConfig.name} — ${storeConfig.tagline}`, description: "Ein production-ready Ein-Produkt-Shop für Deutschland." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f1e8", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <a className="skip-link" href="#main">Zum Inhalt springen</a>
        <CartProvider productHandle={storeConfig.singleProductHandle}>
          <SiteHeader name={storeConfig.name} demo={storeConfig.mode === "demo"} />
          <main id="main">{children}</main>
          <SiteFooter name={storeConfig.name} />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
