import { open, readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { validatePreproductionEnv } from "./verify-config.mjs";

const socialCardPath = "public/og.png";

export async function validatePreproductionFiles(root = new URL("../", import.meta.url)) {
  const errors = [];

  const socialCardUrl = new URL(socialCardPath, root);
  try {
    const metadata = await stat(socialCardUrl);
    if (metadata.size < 100_000) errors.push(`${socialCardPath} ist unerwartet klein.`);
    const handle = await open(socialCardUrl, "r");
    try {
      const signature = Buffer.alloc(8);
      await handle.read(signature, 0, 8, 0);
      if (!signature.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        errors.push(`${socialCardPath} ist kein gültiges PNG-Artefakt.`);
      }
    } finally {
      await handle.close();
    }
  } catch (error) {
    errors.push(`${socialCardPath} fehlt oder ist nicht lesbar: ${error instanceof Error ? error.message : String(error)}`);
  }

  const [catalog, goLive, landing, shopRoute, productRoute, aboutRoute] = await Promise.all([
    readFile(new URL("shopify/demo-products.csv", root), "utf8"),
    readFile(new URL("docs/GO_LIVE_DE.md", root), "utf8"),
    readFile(new URL("src/app/page.tsx", root), "utf8"),
    readFile(new URL("src/app/shop/page.tsx", root), "utf8"),
    readFile(new URL("src/app/produkt/[handle]/page.tsx", root), "utf8"),
    readFile(new URL("src/app/ueber/page.tsx", root), "utf8"),
  ]);
  if (!catalog.includes("modular-desk-kit")) errors.push("Demo-Katalog enthält den konfigurierten Standardartikel nicht.");
  if (!landing.includes("getPrimaryProduct") || landing.includes("getProducts()")) errors.push("Landingpage ist nicht strikt auf den Primärartikel begrenzt.");
  if (!shopRoute.includes('redirect("/")')) errors.push("Legacy-Shoproute leitet nicht auf die Ein-Produkt-Landingpage um.");
  if (!productRoute.includes('permanentRedirect("/")')) errors.push("Legacy-Produktdetailroute leitet nicht kanonisch auf die Landingpage um.");
  if (!aboutRoute.includes('permanentRedirect("/")')) errors.push("Legacy-Systemroute widerspricht der fokussierten Landingpage.");
  if (!goLive.includes("SHOP_MODE=live")) errors.push("Go-live-Runbook dokumentiert das Live-Gate nicht.");

  return { errors, ok: errors.length === 0 };
}

async function main() {
  const envResult = validatePreproductionEnv(process.env);
  const fileResult = await validatePreproductionFiles();
  for (const warning of envResult.warnings) console.warn(`WARN: ${warning}`);
  for (const error of [...envResult.errors, ...fileResult.errors]) console.error(`ERROR: ${error}`);
  if (!envResult.ok || !fileResult.ok) {
    console.error("Pre-Production-Gate: NICHT BESTANDEN");
    process.exitCode = 1;
    return;
  }
  console.log("Pre-Production-Gate: BESTANDEN");
  console.log("Demo-Modus, öffentliche Preview, Primärartikel, E-Mail-Transport und Social Preview sind vorbereitet.");
  console.log("Das Live-Gate bleibt separat und darf dadurch nicht umgangen werden.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
