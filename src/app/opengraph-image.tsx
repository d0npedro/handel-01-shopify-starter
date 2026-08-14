import { ImageResponse } from "next/og";
import { storeConfig } from "@/lib/config";

export const alt = `${storeConfig.name} — modularer Shopify Shop`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f1e8", color: "#11110f", padding: 64, fontFamily: "Arial, sans-serif", position: "relative" }}><div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4 }}><span>{storeConfig.name}</span><span>SHOPIFY / DE</span></div><div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 700, lineHeight: 0.92, letterSpacing: -5 }}><span>VERKAUFEN,</span><span>OHNE NEU</span><span>ANZUFANGEN.</span></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26 }}><span>PHYSISCH + DIGITAL</span><span style={{ background: "#ff5b35", padding: "18px 28px", borderRadius: 999 }}>SYSTEM 01 ↗</span></div></div></div>, size);
}
