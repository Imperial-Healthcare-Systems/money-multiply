/* ===== Admin auth + OTP reset (backend-ready, offline-preview demo) =====
   While AUTH_API.base is "", the flow simulates the network round-trip and
   surfaces the OTP on screen so the UI can be tested without a server.
   Set AUTH_API.base to a real origin to switch to live mode. */

import { ADMIN_PASS_DEFAULT } from "./data";

export const AUTH_API = { base: "" };

const PASSKEY = "mm_admin_pass";
const SESSKEY = "mm_admin_sess";

export function getAdminPass(): string {
  try {
    const p = localStorage.getItem(PASSKEY);
    if (p) return p;
  } catch {}
  return ADMIN_PASS_DEFAULT;
}

export function setAdminPass(p: string): void {
  try {
    localStorage.setItem(PASSKEY, p);
  } catch {}
}

export function readSession(): boolean {
  try {
    const s = localStorage.getItem(SESSKEY);
    if (s) {
      const o = JSON.parse(s);
      if (o && o.until && o.until > Date.now()) return true;
    }
  } catch {}
  return false;
}

export function writeSession(days: number): void {
  try {
    localStorage.setItem(
      SESSKEY,
      JSON.stringify({ until: Date.now() + 1000 * 60 * 60 * 24 * days })
    );
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSKEY);
  } catch {}
}

export function maskEmail(e: string): string {
  const i = e.indexOf("@");
  if (i < 1) return e;
  return e.slice(0, 2) + "***" + e.slice(i);
}

interface OtpResult {
  ok: boolean;
  sentTo?: string;
  preview?: string;
  error?: string;
}

let _otpPreview: string | null = null;

export function apiRequestOtp(email: string): Promise<OtpResult> {
  if (AUTH_API.base) {
    return fetch(AUTH_API.base.replace(/\/$/, "") + "/admin/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());
  }
  _otpPreview = "" + Math.floor(100000 + Math.random() * 900000);
  return new Promise((res) =>
    setTimeout(() => res({ ok: true, sentTo: maskEmail(email), preview: _otpPreview! }), 700)
  );
}

export function apiVerifyOtp(email: string, otp: string, newPass: string): Promise<OtpResult> {
  if (AUTH_API.base) {
    return fetch(AUTH_API.base.replace(/\/$/, "") + "/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPass }),
    }).then((r) => r.json());
  }
  return new Promise((res) =>
    setTimeout(() => {
      if (otp !== _otpPreview) {
        res({ ok: false, error: "invalid_or_expired" });
        return;
      }
      setAdminPass(newPass);
      _otpPreview = null;
      res({ ok: true });
    }, 650)
  );
}
