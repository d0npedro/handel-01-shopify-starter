import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Barrierefreiheit" };
export default function AccessibilityPage() {
  return <LegalShell eyebrow="BFSG" title="Barrierefreiheit" intro="Informationen zur barrierefreien Nutzung dieses Online-Shops.">
    <section><h2>Geltungsbereich</h2><p>{storeConfig.name} ist als Dienstleistung im elektronischen Geschäftsverkehr auf eine barrierefreie Nutzung ausgelegt. Ziel ist die Erfüllung der Anforderungen des Barrierefreiheitsstärkungsgesetzes und der BFSGV unter Orientierung an EN 301 549 und WCAG 2.2 Level AA.</p></section>
    <section><h2>Umgesetzte Funktionen</h2><ul><li>Semantische Überschriften, Landmarks und Formulare</li><li>vollständige Tastaturbedienung und sichtbare Fokusmarkierung</li><li>Skip-Link zum Hauptinhalt</li><li>ausreichende Kontraste und skalierbare Typografie</li><li>Textalternativen für produktbezogene Bilder</li><li>verständliche Fehlermeldungen und Statusausgaben</li><li>reduzierte Bewegung bei entsprechender Systemeinstellung</li></ul></section>
    <section><h2>Bekannte Grenzen</h2><p>Der externe Shopify Checkout und installierte Apps müssen separat geprüft und konfiguriert werden. PDF-Dokumente, neu eingepflegte Produktmedien und Inhalte Dritter benötigen jeweils eine eigene Prüfung. Im Demo-Modus ist noch kein abschließendes externes Konformitätsaudit erfolgt.</p></section>
    <section><h2>Feedback und Kontakt</h2><p>Wenn Sie auf eine Barriere stoßen oder Informationen in einem barrierefreien Format benötigen, schreiben Sie an <a href={`mailto:${storeConfig.merchant.email}`}>{storeConfig.merchant.email}</a> oder rufen Sie {storeConfig.merchant.phone} an. Bitte nennen Sie die betroffene Seite, das verwendete Hilfsmittel und die beobachtete Barriere.</p></section>
    <section><h2>Marktüberwachung</h2><p>Vor Go-live sind die nach BFSG erforderlichen Informationen zur zuständigen Marktüberwachungsbehörde und das interne Verfahren für Barrierefreiheitsanfragen mit Rechtsberatung und den aktuellen Behördenangaben zu ergänzen.</p></section>
  </LegalShell>;
}
