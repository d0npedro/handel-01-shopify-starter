import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = { title: "Versand & Zahlung" };
export default function ShippingPage() {
  return <LegalShell eyebrow="Lieferung" title="Versand & Zahlung" intro="Transparente Konditionen für physische und digitale Bestellungen.">
    <section><h2>Liefergebiet</h2><p>Der Demo-Shop ist auf Lieferungen innerhalb Deutschlands ausgelegt. Vor Erweiterung auf weitere Länder müssen Shopify Markets, Steuern, Zölle, Verbraucherinformationen, Verpackungs- und Produktpflichten je Zielland geprüft werden.</p></section>
    <section><h2>Versandkosten</h2><p>Standardversand Deutschland: 5,99 €, ab 55,00 € Warenwert versandkostenfrei. Expressversand Deutschland: 9,99 €. Für digitale Produkte fallen keine Versandkosten an. Die Kosten sind identisch im Shopify-Versandprofil hinterlegt und werden vor Bestellung im Checkout angezeigt.</p></section>
    <section><h2>Lieferzeiten</h2><p>Lagernde physische Produkte: Standard 3–5 Werktage, Express 1–2 Werktage. Abweichende Zeiten werden direkt am Produkt angezeigt. Digitale Inhalte werden nach bestätigter Zahlung über die konfigurierte Digital-Products-App per E-Mail oder Kundenkonto bereitgestellt.</p></section>
    <section><h2>Zahlungsarten</h2><p>Im Shopify Checkout können je nach aktivierter Konfiguration beispielsweise Kreditkarte, PayPal, Klarna oder Shop Pay angeboten werden. Maßgeblich sind ausschließlich die im Checkout sichtbaren Zahlungsarten, Gebühren und Fälligkeiten.</p></section>
    <section><h2>Gemischte Bestellungen</h2><p>Bei einer Bestellung aus physischen und digitalen Produkten wird der digitale Teil nach Zahlung separat bereitgestellt; physische Ware wird versandt. Digitale Produkte sind in Shopify als „kein physisches Produkt“ zu konfigurieren.</p></section>
  </LegalShell>;
}
