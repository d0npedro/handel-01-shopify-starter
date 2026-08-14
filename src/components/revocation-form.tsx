"use client";

import { FormEvent, useState } from "react";

type Fields = { name: string; email: string; orderNumber: string; scope: string; note: string; company: string };
type Result = { reference: string; receivedAt: string; confirmationText: string };

const initial: Fields = { name: "", email: "", orderNumber: "", scope: "gesamter Vertrag", note: "", company: "" };

export function RevocationForm({ enabled }: { enabled: boolean }) {
  const [fields, setFields] = useState(initial);
  const [step, setStep] = useState<"form" | "review" | "sending" | "done">("form");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function review(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!fields.name || !fields.email || !fields.orderNumber) {
      setError("Bitte Name, E-Mail-Adresse und eine Vertragsangabe vollständig angeben.");
      return;
    }
    if (fields.scope.startsWith("Teil") && !fields.note.trim()) {
      setError("Bitte beschreibe im Hinweis, welchen Teil des Vertrags du widerrufen möchtest.");
      return;
    }
    setStep("review");
  }

  async function confirm() {
    setStep("sending");
    setError("");
    try {
      const response = await fetch("/api/widerruf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(body.error || "Der Widerruf konnte nicht versendet werden.");
      setResult(body);
      setStep("done");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Der Widerruf konnte nicht versendet werden.");
      setStep("review");
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.confirmationText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `widerruf-${result.reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (step === "done" && result) {
    return (
      <section className="revocation-success" aria-live="polite">
        <span className="success-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">Eingang bestätigt</p>
        <h2>Dein Widerruf ist übermittelt.</h2>
        <dl><div><dt>Referenz</dt><dd>{result.reference}</dd></div><div><dt>Eingang</dt><dd>{new Date(result.receivedAt).toLocaleString("de-DE")}</dd></div></dl>
        <p>Eine Bestätigung wurde an <strong>{fields.email}</strong> gesendet. Bewahre sie auf.</p>
        <button className="button button--secondary" onClick={download}>Bestätigung herunterladen</button>
      </section>
    );
  }

  if (step === "review" || step === "sending") {
    return (
      <section className="revocation-review">
        <p className="eyebrow">Schritt 2 von 2</p>
        <h2>Angaben prüfen</h2>
        <dl>
          <div><dt>Name</dt><dd>{fields.name}</dd></div>
          <div><dt>E-Mail</dt><dd>{fields.email}</dd></div>
          <div><dt>Vertragsangabe</dt><dd>{fields.orderNumber}</dd></div>
          <div><dt>Umfang</dt><dd>{fields.scope}</dd></div>
          {fields.note ? <div><dt>Hinweis</dt><dd>{fields.note}</dd></div> : null}
        </dl>
        <p>Mit der folgenden Schaltfläche wird die Widerrufserklärung verbindlich an den Händler übermittelt.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-actions">
          <button className="button button--secondary" onClick={() => setStep("form")} disabled={step === "sending"}>Zurück</button>
          <button className="button button--primary" onClick={confirm} disabled={step === "sending" || !enabled}>{step === "sending" ? "Wird übermittelt …" : "Widerruf bestätigen"}</button>
        </div>
        {!enabled ? <p className="form-error">Die E-Mail-Zustellung ist im Demo-Modus noch nicht konfiguriert. Der Händler muss vor Go-live RESEND_API_KEY, Absender und Empfänger setzen.</p> : null}
      </section>
    );
  }

  return (
    <form className="revocation-form" onSubmit={review} noValidate>
      <div className="form-heading"><p className="eyebrow">Schritt 1 von 2</p><h2>Vertrag zuordnen</h2><p>Eine Begründung ist nicht erforderlich. Pflichtfelder sind mit * markiert.</p></div>
      <label>Vollständiger Name *<input autoComplete="name" value={fields.name} onChange={(event) => update("name", event.target.value)} required maxLength={120} /></label>
      <label>E-Mail für die Eingangsbestätigung *<input type="email" autoComplete="email" value={fields.email} onChange={(event) => update("email", event.target.value)} required maxLength={254} /></label>
      <label>Bestellnummer oder andere eindeutige Vertragsangabe *<input autoComplete="off" value={fields.orderNumber} onChange={(event) => update("orderNumber", event.target.value)} required maxLength={80} /></label>
      <label>Umfang des Widerrufs<select value={fields.scope} onChange={(event) => update("scope", event.target.value)}><option>gesamter Vertrag</option><option>Teil des Vertrags (unten beschreiben)</option></select></label>
      <label>Hinweis {fields.scope.startsWith("Teil") ? "*" : "(optional)"}<textarea value={fields.note} onChange={(event) => update("note", event.target.value)} required={fields.scope.startsWith("Teil")} maxLength={1000} rows={4} /></label>
      <label className="honey" aria-hidden="true">Firma<input tabIndex={-1} autoComplete="off" value={fields.company} onChange={(event) => update("company", event.target.value)} /></label>
      <p className="privacy-note">Die Angaben werden ausschließlich zur Bearbeitung des Widerrufs verarbeitet. Details stehen in der Datenschutzerklärung.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button button--primary" type="submit">Weiter zur Prüfung</button>
    </form>
  );
}
