import { NextRequest, NextResponse } from "next/server";
import {
  verifyUserSession,
  getUserById,
  listHoldings,
  referralsFor,
  USER_SESSION_COOKIE,
} from "@/lib/user-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sess = verifyUserSession(req.cookies.get(USER_SESSION_COOKIE)?.value);
  if (!sess) return NextResponse.json({ ok: true, user: null });
  try {
    const user = await getUserById(sess.uid);
    if (!user) return NextResponse.json({ ok: true, user: null });
    if (user.role === "investor") {
      const holdings = await listHoldings(user.id);
      return NextResponse.json({ ok: true, user, holdings });
    }
    const referrals = await referralsFor(user.referralCode);
    return NextResponse.json({
      ok: true,
      user,
      referrals: referrals.map((r) => ({ name: r.name, email: r.email, role: r.role, createdAt: r.createdAt })),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
