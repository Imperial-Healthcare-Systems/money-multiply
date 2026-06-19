"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { apiRequestOtp, apiVerifyOtp, maskEmail } from "@/lib/auth";
import { OTP_PRIMARY_EMAIL } from "@/lib/data";

export default function AdminReset({ onBack }: { onBack: () => void }) {
  const { toast } = useMarketplace();
  const email = OTP_PRIMARY_EMAIL;
  const [step, setStep] = useState<1 | 2>(1);
  const [sub, setSub] = useState<React.ReactNode>(
    "We'll send a 6-digit code to the registered admin email. Enter it to set a new passcode."
  );
  const [title, setTitle] = useState("Email verification");
  const [otp, setOtp] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [err, setErr] = useState("");
  const [err1, setErr1] = useState("");
  const [shake, setShake] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const doShake = () => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  const send = () => {
    setErr1("");
    setSending(true);
    apiRequestOtp(email)
      .then((r) => {
        setSending(false);
        if (!r || !r.ok) {
          setErr1("Couldn't send the code. Please try again.");
          doShake();
          return;
        }
        setStep(2);
        setTitle("Enter your code");
        setSub(
          <>
            A code was sent to {r.sentTo || maskEmail(email)}.
            {r.preview && <b className="otp-preview"> Preview code: {r.preview}</b>}
          </>
        );
      })
      .catch(() => {
        setSending(false);
        setErr1("Network error. Please try again.");
        doShake();
      });
  };

  const verify = () => {
    setErr("");
    if (otp.length !== 6) return fail("Enter the 6-digit code.");
    if (np.length < 6) return fail("Passcode must be at least 6 characters.");
    if (np !== np2) return fail("Passcodes don't match.");
    setVerifying(true);
    apiVerifyOtp(email, otp, np)
      .then((r) => {
        setVerifying(false);
        if (!r || !r.ok) {
          fail(r && r.error === "invalid_or_expired" ? "Code is invalid or expired." : "Couldn't reset passcode. Try again.");
          return;
        }
        toast("Passcode updated");
        onBack();
      })
      .catch(() => {
        setVerifying(false);
        fail("Network error. Please try again.");
      });
  };

  function fail(msg: string) {
    setErr(msg);
    doShake();
  }

  return (
    <>
      <div className="mhead">
        <div>
          <h3>Reset passcode</h3>
          <div className="sub">Verify by email OTP</div>
        </div>
        <CloseBtn />
      </div>
      <div className="mbody">
        <div className={"gate" + (shake ? " shake" : "")} onAnimationEnd={() => setShake(false)}>
          <div className="gate-lock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>
          <h3>{title}</h3>
          <div className="gate-sub">{sub}</div>

          {step === 1 && (
            <div>
              <div className="reset-email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <span>{maskEmail(email)}</span>
              </div>
              <button className={"btn-gold gate-btn" + (sending ? " loading" : "")} onClick={send}>
                Send code
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="gate-field">
                <label>6-digit code</label>
                <div className="gate-input-wrap">
                  <input
                    type="text"
                    id="rsOtp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (err) setErr("");
                    }}
                  />
                </div>
              </div>
              <div className="gate-field">
                <label>New passcode</label>
                <div className="gate-input-wrap">
                  <input type="password" placeholder="Min 6 characters" autoComplete="new-password" value={np} onChange={(e) => setNp(e.target.value)} />
                </div>
              </div>
              <div className="gate-field">
                <label>Confirm new passcode</label>
                <div className="gate-input-wrap">
                  <input type="password" placeholder="Re-enter passcode" autoComplete="new-password" value={np2} onChange={(e) => setNp2(e.target.value)} />
                </div>
              </div>
              <div className={"gate-err" + (err ? " on" : "")}>{err && <ErrLine msg={err} />}</div>
              <button className={"btn-gold gate-btn" + (verifying ? " loading" : "")} onClick={verify}>
                Set new passcode
              </button>
              <button className="gate-forgot" type="button" onClick={send}>
                Resend code
              </button>
            </div>
          )}

          <div className={"gate-err" + (err1 ? " on" : "")}>{err1 && <ErrLine msg={err1} />}</div>
          <button className="gate-forgot" type="button" onClick={onBack}>
            ← Back to sign-in
          </button>
        </div>
      </div>
    </>
  );
}

function ErrLine({ msg }: { msg: string }) {
  return (
    <>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h0" />
      </svg>
      {msg}
    </>
  );
}

function CloseBtn() {
  const { closeModal } = useMarketplace();
  return (
    <button className="mclose" onClick={closeModal}>
      ×
    </button>
  );
}
