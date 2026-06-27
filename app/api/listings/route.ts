import { NextResponse } from "next/server";
import { getListings } from "@/lib/listings-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json({ ok: true, listings });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
