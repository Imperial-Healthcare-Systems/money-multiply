import { NextRequest, NextResponse } from "next/server";
import { verifyPasscode, signSession, SESSION_COOKIE } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let passcode = "";
  let remember = false;
  try {
    const body = await req.json();
    passcode = typeof body?.passcode === "string" ? body.passcode : "";
    remember = !!body?.remember;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!passcode) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  try {
    const ok = await verifyPasscode(passcode);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
    }
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 8; // 7 days vs 8 hours
    const token = signSession(maxAge);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "unconfigured", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
