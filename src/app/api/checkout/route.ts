import { NextResponse } from "next/server";
import { assertCheckoutReady, storeConfig } from "@/lib/config";
import { createCheckout, getCheckoutVariants } from "@/lib/shopify";
import { isJsonRequest, sameOrigin } from "@/lib/validation";

type RequestBody = {
  lines?: Array<{ merchandiseId?: unknown; quantity?: unknown }>;
  consent?: {
    termsAccepted?: unknown;
    digitalSupplyConsent?: unknown;
    digitalWithdrawalAcknowledged?: unknown;
  };
};

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Ungültiger Anfrageursprung." }, { status: 403 });
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Erwartet wird eine begrenzte JSON-Anfrage." }, { status: 415 });
  try {
    assertCheckoutReady();
    const body = (await request.json()) as RequestBody;
    if (!Array.isArray(body.lines) || body.lines.length < 1 || body.lines.length > 25) {
      return NextResponse.json({ error: "Der Warenkorb ist leer oder zu groß." }, { status: 400 });
    }
    const requested = body.lines.map((line) => ({
      merchandiseId: typeof line.merchandiseId === "string" ? line.merchandiseId : "",
      quantity: typeof line.quantity === "number" ? Math.floor(line.quantity) : 0,
    }));
    if (requested.some((line) => !line.merchandiseId.startsWith("gid://shopify/ProductVariant/") || line.quantity < 1 || line.quantity > 10)) {
      return NextResponse.json({ error: "Mindestens eine Warenkorbposition ist ungültig." }, { status: 400 });
    }

    const buyerIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const checkoutVariants = await getCheckoutVariants(requested.map((line) => line.merchandiseId), buyerIp);
    const variants = new Map(checkoutVariants.map((variant) => [variant.id, variant]));
    const resolved = requested.map((line) => ({ ...line, match: variants.get(line.merchandiseId) }));
    if (resolved.some((line) => !line.match?.availableForSale)) {
      return NextResponse.json({ error: "Ein Produkt ist nicht mehr verfügbar. Bitte Warenkorb aktualisieren." }, { status: 409 });
    }
    if (resolved.some((line) => line.match?.productHandle !== storeConfig.singleProductHandle)) {
      return NextResponse.json({ error: "Dieser Checkout akzeptiert ausschließlich den angebotenen Artikel." }, { status: 400 });
    }

    const consent = body.consent;
    const hasDigital = resolved.some((line) => line.match?.kind !== "physical");
    const hasPhysical = resolved.some((line) => line.match?.requiresShipping || line.match?.kind === "physical");
    assertCheckoutReady({ requiresPhysical: hasPhysical });
    if (consent?.termsAccepted !== true) return NextResponse.json({ error: "Bitte AGB und Widerrufsbelehrung bestätigen." }, { status: 400 });
    if (hasDigital && (consent.digitalSupplyConsent !== true || consent.digitalWithdrawalAcknowledged !== true)) {
      return NextResponse.json({ error: "Für digitale Inhalte fehlen die beiden ausdrücklichen Zustimmungen." }, { status: 400 });
    }

    const cart = await createCheckout(
      requested,
      {
        terms: true,
        digitalSupply: consent.digitalSupplyConsent === true,
        digitalWithdrawal: consent.digitalWithdrawalAcknowledged === true,
        recordedAt: new Date().toISOString(),
      },
      buyerIp,
    );
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout ist derzeit nicht verfügbar.";
    return NextResponse.json({ error: message }, { status: message.startsWith("Checkout ist noch nicht") ? 503 : 502, headers: { "Cache-Control": "no-store" } });
  }
}
