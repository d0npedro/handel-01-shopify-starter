"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product, ProductKind } from "@/lib/types";

const filters: Array<{ value: "all" | ProductKind | "digital"; label: string }> = [
  { value: "all", label: "Alle" },
  { value: "physical", label: "Physisch" },
  { value: "digital", label: "Digital" },
  { value: "script", label: "Skripte" },
  { value: "music", label: "Musik" },
  { value: "software", label: "Software" },
];

export function FilterGrid({ products, initialFilter = "all" }: { products: Product[]; initialFilter?: string }) {
  const validInitial = filters.some((item) => item.value === initialFilter) ? initialFilter : "all";
  const [filter, setFilter] = useState(validInitial);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visible = useMemo(
    () => products.filter((product) => {
      const kindMatches = filter === "all" || (filter === "digital" ? product.kind !== "physical" : product.kind === filter);
      const queryMatches = !deferredQuery || `${product.title} ${product.shortDescription} ${product.tags.join(" ")}`.toLowerCase().includes(deferredQuery);
      return kindMatches && queryMatches;
    }),
    [products, filter, deferredQuery],
  );

  return (
    <div>
      <div className="catalog-tools">
        <div className="filter-row" aria-label="Produkttyp filtern">
          {filters.map((item) => (
            <button key={item.value} className={filter === item.value ? "is-active" : ""} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="search-field"><span className="sr-only">Produkte suchen</span><input type="search" placeholder="SUCHEN" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </div>
      <p className="result-count" aria-live="polite">{visible.length.toString().padStart(2, "0")} PRODUKTE</p>
      {visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>Nichts gefunden.</h2><p>Ändere Filter oder Suchbegriff.</p></div>}
    </div>
  );
}
