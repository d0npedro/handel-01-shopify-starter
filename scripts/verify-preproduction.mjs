import { open, readFile, stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { validatePreproductionEnv } from "./verify-config.mjs";

const requiredAssets = [
  "public/demo-downloads/launch-automation-script-DEMO.zip",
  "public/demo-downloads/synthetic-horizons-DEMO.zip",
  "public/demo-downloads/focusboard-desktop-DEMO.zip",
];

const requiredProductTitles = ["Modular Desk Kit", "Launch Automation Script", "Synthetic Horizons", "Focusboard Desktop"];

export async function validatePreproductionFiles(root = new URL("../", import.meta.url)) {
  const errors = [];

  for (const relativePath of requiredAssets) {
    const url = new URL(relativePath, root);
    try {
      const metadata = await stat(url);
      if (metadata.size < 100) errors.push(`${relativePath} ist unerwartet klein.`);
      const handle = await open(url, "r");
      try {
        const signature = Buffer.alloc(4);
        await handle.read(signature, 0, 4, 0);
        if (!signature.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) errors.push(`${relativePath} ist kein gültiges ZIP-Artefakt.`);
      } finally {
        await handle.close();
      }
    } catch (error) {
      errors.push(`${relativePath} fehlt oder ist nicht lesbar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const [catalog, fulfillment, goLive] = await Promise.all([
    readFile(new URL("shopify/demo-products.csv", root), "utf8"),
    readFile(new URL("docs/DEMO_FULFILLMENT.md", root), "utf8"),
    readFile(new URL("docs/GO_LIVE_DE.md", root), "utf8"),
  ]);
  for (const title of requiredProductTitles) {
    if (!catalog.includes(title)) errors.push(`Demo-Katalog enthält ${title} nicht.`);
  }
  for (const title of requiredProductTitles.slice(1)) {
    if (!fulfillment.includes(title)) errors.push(`Fulfillment-Dokumentation enthält ${title} nicht.`);
  }
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
  console.log("Demo-Modus, öffentliche Preview, Shopify-Entwurf, E-Mail-Transport und Demo-Artefakte sind vorbereitet.");
  console.log("Das Live-Gate bleibt separat und darf dadurch nicht umgangen werden.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
