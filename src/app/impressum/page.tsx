import type { Metadata } from "next";
import { LegalShell, MerchantAddress } from "@/components/legal-shell";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Impressum" };
export default function ImprintPage() {
  const m = storeConfig.merchant;
  const demo = storeConfig.mode === "demo";
  return <LegalShell eyebrow="§ 5 DDG" title="Impressum" intro="Anbieterkennzeichnung und Kontaktangaben.">
    <section><h2>Angaben gemäß § 5 DDG</h2><MerchantAddress /></section>
    <section><h2>Kontakt</h2><p>Telefon: <a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a><br />E-Mail: <a href={`mailto:${m.email}`}>{m.email}</a></p></section>
    {m.register || m.registerNumber || demo ? <section><h2>Registereintrag</h2><p>Registergericht: {m.register || "[FALLS VORHANDEN EINTRAGEN]"}<br />Registernummer: {m.registerNumber || "[FALLS VORHANDEN EINTRAGEN]"}</p></section> : null}
    {m.vatId || demo ? <section><h2>Umsatzsteuer</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {m.vatId || "[FALLS VORHANDEN EINTRAGEN]"}</p></section> : null}
    {m.lucidNumber || demo ? <section><h2>Verpackungsregister</h2><p>LUCID-Registrierungsnummer: {m.lucidNumber || "[VOR PHYSISCHEM VERSAND EINTRAGEN]"}</p></section> : null}
    <section><h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Dieser Hinweis ist an eine abweichende tatsächliche Verpflichtung oder Teilnahmebereitschaft anzupassen.</p></section>
    <section><h2>Redaktionell verantwortlich</h2><p>{m.owner}<br />Anschrift wie oben.</p></section>
  </LegalShell>;
}
