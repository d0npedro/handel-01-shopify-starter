import Link from "next/link";
export default function NotFound() { return <section className="not-found"><span>404</span><div><p className="eyebrow">Nicht im System</p><h1>Diese Seite ist<br />weitergezogen.</h1><Link className="button button--primary" href="/">Zur Startseite</Link></div></section>; }
