"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";

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
  const { modal, closeModal, registerUser, userLogin, forgotPassword, toast } = useMarketplace();
  const router = useRouter();
  const open = modal.type === "associate";

  const [role, setRole] = useState<Role | null>(null);
  const [tab, setTab] = useState<TabT>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [fEmail, setFEmail] = useState("");
  const [fSent, setFSent] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setPassword(""); setReferral(""); setErr("");
    setForgot(false); setFEmail(""); setFSent(false);
  };

  const sendForgot = async () => {
    setErr("");
    if (!EMAIL_RE.test(fEmail.trim())) return setErr("Please enter a valid email address.");
    setBusy(true);
    await forgotPassword(fEmail.trim());
    setBusy(false);
    setFSent(true);
  };
  const pickRole = (r: Role) => { reset(); setTab("signup"); setRole(r); };
  const back = () => { reset(); setRole(null); };

  const done = () => {
    closeModal();
    router.push("/dashboard");
  };

  const submit = async () => {
    if (busy || !role) return;
    setErr("");
    if (!EMAIL_RE.test(email.trim())) return setErr("Please enter a valid email address.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");

    setBusy(true);
    if (tab === "signup") {
      if (!name.trim()) { setBusy(false); return setErr("Please enter your name."); }
      if (!phone.trim()) { setBusy(false); return setErr("Please enter a phone number."); }
      const r = await registerUser({
        role,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        referredBy: referral.trim() || undefined,
      });
      setBusy(false);
      if (r.ok) { toast("Welcome to Money Multiply"); done(); return; }
      if (r.error === "email_taken") return setErr("An account with this email already exists — try logging in.");
      if (r.error === "weak") return setErr("Password must be at least 6 characters.");
      if (r.error === "server" || r.error === "network") return setErr("Couldn’t create your account. Please try again.");
      return setErr("Please check your details and try again.");
    } else {
      const r = await userLogin(email.trim(), password);
      setBusy(false);
      if (r.ok) { toast("Signed in"); done(); return; }
      if (r.error === "invalid") return setErr("Incorrect email or password.");
      return setErr("Couldn’t sign in. Please try again.");
    }
  };

  return (
    <div className="modal open" id="associateModal">
      <div className="scrim" onClick={closeModal} />
      <div className="box" id="associateBox">
        {/* chooser */}
        {!role && (
          <>
            <div className="mhead">
              <div>
                <h3>Become an Associate</h3>
                <div className="sub">Choose how you’d like to join Money Multiply</div>
              </div>
              <button className="mclose" onClick={closeModal}>×</button>
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
                Create an account to access your dashboard. Already a member? Choose a role, then switch to “Login”.
              </p>
            </div>
          </>
        )}

        {/* role form */}
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
                  <div className="sub">{tab === "signup" ? "Create your account" : "Sign in to your account"}</div>
                </div>
              </div>
              <button className="mclose" onClick={closeModal}>×</button>
            </div>

            <div className="mbody">
              {forgot ? (
                <div className="gate" style={{ paddingTop: 0 }}>
                  {fSent ? (
                    <div className="assoc-success">
                      <span className="as-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <circle cx="12" cy="12" r="9" />
                          <path d="m8.5 12 2.5 2.5 4.5-5" />
                        </svg>
                      </span>
                      <h3>Request received</h3>
                      <p>
                        If an account exists for <b>{fEmail}</b>, the Money Multiply team will verify
                        it and share new credentials with you shortly.
                      </p>
                      <button className="btn-ghost" onClick={() => { setForgot(false); setFSent(false); setErr(""); }} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                        Back to login
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <label>Account email</label>
                        <input type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" onKeyDown={(e) => e.key === "Enter" && sendForgot()} />
                      </div>
                      {err && (
                        <div className="gate-err on" style={{ marginBottom: "12px" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h0" /></svg>
                          {err}
                        </div>
                      )}
                      <button className={"btn-gold" + (busy ? " loading" : "")} onClick={sendForgot} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "15px" }}>
                        Request password reset
                      </button>
                      <button className="gate-forgot" type="button" onClick={() => { setForgot(false); setErr(""); }}>
                        ← Back to login
                      </button>
                      <p className="note" style={{ textAlign: "center" }}>
                        No email link needed — our team verifies your request and shares new credentials.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="tabs" style={{ marginBottom: "22px" }}>
                    <button className={"tab" + (tab === "signup" ? " on" : "")} onClick={() => { setTab("signup"); setErr(""); }}>Sign up</button>
                    <button className={"tab" + (tab === "login" ? " on" : "")} onClick={() => { setTab("login"); setErr(""); }}>Login</button>
                  </div>

                  {tab === "signup" && (
                    <div className="field">
                      <label>Full name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                  )}
                  <div className="field">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                  {tab === "signup" && (
                    <div className="field">
                      <label>Phone / WhatsApp</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                    </div>
                  )}
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === "signup" ? "Min 6 characters" : "Your password"}
                      autoComplete={tab === "signup" ? "new-password" : "current-password"}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                  </div>
                  {tab === "signup" && (
                    <div className="field">
                      <label>Referral code (optional)</label>
                      <input value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="e.g. MM-AB12CD" />
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

                  <button className={"btn-gold" + (busy ? " loading" : "")} onClick={submit} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "15px" }}>
                    {tab === "signup"
                      ? role === "partner" ? "Create partner account" : "Create investor account"
                      : "Sign in"}
                  </button>
                  {tab === "login" && (
                    <button className="gate-forgot" type="button" onClick={() => { setForgot(true); setErr(""); setFEmail(email); }}>
                      Forgot password?
                    </button>
                  )}
                  <p className="note" style={{ textAlign: "center" }}>
                    {tab === "signup"
                      ? "By creating an account you agree to be contacted by the Money Multiply team."
                      : "Use the email & password you registered with."}
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
