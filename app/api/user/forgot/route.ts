import { NextRequest, NextResponse } from "next/server";
import { requestReset } from "@/lib/user-server";

export const runtime = "nodejs";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email || "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  try {
    await requestReset(email);
  } catch {
    // swallow — never reveal whether the account exists
  }
  // always succeed
  return NextResponse.json({ ok: true });
}
