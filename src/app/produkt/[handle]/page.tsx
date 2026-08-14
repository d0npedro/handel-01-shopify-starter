import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "@/components/product-art";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/money";
import { productKindLabels } from "@/lib/demo-products";
import { getProduct, getProducts } from "@/lib/shopify";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Produkt nicht gefunden" };
  return { title: product.title, description: product.shortDescription, openGraph: product.image ? { images: [{ url: product.image.url, alt: product.image.altText }] } : undefined };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const [product, products] = await Promise.all([getProduct(handle), getProducts()]);
  if (!product) notFound();
  const variant = product.variants[0];
  const recommendations = products.filter((item) => item.handle !== product.handle).slice(0, 3);
  return (
    <>
      <div className="product-page">
        <div className="product-page__visual">
          {product.image ? <Image src={product.image.url} alt={product.image.altText} fill priority sizes="(max-width: 900px) 100vw, 55vw" /> : <ProductArt kind={product.kind} />}
          <span className="product-page__type">{productKindLabels[product.kind]}</span>
        </div>
        <div className="product-page__info">
          <div className="breadcrumbs"><Link href="/shop">Shop</Link><span>/</span><span>{productKindLabels[product.kind]}</span></div>
          <p className="eyebrow">{product.vendor}</p>
          <h1>{product.title}</h1>
          <p className="product-lede">{product.shortDescription}</p>
          {variant ? <p className="product-inline-price">{formatMoney(variant.price)} <small>inkl. MwSt.</small></p> : null}
          <ProductPurchase product={product} />
          <p className="delivery-note"><span aria-hidden="true">●</span> {product.deliveryNote}</p>
        </div>
      </div>
      <section className="product-details">
        <div><p className="section-index">02 / DETAILS</p><h2>Was du<br /><em>bekommst.</em></h2></div>
        <div className="product-description"><p>{product.description}</p><ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      {product.kind === "physical" ? (
        <section className="compliance-panel"><h2>Produkt- & Sicherheitsinformationen</h2><div className="compliance-grid"><div><h3>Hersteller</h3>{product.manufacturer ? <address>{product.manufacturer.name}<br />{product.manufacturer.address}<br /><a href={`mailto:${product.manufacturer.email}`}>{product.manufacturer.email}</a></address> : <p>Vor Verkauf in Shopify-Metafeldern ergänzen.</p>}</div><div><h3>Sicherheit</h3><p>{product.safetyInformation || "Für dieses Produkt sind vor Veröffentlichung konkrete Warn- und Sicherheitsinformationen zu hinterlegen."}</p></div><div><h3>Preistransparenz</h3>{product.lowestPrice30Days ? <p>Niedrigster Gesamtpreis der letzten 30 Tage: {product.lowestPrice30Days}</p> : <p>Aktuell keine beworbene Preisermäßigung.</p>}</div></div></section>
      ) : (
        <section className="compliance-panel"><h2>Digitale Produktinformationen</h2><div className="compliance-grid"><div><h3>Datei & Bereitstellung</h3><p>{product.fileDetails || "Dateiformat und Größe vor Veröffentlichung ergänzen."}</p></div><div><h3>Kompatibilität</h3><p>{product.systemRequirements || "Systemanforderungen vor Veröffentlichung ergänzen."}</p></div><div><h3>Lizenz</h3><p>{product.license || "Nutzungsrechte vor Veröffentlichung ergänzen."}</p></div></div></section>
      )}
      <section className="recommendations"><div className="section-heading"><div><p className="eyebrow">Weiterdenken</p><h2>Passt dazu.</h2></div></div><div className="product-grid">{recommendations.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
    </>
  );
}
