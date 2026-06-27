import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/guard";
import { addHolding } from "@/lib/user-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  try {
    const holding = await addHolding({
      userId: id,
      listingId: String(body?.listingId || ""),
      title: String(body?.title || "Reservation"),
      tokens: Number(body?.tokens) || 0,
      amount: Number(body?.amount) || 0,
      status: typeof body?.status === "string" ? body.status : "reserved",
    });
    return NextResponse.json({ ok: true, holding });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
