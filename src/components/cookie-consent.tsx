"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE = "handel01_consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const shouldOpen = !document.cookie.split("; ").some((item) => item.startsWith(`${COOKIE}=`));
    queueMicrotask(() => setOpen(shouldOpen));
    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-open-consent]")) setOpen(true);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  function save(analytics: boolean) {
    const payload = encodeURIComponent(JSON.stringify({ necessary: true, analytics, version: 1 }));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${payload}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
    window.dispatchEvent(new CustomEvent("handel01:consent", { detail: { analytics } }));
    setOpen(false);
  }

  if (!open) return null;
  return (
    <section className="consent" aria-labelledby="consent-title" role="dialog" aria-modal="true">
      <div>
        <p className="eyebrow">Deine Entscheidung</p>
        <h2 id="consent-title">Cookies, klar geregelt.</h2>
        <p>Notwendige Cookies halten Warenkorb und Einstellungen funktionsfähig. Optionale Analyse startet erst nach deiner Zustimmung. In diesem Starter ist standardmäßig kein Analyse-Dienst aktiv.</p>
        {details ? (
          <div className="consent-details">
            <p><strong>Notwendig · immer aktiv</strong><br />Warenkorb, Sicherheit und Speichern dieser Auswahl.</p>
            <p><strong>Analyse · optional</strong><br />Reserviert für eine später angeschlossene, einwilligungsbasierte Reichweitenmessung.</p>
          </div>
        ) : null}
        <button className="link-button" onClick={() => setDetails((value) => !value)} aria-expanded={details}>
          {details ? "Details schließen" : "Details anzeigen"}
        </button>
        <Link href="/datenschutz">Datenschutzerklärung</Link>
      </div>
      <div className="consent-actions">
        <button className="button button--secondary" onClick={() => save(false)}>Nur notwendige</button>
        <button className="button button--primary" onClick={() => save(true)}>Alle akzeptieren</button>
      </div>
    </section>
  );
}
