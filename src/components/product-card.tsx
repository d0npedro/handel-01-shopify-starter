import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { productKindLabels } from "@/lib/demo-products";
import type { Product } from "@/lib/types";
import { ProductArt } from "@/components/product-art";

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  if (!variant) return null;
  return (
    <article className="product-card">
      <Link href={`/produkt/${product.handle}`} className="product-card__visual" aria-label={`${product.title} ansehen`}>
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.altText}
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="product-card__image"
          />
        ) : (
          <ProductArt kind={product.kind} compact />
        )}
        <span className="product-card__kind">{productKindLabels[product.kind]}</span>
      </Link>
      <div className="product-card__body">
        <div>
          <h3><Link href={`/produkt/${product.handle}`}>{product.title}</Link></h3>
          <p>{product.shortDescription}</p>
        </div>
        <div className="product-card__price-row">
          <div className="price-stack">
            <strong>{formatMoney(variant.price)}</strong>
            {variant.compareAtPrice ? <del>{formatMoney(variant.compareAtPrice)}</del> : null}
          </div>
          <span className="arrow-link" aria-hidden="true">↗</span>
        </div>
        <p className="tax-note">
          inkl. MwSt. {variant.requiresShipping ? <><Link href="/versand-zahlung">zzgl. Versand</Link></> : "· kein Versand"}
          {product.unitPrice ? ` · ${product.unitPrice}` : ""}
        </p>
        {variant.compareAtPrice && product.lowestPrice30Days ? <p className="fine-print">Niedrigster Gesamtpreis der letzten 30 Tage: {product.lowestPrice30Days}</p> : null}
      </div>
    </article>
  );
}
