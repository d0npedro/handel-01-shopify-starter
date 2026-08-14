import type { ProductKind } from "@/lib/types";

export function ProductArt({ kind, compact = false }: { kind: ProductKind; compact?: boolean }) {
  return (
    <div className={`product-art product-art--${kind}${compact ? " product-art--compact" : ""}`} aria-hidden="true">
      <div className="product-art__grid" />
      {kind === "physical" ? (
        <>
          <span className="art-plate art-plate--one" />
          <span className="art-plate art-plate--two" />
          <span className="art-orb" />
        </>
      ) : null}
      {kind === "script" ? (
        <div className="art-code"><span>deploy.check</span><span>{"{ ready: true }"}</span><i /></div>
      ) : null}
      {kind === "music" ? (
        <div className="art-wave">{Array.from({ length: 19 }, (_, index) => <i key={index} />)}</div>
      ) : null}
      {kind === "software" ? (
        <div className="art-window"><span /><div><i /><i /><i /><i /></div></div>
      ) : null}
      <span className="product-art__index">0{kind === "physical" ? 1 : kind === "script" ? 2 : kind === "music" ? 3 : 4}</span>
    </div>
  );
}
