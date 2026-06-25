import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;
  try {
    authenticated = verifySession(token);
  } catch {
    authenticated = false;
  }
  return NextResponse.json({ authenticated });
}
