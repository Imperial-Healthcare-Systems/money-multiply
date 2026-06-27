import { NextRequest, NextResponse } from "next/server";
import { authenticate, signUserSession, USER_SESSION_COOKIE } from "@/lib/user-server";

export const runtime = "nodejs";
const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  if (!email || !password)
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });

  try {
    const user = await authenticate(email, password);
    if (!user) return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
    const token = signUserSession(user.id, user.role, MAX_AGE);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(USER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
