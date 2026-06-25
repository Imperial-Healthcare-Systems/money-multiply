"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { waLink } from "@/lib/links";
import type { LeadSource } from "@/lib/types";

type Role = "partner" | "investor";
type TabT = "signup" | "login";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ROLES: Record<Role, { label: string; tagline: string; icon: React.ReactNode }> = {
  partner: {
    label: "Official Partner",
    tagline: "Earn commissions introducing investors to vetted, title-clear land assets.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </svg>
    ),
  },
  investor: {
    label: "Investor",
    tagline: "Own fractional, title-clear land from ₹5,00,000 and track your allocations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" />
      </svg>
    ),
  },
};

export default function AssociateModal() {
  const { modal, closeModal, captureLead, toast } = useMarketplace();
  const open = modal.type === "associate";

  const [role, setRole] = useState<Role | null>(null);
  const [tab, setTab] = useState<TabT>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMsg("");
    setErr("");
    setDone(false);
  };
  const pickRole = (r: Role) => {
    reset();
    setTab("signup");
    setRole(r);
  };
  const back = () => {
    reset();
    setRole(null);
  };

  const submit = () => {
    setErr("");
    if (tab === "signup" && !name.trim()) return setErr("Please enter your name.");
    if (!EMAIL_RE.test(email.trim())) return setErr("Please enter a valid email address.");
    if (!phone.trim()) return setErr("Please enter a phone number.");
    if (!role) return;

    const kind = tab === "signup" ? "Sign-up" : "Login";
    const roleLabel = ROLES[role].label;
    const detail =
      kind + " · " + email.trim() + " · " + phone.trim() + (msg.trim() ? " · " + msg.trim() : "");
    captureLead(role as LeadSource, name.trim() || email.trim(), detail);
    setDone(true);
    toast(roleLabel + " request received");
  };

  const waHandoff = () => {
    if (!role) return "#";
    const roleLabel = ROLES[role].label;
    return waLink(
      "Hello Money Multiply, I'd like to " +
        (tab === "signup" ? "join as " : "sign in as ") +
        "an *" +
        roleLabel +
        "*.\nName: " +
        (name.trim() || "—") +
        "\nEmail: " +
        email.trim() +
        "\nPhone: " +
        phone.trim() +
        (msg.trim() ? "\nNote: " + msg.trim() : "")
    );
  };

  return (
    <div className="modal open" id="associateModal">
      <div className="scrim" onClick={closeModal} />
      <div className="box" id="associateBox">
        {/* ---- chooser ---- */}
        {!role && (
          <>
            <div className="mhead">
              <div>
                <h3>Become an Associate</h3>
                <div className="sub">Choose how you’d like to join Money Multiply</div>
              </div>
              <button className="mclose" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="mbody">
              <div className="assoc-choose">
                {(Object.keys(ROLES) as Role[]).map((r) => (
                  <button className="assoc-card" key={r} onClick={() => pickRole(r)}>
                    <span className="ac-ic">{ROLES[r].icon}</span>
                    <span className="ac-title">{ROLES[r].label}</span>
                    <span className="ac-desc">{ROLES[r].tagline}</span>
                    <span className="ac-go">
                      Continue
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
              <p className="note" style={{ textAlign: "center", marginTop: "18px" }}>
                Accounts are activated by our team. Submit your details and a relationship manager
                will get you onboarded.
              </p>
            </div>
          </>
        )}

        {/* ---- role form ---- */}
        {role && (
          <>
            <div className="mhead">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button className="assoc-back" onClick={back} aria-label="Back">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div>
                  <h3>{ROLES[role].label}</h3>
                  <div className="sub">{tab === "signup" ? "Apply to join" : "Sign in to your account"}</div>
                </div>
              </div>
              <button className="mclose" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="mbody">
              {done ? (
                <div className="assoc-success">
                  <span className="as-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="12" cy="12" r="9" />
                      <path d="m8.5 12 2.5 2.5 4.5-5" />
                    </svg>
                  </span>
                  <h3>Thank you, {name.trim() || "there"}!</h3>
                  <p>
                    Your {ROLES[role].label.toLowerCase()} request has been received. A relationship
                    manager will reach out within 24 hours to complete your onboarding.
                  </p>
                  <a className="btn-gold" href={waHandoff()} target="_blank" rel="noopener" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "8px" }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
                    </svg>
                    Continue on WhatsApp
                  </a>
                  <button className="btn-ghost" onClick={closeModal} style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: "10px" }}>
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="tabs" style={{ marginBottom: "22px" }}>
                    <button className={"tab" + (tab === "signup" ? " on" : "")} onClick={() => { setTab("signup"); setErr(""); }}>
                      Sign up
                    </button>
                    <button className={"tab" + (tab === "login" ? " on" : "")} onClick={() => { setTab("login"); setErr(""); }}>
                      Login
                    </button>
                  </div>

                  {tab === "signup" && (
                    <div className="field">
                      <label>Full name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                  )}
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label>Phone / WhatsApp</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                  </div>
                  {tab === "signup" && (
                    <div className="field">
                      <label>{role === "partner" ? "City / experience (optional)" : "Message (optional)"}</label>
                      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={role === "partner" ? "Your city, network or real-estate experience…" : "Anything you’d like us to know…"} />
                    </div>
                  )}

                  {err && (
                    <div className="gate-err on" style={{ marginBottom: "12px" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h0" />
                      </svg>
                      {err}
                    </div>
                  )}

                  <button className="btn-gold" onClick={submit} style={{ width: "100%", justifyContent: "center", padding: "15px" }}>
                    {tab === "signup"
                      ? role === "partner"
                        ? "Submit partner application"
                        : "Register as investor"
                      : "Request access"}
                  </button>
                  <p className="note" style={{ textAlign: "center" }}>
                    {tab === "login"
                      ? "No password needed — our team verifies and activates your access."
                      : "By submitting you agree to be contacted by the Money Multiply team."}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
