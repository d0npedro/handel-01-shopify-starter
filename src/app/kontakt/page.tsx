import type { Metadata } from "next";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Kontakt" };
export default function ContactPage() {
  return <section className="contact-page"><div><p className="eyebrow">Direkter Draht</p><h1>Wobei können<br />wir <em>helfen?</em></h1></div><div className="contact-card"><p>Fragen zu Produkten, Bestellung, Lizenz oder Rückgabe beantworten wir über die folgenden Kontaktdaten.</p><a href={`mailto:${storeConfig.merchant.email}`}>{storeConfig.merchant.email}</a><a href={`tel:${storeConfig.merchant.phone.replace(/\s/g, "")}`}>{storeConfig.merchant.phone}</a><p>Antwort üblicherweise innerhalb von zwei Werktagen.</p></div></section>;
}
