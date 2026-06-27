import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/guard";
import { getUserById, adminUpdateUser, listHoldings, referralsFor } from "@/lib/user-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    const holdings = user.role === "investor" ? await listHoldings(user.id) : [];
    const referrals = user.role === "partner" ? await referralsFor(user.referralCode) : [];
    return NextResponse.json({ ok: true, user, holdings, referrals });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  try {
    const user = await adminUpdateUser(id, {
      commission: typeof body?.commission === "number" ? body.commission : undefined,
      status: typeof body?.status === "string" ? body.status : undefined,
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
