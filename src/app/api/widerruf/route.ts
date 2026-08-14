import { NextResponse } from "next/server";
import { emailConfig, readiness, storeConfig } from "@/lib/config";
import { cleanText, isEmail, sameOrigin } from "@/lib/validation";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

async function sendEmail(to: string, subject: string, text: string, reference: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${emailConfig.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `${reference}:${to}` },
    body: JSON.stringify({ from: emailConfig.from, to: [to], subject, text, html: `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</div>` }),
  });
  if (!response.ok) throw new Error("E-Mail-Zustellung fehlgeschlagen.");
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });
  if (!readiness.revocationEmail) return NextResponse.json({ error: "Die Widerrufszustellung ist noch nicht konfiguriert." }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const company = cleanText(body.company, 120);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const orderNumber = cleanText(body.orderNumber, 80);
    const scope = cleanText(body.scope, 160) || "gesamter Vertrag";
    const note = cleanText(body.note, 1000);
    if (company) return NextResponse.json({ reference: "angenommen", receivedAt: new Date().toISOString(), confirmationText: "" });
    if (!name || !isEmail(email) || !orderNumber) return NextResponse.json({ error: "Name, E-Mail oder Bestellnummer ist ungültig." }, { status: 400 });

    const receivedAt = new Date();
    const reference = `W-${receivedAt.toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const confirmationText = [
      `Eingangsbestätigung Widerruf — ${storeConfig.name}`,
      `Referenz: ${reference}`,
      `Eingang: ${receivedAt.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "full", timeStyle: "long" })}`,
      "",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Bestellnummer: ${orderNumber}`,
      `Umfang: ${scope}`,
      note ? `Hinweis: ${note}` : "Hinweis: —",
      "",
      "Widerrufserklärung: Hiermit widerruft die oben genannte Person den bezeichneten Vertrag beziehungsweise Vertragsteil.",
      "",
      `Händler: ${storeConfig.merchant.name}, ${storeConfig.merchant.street}, ${storeConfig.merchant.postcode} ${storeConfig.merchant.city}`,
    ].join("\n");

    await Promise.all([
      sendEmail(emailConfig.merchant, `Widerruf ${reference} — Bestellung ${orderNumber}`, confirmationText, reference),
      sendEmail(email, `Eingangsbestätigung deines Widerrufs ${reference}`, confirmationText, reference),
    ]);
    return NextResponse.json({ reference, receivedAt: receivedAt.toISOString(), confirmationText }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Der Widerruf konnte nicht sicher zugestellt werden. Bitte per E-Mail oder Post widerrufen." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
