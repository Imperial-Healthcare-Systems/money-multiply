import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase-admin";

/* ============================================================
   Admin auth — server side
   - Passcode hash stored in Supabase table `mm_admin_auth` (single row id=1)
   - Sessions are stateless HMAC-signed cookies (no DB round-trip)
   ============================================================ */

export const SESSION_COOKIE = "mm_admin_session";
const TABLE = "mm_admin_auth";
const DEFAULT_PASSCODE = process.env.ADMIN_INITIAL_PASSCODE || "MM@2026";
const BCRYPT_ROUNDS = 10;

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short (set a long random string in .env.local)");
  }
  return s;
}

/* ---------- sessions (stateless, signed) ---------- */
export function signSession(maxAgeSec: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + maxAgeSec * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return payload + "." + sig;
}

export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  let expected: string;
  try {
    expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/* ---------- passcode store ---------- */
async function getOrSeedHash(): Promise<string> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from(TABLE).select("password_hash").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (data?.password_hash) return data.password_hash as string;
  // first run — seed from the initial passcode
  const hash = await bcrypt.hash(DEFAULT_PASSCODE, BCRYPT_ROUNDS);
  const { error: seedErr } = await sb
    .from(TABLE)
    .upsert({ id: 1, password_hash: hash, updated_at: new Date().toISOString() });
  if (seedErr) throw seedErr;
  return hash;
}

export async function verifyPasscode(passcode: string): Promise<boolean> {
  if (!passcode) return false;
  const hash = await getOrSeedHash();
  return bcrypt.compare(passcode, hash);
}

export async function setPasscode(passcode: string): Promise<void> {
  const sb = supabaseAdmin();
  const hash = await bcrypt.hash(passcode, BCRYPT_ROUNDS);
  const { error } = await sb
    .from(TABLE)
    .upsert({ id: 1, password_hash: hash, updated_at: new Date().toISOString() });
  if (error) throw error;
}
