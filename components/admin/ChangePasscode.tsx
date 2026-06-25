"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";

export default function ChangePasscode({ onBack }: { onBack: () => void }) {
  const { toast, closeModal } = useMarketplace();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const fail = (msg: string) => {
    setErr(msg);
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  const submit = async () => {
    if (loading) return;
    setErr("");
    if (!cur) return fail("Enter your current passcode.");
    if (next.length < 6) return fail("New passcode must be at least 6 characters.");
    if (next !== conf) return fail("New passcodes don’t match.");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: cur, next }),
      });
      const d = await r.json().catch(() => ({}));
      setLoading(false);
      if (r.ok && d.ok) {
        toast("Passcode updated");
        onBack();
        return;
      }
      if (d.error === "bad_current") fail("Current passcode is incorrect.");
      else if (d.error === "weak") fail("New passcode must be at least 6 characters.");
      else if (d.error === "unauthorized") fail("Session expired — please sign in again.");
      else if (d.error === "unconfigured") fail("Admin backend isn’t configured yet.");
      else fail("Couldn’t update passcode. Please try again.");
    } catch {
      setLoading(false);
      fail("Network error. Please try again.");
    }
  };

  return (
    <>
      <div className="mhead">
        <div>
          <h3>Change passcode</h3>
          <div className="sub">Update your admin sign-in passcode</div>
        </div>
        <button className="mclose" onClick={closeModal}>
          ×
        </button>
      </div>
      <div className="mbody">
        <div className={"gate" + (shake ? " shake" : "")} onAnimationEnd={() => setShake(false)} style={{ paddingTop: 0 }}>
          <div className="gate-field">
            <label>Current passcode</label>
            <div className="gate-input-wrap">
              <input type="password" autoComplete="current-password" placeholder="Current passcode" value={cur} onChange={(e) => setCur(e.target.value)} />
            </div>
          </div>
          <div className="gate-field">
            <label>New passcode</label>
            <div className="gate-input-wrap">
              <input type="password" autoComplete="new-password" placeholder="Min 6 characters" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
          </div>
          <div className="gate-field">
            <label>Confirm new passcode</label>
            <div className="gate-input-wrap">
              <input type="password" autoComplete="new-password" placeholder="Re-enter new passcode" value={conf} onChange={(e) => setConf(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>
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
          <button className={"btn-gold gate-btn" + (loading ? " loading" : "")} onClick={submit}>
            Update passcode
          </button>
          <button className="gate-forgot" type="button" onClick={onBack}>
            ← Back to console
          </button>
        </div>
      </div>
    </>
  );
}
