import { NextResponse } from "next/server";
import { assertCheckoutReady } from "@/lib/config";
import { createCheckout, getProducts } from "@/lib/shopify";
import { sameOrigin } from "@/lib/validation";

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

    const catalog = await getProducts();
    const variants = new Map(catalog.flatMap((product) => product.variants.map((variant) => [variant.id, { product, variant }] as const)));
    const resolved = requested.map((line) => ({ ...line, match: variants.get(line.merchandiseId) }));
    if (resolved.some((line) => !line.match?.variant.availableForSale)) {
      return NextResponse.json({ error: "Ein Produkt ist nicht mehr verfügbar. Bitte Warenkorb aktualisieren." }, { status: 409 });
    }

    const consent = body.consent;
    const hasDigital = resolved.some((line) => line.match?.product.kind !== "physical");
    if (consent?.termsAccepted !== true) return NextResponse.json({ error: "Bitte AGB und Widerrufsbelehrung bestätigen." }, { status: 400 });
    if (hasDigital && (consent.digitalSupplyConsent !== true || consent.digitalWithdrawalAcknowledged !== true)) {
      return NextResponse.json({ error: "Für digitale Inhalte fehlen die beiden ausdrücklichen Zustimmungen." }, { status: 400 });
    }

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const cart = await createCheckout(
      requested,
      { terms: true, digitalSupply: consent.digitalSupplyConsent === true, digitalWithdrawal: consent.digitalWithdrawalAcknowledged === true },
      forwarded,
    );
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout ist derzeit nicht verfügbar.";
    return NextResponse.json({ error: message }, { status: message.startsWith("Checkout ist noch nicht") ? 503 : 502, headers: { "Cache-Control": "no-store" } });
  }
}
