import { NextRequest, NextResponse } from "next/server";
import { verifyUserSession, updateBank, USER_SESSION_COOKIE } from "@/lib/user-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sess = verifyUserSession(req.cookies.get(USER_SESSION_COOKIE)?.value);
  if (!sess) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  try {
    const bank = await updateBank(sess.uid, {
      accountName: body?.accountName,
      accountNumber: body?.accountNumber,
      ifsc: body?.ifsc,
      bankName: body?.bankName,
      upi: body?.upi,
    });
    return NextResponse.json({ ok: true, bank });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
