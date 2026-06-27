import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase-admin";
import type { AppUser, Holding, UserRole } from "./types";

const USERS = "mm_users";
const HOLDINGS = "mm_holdings";
const ROUNDS = 10;
export const USER_SESSION_COOKIE = "mm_user_session";

/* eslint-disable @typescript-eslint/no-explicit-any */
function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET missing");
  return s;
}

/* ---------- sessions (signed, carry uid + role) ---------- */
export function signUserSession(uid: string, role: UserRole, maxAgeSec: number): string {
  const payload = Buffer.from(JSON.stringify({ uid, role, exp: Date.now() + maxAgeSec * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return payload + "." + sig;
}

export function verifyUserSession(token: string | undefined | null): { uid: string; role: UserRole } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  let expected: string;
  try {
    expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  } catch {
    return null;
  }
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const o = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof o.exp !== "number" || o.exp <= Date.now()) return null;
    return { uid: o.uid, role: o.role };
  } catch {
    return null;
  }
}

/* ---------- mapping ---------- */
function rowToUser(r: any): AppUser {
  return {
    id: r.id,
    role: r.role,
    name: r.name || "",
    email: r.email,
    phone: r.phone || "",
    referralCode: r.referral_code || "",
    referredBy: r.referred_by || "",
    commission: Number(r.commission) || 0,
    status: r.status || "active",
    saved: Array.isArray(r.saved) ? r.saved : [],
    createdAt: r.created_at,
  };
}
function rowToHolding(r: any): Holding {
  return {
    id: r.id,
    userId: r.user_id,
    listingId: r.listing_id || "",
    title: r.title || "",
    tokens: Number(r.tokens) || 0,
    amount: Number(r.amount) || 0,
    status: r.status || "reserved",
    createdAt: r.created_at,
  };
}
const sb = () => supabaseAdmin();
const fail = (e: any): never => {
  throw new Error(e?.message || JSON.stringify(e));
};
function genReferral(): string {
  return "MM-" + crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
}

/* ---------- accounts ---------- */
export async function createUser(input: {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  referredBy?: string;
}): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const { data: existing } = await sb().from(USERS).select("id").eq("email", email).maybeSingle();
  if (existing) throw new Error("email_taken");
  const row = {
    id: "usr-" + Date.now().toString(36) + crypto.randomBytes(3).toString("hex"),
    role: input.role,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    password_hash: await bcrypt.hash(input.password, ROUNDS),
    referral_code: input.role === "partner" ? genReferral() : "",
    referred_by: (input.referredBy || "").trim(),
    commission: 0,
    status: "active",
    saved: [] as string[],
  };
  const { data, error } = await sb().from(USERS).insert(row).select().single();
  if (error) fail(error);
  return rowToUser(data);
}

export async function authenticate(email: string, password: string): Promise<AppUser | null> {
  const { data, error } = await sb().from(USERS).select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (error) fail(error);
  if (!data) return null;
  const ok = await bcrypt.compare(password, data.password_hash);
  return ok ? rowToUser(data) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await sb().from(USERS).select("*").eq("id", id).maybeSingle();
  if (error) fail(error);
  return data ? rowToUser(data) : null;
}

export async function updateProfile(id: string, patch: { name?: string; phone?: string }): Promise<AppUser> {
  const upd: any = {};
  if (typeof patch.name === "string") upd.name = patch.name.trim();
  if (typeof patch.phone === "string") upd.phone = patch.phone.trim();
  const { data, error } = await sb().from(USERS).update(upd).eq("id", id).select().single();
  if (error) fail(error);
  return rowToUser(data);
}

export async function toggleSaved(id: string, listingId: string): Promise<string[]> {
  const u = await getUserById(id);
  if (!u) throw new Error("not_found");
  const set = new Set(u.saved);
  if (set.has(listingId)) set.delete(listingId);
  else set.add(listingId);
  const saved = Array.from(set);
  const { error } = await sb().from(USERS).update({ saved }).eq("id", id);
  if (error) fail(error);
  return saved;
}

/* ---------- referrals / holdings ---------- */
export async function referralsFor(code: string): Promise<AppUser[]> {
  if (!code) return [];
  const { data, error } = await sb().from(USERS).select("*").eq("referred_by", code).order("created_at", { ascending: false });
  if (error) fail(error);
  return (data || []).map(rowToUser);
}

export async function listHoldings(userId: string): Promise<Holding[]> {
  const { data, error } = await sb().from(HOLDINGS).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) fail(error);
  return (data || []).map(rowToHolding);
}

/* ---------- admin ---------- */
export async function listUsers(): Promise<AppUser[]> {
  const { data, error } = await sb().from(USERS).select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) fail(error);
  return (data || []).map(rowToUser);
}

export async function adminUpdateUser(id: string, patch: { commission?: number; status?: string }): Promise<AppUser> {
  const upd: any = {};
  if (typeof patch.commission === "number") upd.commission = Math.round(patch.commission);
  if (typeof patch.status === "string") upd.status = patch.status;
  const { data, error } = await sb().from(USERS).update(upd).eq("id", id).select().single();
  if (error) fail(error);
  return rowToUser(data);
}

export async function addHolding(input: {
  userId: string;
  listingId?: string;
  title: string;
  tokens: number;
  amount: number;
  status?: string;
}): Promise<Holding> {
  const row = {
    id: "hld-" + Date.now().toString(36) + crypto.randomBytes(2).toString("hex"),
    user_id: input.userId,
    listing_id: input.listingId || "",
    title: input.title,
    tokens: input.tokens,
    amount: input.amount,
    status: input.status || "reserved",
  };
  const { data, error } = await sb().from(HOLDINGS).insert(row).select().single();
  if (error) fail(error);
  return rowToHolding(data);
}

export async function deleteHolding(id: string): Promise<void> {
  const { error } = await sb().from(HOLDINGS).delete().eq("id", id);
  if (error) fail(error);
}
