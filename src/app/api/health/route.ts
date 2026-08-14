import { NextResponse } from "next/server";
import { preproductionReadiness, preproductionReady, readiness, storeConfig } from "@/lib/config";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      mode: storeConfig.mode,
      preproduction: { ready: preproductionReady, checks: preproductionReadiness },
      production: { ready: Object.values(readiness).every(Boolean), checks: readiness },
      checks: readiness,
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
