import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Warenkorb", robots: { index: false, follow: false } };
export default function WarenkorbPage() { return <CartPage demo={storeConfig.mode === "demo"} />; }
