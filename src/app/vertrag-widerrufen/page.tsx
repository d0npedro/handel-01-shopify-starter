import type { Metadata } from "next";
import { RevocationForm } from "@/components/revocation-form";
import { readiness } from "@/lib/config";

export const metadata: Metadata = { title: "Vertrag widerrufen", robots: { index: false, follow: true } };
export default function RevokeContractPage() {
  return <div className="revocation-page"><header><p className="eyebrow">Elektronischer Widerruf</p><h1>Vertrag<br /><em>widerrufen.</em></h1><p>Hier kannst du deinen Widerruf in zwei klaren Schritten übermitteln. Eine Begründung ist nicht nötig.</p></header><RevocationForm enabled={readiness.revocationEmail} /></div>;
}
