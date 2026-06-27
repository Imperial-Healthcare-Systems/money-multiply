import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/guard";
import { createListing } from "@/lib/listings-server";
import type { Listing } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const l = (await req.json()) as Listing;
    if (!l?.id || !l?.title) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    const created = await createListing(l);
    return NextResponse.json({ ok: true, listing: created });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
