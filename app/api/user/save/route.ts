import { NextRequest, NextResponse } from "next/server";
import { verifyUserSession, toggleSaved, USER_SESSION_COOKIE } from "@/lib/user-server";

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
  const listingId = String(body?.listingId || "");
  if (!listingId) return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  try {
    const saved = await toggleSaved(sess.uid, listingId);
    return NextResponse.json({ ok: true, saved });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
