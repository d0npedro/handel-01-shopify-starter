import type { Product, ProductKind } from "@/lib/types";

function variant(handle: string, amount: string, requiresShipping: boolean, compareAt?: string) {
  return {
    id: `demo:${handle}`,
    title: "Standard",
    availableForSale: true,
    requiresShipping,
    price: { amount, currencyCode: "EUR" },
    compareAtPrice: compareAt ? { amount: compareAt, currencyCode: "EUR" } : undefined,
    selectedOptions: [{ name: "Ausführung", value: "Standard" }],
  };
}

const demoManufacturer = {
  name: "HANDEL/01 Demo Manufaktur",
  address: "Musterstraße 1, 10115 Berlin, Deutschland",
  email: "produktsicherheit@example.com",
};

export const productKindLabels: Record<ProductKind, string> = {
  physical: "Physisch",
  script: "Skript",
  music: "Musik",
  software: "Software",
};

export const demoProducts: Product[] = [
  {
    id: "demo-product-modular-desk-kit",
    handle: "modular-desk-kit",
    title: "Modular Desk Kit",
    description:
      "Ein reparierbares Schreibtisch-Set aus pulverbeschichtetem Stahl und Kork: Ablage, Kabelhalter und zwei frei positionierbare Module. Die Demo zeigt Versand, Lieferzeit, Hersteller- und Sicherheitsangaben für physische Waren.",
    shortDescription: "Drei analoge Module für einen ruhigen, aufgeräumten Arbeitsplatz.",
    kind: "physical",
    vendor: "HANDEL/01",
    tags: ["Demo", "Physisch", "GPSR"],
    variants: [variant("modular-desk-kit", "79.00", true, "99.00")],
    deliveryNote: "Lieferzeit 2–4 Werktage innerhalb Deutschlands",
    lowestPrice30Days: "89,00 €",
    highlights: ["Pulverbeschichteter Stahl", "Rutschfester Kork", "Plastikarm verpackt"],
    manufacturer: demoManufacturer,
    safetyInformation: "Kein Spielzeug. Kleine Magnete von Kindern und medizinischen Implantaten fernhalten.",
  },
  {
    id: "demo-product-launch-automation",
    handle: "launch-automation-script",
    title: "Launch Automation Script",
    description:
      "Ein dokumentiertes TypeScript-Skript, das Releases prüft, Artefakte bündelt und eine nachvollziehbare Checkliste erzeugt. Enthält Quellcode, Konfigurationsbeispiele und eine kommerzielle Einzelplatzlizenz.",
    shortDescription: "Release-Abläufe prüfen, bündeln und reproduzierbar dokumentieren.",
    kind: "script",
    vendor: "HANDEL/01 Lab",
    tags: ["Demo", "Digital", "TypeScript"],
    variants: [variant("launch-automation-script", "29.00", false)],
    deliveryNote: "Download-Link per E-Mail unmittelbar nach Zahlung",
    highlights: ["Vollständiger Quellcode", "Konfigurierbare Checks", "Beispielprojekt inklusive"],
    license: "Kommerzielle Einzelplatzlizenz; Weiterverkauf und öffentliche Weitergabe ausgeschlossen.",
    fileDetails: "ZIP, ca. 1,8 MB; TypeScript-, JSON- und Markdown-Dateien; kein DRM.",
    systemRequirements: "Node.js 20 oder neuer; Windows, macOS oder Linux; Terminal-Grundkenntnisse.",
  },
  {
    id: "demo-product-synthetic-horizons",
    handle: "synthetic-horizons-music-pack",
    title: "Synthetic Horizons",
    description:
      "Zwölf KI-generierte, redaktionell kuratierte Musikstücke für Social Video, Podcasts und Produktfilme. Die Lizenz deckt veröffentlichte Kundenprojekte ab; Rohdateien dürfen nicht als eigenes Sample-Pack weiterverkauft werden.",
    shortDescription: "12 lizenzierte WAV-Tracks für Film, Podcast und Social Content.",
    kind: "music",
    vendor: "HANDEL/01 Audio",
    tags: ["Demo", "Digital", "KI-generiert", "Musik"],
    variants: [variant("synthetic-horizons-music-pack", "39.00", false)],
    deliveryNote: "Download-Link per E-Mail unmittelbar nach Zahlung",
    highlights: ["12 WAV-Master", "48 kHz / 24 Bit", "Projektlizenz für kommerzielle Inhalte"],
    license: "Zeitlich und räumlich unbeschränkte Nutzung in eigenen Endprodukten; keine isolierte Weitergabe.",
    fileDetails: "ZIP, ca. 1,2 GB; 12 WAV-Dateien, 48 kHz/24 Bit; kein DRM.",
    systemRequirements: "Wiedergabe- oder Schnittsoftware mit WAV-Unterstützung; ca. 1,5 GB freier Speicher.",
  },
  {
    id: "demo-product-focusboard",
    handle: "focusboard-desktop",
    title: "Focusboard Desktop",
    description:
      "Eine lokale Desktop-App für visuelle Projektplanung. Die Demo bildet Software-spezifische Pflichtinformationen ab: Funktionsumfang, Betriebssysteme, Dateigröße, Lizenz, Updates und Kompatibilität.",
    shortDescription: "Visuelle Projektplanung ohne Account, Cloud-Zwang oder Abo.",
    kind: "software",
    vendor: "HANDEL/01 Software",
    tags: ["Demo", "Digital", "Software"],
    variants: [variant("focusboard-desktop", "59.00", false)],
    deliveryNote: "Lizenzschlüssel und Download-Link unmittelbar nach Zahlung",
    highlights: ["Einmalkauf statt Abo", "Lokale Datenspeicherung", "12 Monate Funktionsupdates"],
    license: "Unbefristete Lizenz für eine Person auf bis zu drei eigenen Geräten.",
    fileDetails: "Signierte Installer, 145–190 MB; Lizenzschlüssel; kein dauerhaftes Online-DRM.",
    systemRequirements: "Windows 11 (x64) oder macOS 14+ (Apple Silicon/Intel); 4 GB RAM; 500 MB Speicher.",
  },
];
