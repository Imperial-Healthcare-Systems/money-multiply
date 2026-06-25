"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";

export default function AdminGate() {
  const { login, toast, closeModal } = useMarketplace();
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const fail = (msg: string) => {
    setErr(msg);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  const attempt = async () => {
    if (loading) return;
    setErr("");
    if (!pass) {
      fail("Enter your admin passcode.");
      return;
    }
    setLoading(true);
    const res = await login(pass, remember);
    setLoading(false);
    if (res.ok) {
      toast("Welcome back, admin");
      return;
    }
    if (res.error === "invalid") fail("Incorrect passcode. Please try again.");
    else if (res.error === "unconfigured") fail("Admin backend isn’t configured yet. See .env.local setup.");
    else if (res.error === "network") fail("Network error. Please try again.");
    else fail("Couldn’t sign in. Please try again.");
    setPass("");
  };

  return (
    <>
      <div className="mhead">
        <div>
          <h3>Admin access</h3>
          <div className="sub">Secure marketplace console</div>
        </div>
        <button className="mclose" onClick={closeModal}>
          ×
        </button>
      </div>
      <div className="mbody">
        <div className={"gate" + (shake ? " shake" : "")} onAnimationEnd={() => setShake(false)}>
          <div className="gate-lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="10" width="16" height="11" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1.4" />
              <path d="M12 16.9V18" />
            </svg>
          </div>
          <h3>Console sign-in</h3>
          <div className="gate-sub">
            Enter your admin passcode to manage listings, view analytics and track incoming leads.
          </div>
          <div className="gate-field">
            <label>Admin passcode</label>
            <div className="gate-input-wrap">
              <svg className="gf-key" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="15" r="4" />
                <path d="m10.8 12.2 8.2-8.2M16 5l2 2M18.5 7.5 21 5" />
              </svg>
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••••"
                autoComplete="current-password"
                autoFocus
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  if (err) setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
              />
              <button
                className="gf-eye"
                type="button"
                aria-label={show ? "Hide passcode" : "Show passcode"}
                onClick={() => setShow((s) => !s)}
                style={{ color: show ? "var(--brass-lt)" : undefined }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <div className={"gate-err" + (err ? " on" : "")}>
              {err && (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h0" />
                  </svg>
                  {err}
                </>
              )}
            </div>
          </div>
          <label className="gate-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me signed in on this device
          </label>
          <button className={"btn-gold gate-btn" + (loading ? " loading" : "")} onClick={attempt}>
            Unlock console
          </button>
          <div className="gate-foot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Encrypted server session · passcode never stored in the browser
          </div>
        </div>
      </div>
    </>
  );
}
