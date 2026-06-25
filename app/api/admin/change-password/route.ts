import { NextRequest, NextResponse } from "next/server";
import { verifySession, verifyPasscode, setPasscode, SESSION_COOKIE } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // must be logged in
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let authed = false;
  try {
    authed = verifySession(token);
  } catch {
    authed = false;
  }
  if (!authed) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let current = "";
  let next = "";
  try {
    const body = await req.json();
    current = typeof body?.current === "string" ? body.current : "";
    next = typeof body?.next === "string" ? body.next : "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (next.length < 6) {
    return NextResponse.json({ ok: false, error: "weak" }, { status: 400 });
  }

  try {
    const ok = await verifyPasscode(current);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "bad_current" }, { status: 401 });
    }
    await setPasscode(next);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "unconfigured", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
