import { NextRequest, NextResponse } from "next/server";
import { createUser, signUserSession, USER_SESSION_COOKIE } from "@/lib/user-server";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const role = body?.role as UserRole;
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const phone = String(body?.phone || "").trim();
  const password = String(body?.password || "");
  const referredBy = String(body?.referredBy || "").trim();

  if (role !== "partner" && role !== "investor")
    return NextResponse.json({ ok: false, error: "bad_role" }, { status: 400 });
  if (!name) return NextResponse.json({ ok: false, error: "name" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  if (!phone) return NextResponse.json({ ok: false, error: "phone" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ ok: false, error: "weak" }, { status: 400 });

  try {
    const user = await createUser({ role, name, email, phone, password, referredBy });
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
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "email_taken")
      return NextResponse.json({ ok: false, error: "email_taken" }, { status: 409 });
    return NextResponse.json({ ok: false, error: "server", detail: msg }, { status: 503 });
  }
}
