import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { ProductArt } from "@/components/product-art";
import { ProductPurchase } from "@/components/product-purchase";
import { productKindLabels } from "@/lib/demo-products";
import { formatMoney } from "@/lib/money";
import { getPrimaryProduct } from "@/lib/shopify";

async function requestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const [product, origin] = await Promise.all([getPrimaryProduct(), requestOrigin()]);
  const socialImage = product.image?.url || `${origin}/og.png`;
  const socialImageMetadata = product.image
    ? { url: product.image.url, width: product.image.width, height: product.image.height, alt: product.image.altText }
    : { url: socialImage, width: 1731, height: 909, alt: `${product.title} – Produktvorschau` };
  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: origin,
      title: product.title,
      description: product.shortDescription,
      images: [socialImageMetadata],
    },
    twitter: { card: "summary_large_image", title: product.title, description: product.shortDescription, images: [socialImage] },
  };
}

export default async function HomePage() {
  const [product, origin] = await Promise.all([getPrimaryProduct(), requestOrigin()]);
  const variant = product.variants[0];
  const isPhysical = product.kind === "physical";
  const highlights = product.highlights.length ? product.highlights : ["Klar beschrieben", "Sicher bezahlt", "Zuverlässig geliefert"];
  const faq = [
    { question: "Wann ist meine Bestellung da?", answer: product.deliveryNote },
    {
      question: "Kann ich meine Bestellung widerrufen?",
      answer: isPhysical
        ? "Für Verbraucher gilt grundsätzlich das gesetzliche Widerrufsrecht. Einzelheiten, Fristen und mögliche Ausnahmen stehen in der Widerrufsbelehrung."
        : "Bei digitalen Inhalten kann das Widerrufsrecht nach ausdrücklicher Zustimmung und Bestätigung mit Beginn der Bereitstellung erlöschen. Die Einwilligungen werden vor dem Checkout separat abgefragt.",
    },
    { question: "Wie bezahle ich?", answer: "Verfügbare Zahlungsarten und der endgültige Gesamtbetrag werden transparent im sicheren Shopify Checkout angezeigt." },
    { question: "Was ist im Preis enthalten?", answer: `Der ausgewiesene Gesamtpreis enthält die gesetzliche Mehrwertsteuer. ${isPhysical ? "Versandkosten werden vor Abschluss der Bestellung ausgewiesen." : "Für die digitale Bereitstellung fallen keine Versandkosten an."}` },
  ];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: product.vendor },
    category: productKindLabels[product.kind],
    ...(product.image ? { image: [product.image.url] } : {}),
    ...(variant
      ? {
          offers: {
            "@type": "Offer",
            url: origin,
            priceCurrency: variant.price.currencyCode,
            price: variant.price.amount,
            availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }
      : {}),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <section className="single-hero" aria-labelledby="product-title">
        <div className="single-hero__visual">
          {product.image ? (
            <Image src={product.image.url} alt={product.image.altText} fill priority sizes="(max-width: 800px) 100vw, 52vw" />
          ) : (
            <ProductArt kind={product.kind} />
          )}
          <span className="single-hero__badge">{productKindLabels[product.kind]} / 01</span>
        </div>
        <div className="single-hero__content">
          <div className="single-hero__meta"><span>Ein Produkt. Ein Fokus.</span><span>{product.vendor}</span></div>
          <p className="eyebrow">{isPhysical ? "Für den Alltag gebaut" : "Direkt einsatzbereit"}</p>
          <h1 id="product-title">{product.title}</h1>
          <p className="single-hero__lede">{product.shortDescription}</p>
          {variant ? <p className="single-hero__price">{formatMoney(variant.price)} <small>inkl. MwSt.</small></p> : null}
          <div id="kaufen"><ProductPurchase product={product} /></div>
          <p className="delivery-note"><span aria-hidden="true">●</span> {product.deliveryNote}</p>
        </div>
      </section>

      <section className="single-proof" aria-label="Produktvorteile">
        {highlights.slice(0, 3).map((highlight, index) => <div key={highlight}><span>0{index + 1}</span><strong>{highlight}</strong></div>)}
      </section>

      <section className="single-story" id="details">
        <div className="single-story__heading"><p className="section-index">01 / WARUM</p><h2>Weniger suchen.<br /><em>Mehr nutzen.</em></h2></div>
        <div className="single-story__copy"><p>{product.description}</p><p>Keine künstliche Auswahl, keine ablenkenden Kategorien. Diese Seite erklärt genau einen Artikel – mit Preis, Lieferumfang und allen entscheidenden Informationen an einem Ort.</p></div>
      </section>

      <section className="single-showcase" aria-label={`${product.title} im Detail`}>
        <div className="single-showcase__art"><ProductArt kind={product.kind} /></div>
        <div className="single-showcase__spec">
          <p className="eyebrow">Das Wesentliche</p>
          <h2>Ein klares<br />Versprechen.</h2>
          <ol>{highlights.map((highlight, index) => <li key={highlight}><span>{String(index + 1).padStart(2, "0")}</span>{highlight}</li>)}</ol>
        </div>
      </section>

      <section className="single-delivery" id="lieferung">
        <div><p className="section-index">02 / LIEFERUNG</p><h2>{isPhysical ? "Sicher verpackt.\nNachvollziehbar geliefert." : "Direkt verfügbar.\nKlar lizenziert."}</h2></div>
        <div className="single-delivery__facts">
          <article><span>01</span><h3>Bereitstellung</h3><p>{product.deliveryNote}</p></article>
          <article><span>02</span><h3>{isPhysical ? "Rückgabe" : "Nutzungsrecht"}</h3><p>{isPhysical ? "Widerrufsbelehrung, Rücksendeweg und Kontakt sind jederzeit erreichbar." : product.license || "Die konkrete Lizenz wird vor dem Verkauf transparent ausgewiesen."}</p></article>
          <article><span>03</span><h3>Sicher bezahlen</h3><p>Zahlungsarten, Versand und Endbetrag werden vor dem Kauf im Shopify Checkout angezeigt.</p></article>
        </div>
      </section>

      <section className="single-compliance" aria-labelledby="compliance-title">
        <div><p className="section-index">03 / TRANSPARENZ</p><h2 id="compliance-title">Alles offen.<br />Vor dem Kauf.</h2></div>
        {isPhysical ? (
          <div className="single-compliance__grid">
            <article><h3>Hersteller</h3>{product.manufacturer ? <address>{product.manufacturer.name}<br />{product.manufacturer.address}<br /><a href={`mailto:${product.manufacturer.email}`}>{product.manufacturer.email}</a></address> : <p>Vor Veröffentlichung in Shopify ergänzen.</p>}</article>
            <article><h3>Sicherheit</h3><p>{product.safetyInformation || "Konkrete Sicherheitsinformationen vor Veröffentlichung ergänzen."}</p></article>
            <article><h3>Preis</h3><p>{product.lowestPrice30Days ? `Niedrigster Gesamtpreis der letzten 30 Tage: ${product.lowestPrice30Days}` : "Aktuell keine beworbene Preisermäßigung."}</p></article>
          </div>
        ) : (
          <div className="single-compliance__grid">
            <article><h3>Datei</h3><p>{product.fileDetails || "Dateiformat und Größe vor Veröffentlichung ergänzen."}</p></article>
            <article><h3>Kompatibilität</h3><p>{product.systemRequirements || "Systemanforderungen vor Veröffentlichung ergänzen."}</p></article>
            <article><h3>Lizenz</h3><p>{product.license || "Nutzungsrechte vor Veröffentlichung ergänzen."}</p></article>
          </div>
        )}
      </section>

      <section className="single-faq" id="fragen">
        <div><p className="section-index">04 / FRAGEN</p><h2>Noch etwas<br /><em>unklar?</em></h2><p>Die wichtigsten Antworten vor deiner Entscheidung.</p></div>
        <div>{faq.map((item, index) => <details key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<b aria-hidden="true">+</b></summary><p>{item.answer}</p></details>)}</div>
      </section>

      <section className="single-final" aria-labelledby="final-title">
        <div><p className="eyebrow">Ein Produkt. Keine Umwege.</p><h2 id="final-title">{product.title}</h2><p>{product.shortDescription}</p><Link href="#main">Zurück nach oben ↑</Link></div>
        <div className="single-final__action">
          {variant ? <strong>{formatMoney(variant.price)}</strong> : null}
          <span>inkl. MwSt. {isPhysical ? "· zzgl. Versand" : "· keine Versandkosten"}</span>
          <Link className="button button--primary button--full" href="#kaufen">Jetzt auswählen</Link>
        </div>
      </section>
    </>
  );
}
