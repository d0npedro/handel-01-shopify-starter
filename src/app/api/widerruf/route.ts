import { NextResponse } from "next/server";
import { emailConfig, readiness, storeConfig } from "@/lib/config";
import { cleanSingleLine, cleanText, isEmail, isJsonRequest, sameOrigin } from "@/lib/validation";

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
  if (!isJsonRequest(request, 16_384)) return NextResponse.json({ error: "Erwartet wird eine begrenzte JSON-Anfrage." }, { status: 415 });
  if (!readiness.revocationEmail) return NextResponse.json({ error: "Die Widerrufszustellung ist noch nicht konfiguriert." }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const company = cleanSingleLine(body.company, 120);
    const name = cleanSingleLine(body.name, 120);
    const email = cleanSingleLine(body.email, 254).toLowerCase();
    const orderNumber = cleanSingleLine(body.orderNumber, 80);
    const requestedScope = cleanSingleLine(body.scope, 160);
    const scope = requestedScope === "Teil des Vertrags (unten beschreiben)" ? requestedScope : "gesamter Vertrag";
    const note = cleanText(body.note, 1000);
    if (company) return NextResponse.json({ reference: "angenommen", receivedAt: new Date().toISOString(), confirmationText: "" });
    if (!name || !isEmail(email) || !orderNumber) return NextResponse.json({ error: "Name, E-Mail oder Vertragsangabe ist ungültig." }, { status: 400 });
    if (scope.startsWith("Teil") && !note) return NextResponse.json({ error: "Der zu widerrufende Vertragsteil muss beschrieben werden." }, { status: 400 });

    const receivedAt = new Date();
    const reference = `W-${receivedAt.toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const confirmationText = [
      `Eingangsbestätigung Widerruf — ${storeConfig.name}`,
      `Referenz: ${reference}`,
      `Eingang: ${receivedAt.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "full", timeStyle: "long" })}`,
      "",
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Bestellnummer / Vertragsangabe: ${orderNumber}`,
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
