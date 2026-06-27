import "server-only";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "./auth-server";

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  try {
    return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}
