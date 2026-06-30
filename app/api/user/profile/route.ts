import { NextRequest, NextResponse } from "next/server";
import { verifyUserSession, updateProfile, USER_SESSION_COOKIE } from "@/lib/user-server";

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
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "name" }, { status: 400 });
  try {
    const user = await updateProfile(sess.uid, { name, phone });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
