import { NextResponse } from "next/server";
import { readiness, storeConfig } from "@/lib/config";

export function GET() {
  return NextResponse.json({ ok: true, mode: storeConfig.mode, checks: readiness, timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
