"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import ListingCard from "@/components/ListingCard";
import type { BankDetails, Holding } from "@/lib/types";

interface Referral {
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function DashboardClient() {
  const { currentUser, userReady, userLogout, listings, fmt, openAssociate, toast, updateBank, saveProfile, uploadAvatar } =
    useMarketplace();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bank, setBank] = useState<BankDetails>({});
  const [bankSaving, setBankSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.bank) setBank(currentUser.bank);
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setHoldings(d.holdings || []);
          setReferrals(d.referrals || []);
        }
      })
      .catch(() => {});
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveBank = async () => {
    setBankSaving(true);
    const r = await updateBank(bank);
    setBankSaving(false);
    toast(r.ok ? "Bank details saved" : "Couldn’t save bank details");
  };
  const setB = (k: keyof BankDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBank((b) => ({ ...b, [k]: e.target.value }));

  /* ---- gates ---- */
  if (!userReady) {
    return (
      <section className="sec" style={{ paddingTop: "calc(var(--header-h) + 60px)", textAlign: "center" }}>
        <div className="wrap">
          <p style={{ color: "var(--muted)" }}>Loading your dashboard…</p>
        </div>
      </section>
    );
  }
  if (!currentUser) {
    return (
      <section className="sec" style={{ paddingTop: "calc(var(--header-h) + 60px)", textAlign: "center" }}>
        <div className="wrap">
          <div className="empty">
            <b>Please sign in</b>
            You need a partner or investor account to view this dashboard.
            <div style={{ marginTop: "18px" }}>
              <button className="btn-gold" onClick={openAssociate} style={{ padding: "12px 24px" }}>
                Become an Associate
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const u = currentUser;
  const isPartner = u.role === "partner";
  const saved = listings.filter((l) => u.saved?.includes(l.id));
  const memberSince = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(u.referralCode);
      toast("Referral code copied");
    } catch {
      toast(u.referralCode);
    }
  };

  const startEdit = () => {
    setEName(u.name);
    setEPhone(u.phone);
    setEditing(true);
  };
  const saveProf = async () => {
    if (!eName.trim()) return toast("Name can’t be empty");
    setSavingProfile(true);
    const r = await saveProfile(eName.trim(), ePhone.trim());
    setSavingProfile(false);
    if (r.ok) {
      toast("Profile updated");
      setEditing(false);
    } else toast("Couldn’t save profile");
  };
  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast("Image too large (max 5MB)");
    setAvatarBusy(true);
    const r = await uploadAvatar(file);
    setAvatarBusy(false);
    toast(r.ok ? "Photo updated" : "Couldn’t upload photo");
  };

  return (
    <section className="db-wrap">
      <div className="wrap">
        {/* header */}
        <div className="db-head">
          <div>
            <span className="eyebrow">{isPartner ? "Partner dashboard" : "Investor dashboard"}</span>
            <h1 className="db-title">Welcome, {u.name.split(" ")[0] || "there"}</h1>
          </div>
          <button className="btn-ghost" onClick={() => userLogout()}>
            Sign out
          </button>
        </div>

        <div className="db-grid">
          {/* left: profile */}
          <aside className="db-card db-profile">
            <div className="db-av-wrap">
              <div className="db-av">
                {u.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar} alt={u.name} />
                ) : (
                  (u.name || u.email)[0]?.toUpperCase()
                )}
              </div>
              <label className={"db-av-edit" + (avatarBusy ? " busy" : "")} title="Change photo">
                {avatarBusy ? (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" className="db-spin"><path d="M21 12a9 9 0 1 1-6.2-8.5" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></svg>
                )}
                <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={avatarBusy} />
              </label>
            </div>

            {editing ? (
              <div className="field" style={{ margin: "0 0 4px" }}>
                <input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Full name" style={{ textAlign: "center" }} />
              </div>
            ) : (
              <div className="db-name">{u.name || "—"}</div>
            )}
            <span className="db-role">{isPartner ? "Official Partner" : "Investor"}</span>

            <div className="db-rows">
              <div className="db-row"><span>Email</span><b>{u.email}</b></div>
              <div className="db-row">
                <span>Phone</span>
                {editing ? (
                  <input value={ePhone} onChange={(e) => setEPhone(e.target.value)} placeholder="Phone" style={{ maxWidth: "150px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--line-2)", background: "rgba(0,0,0,.3)", color: "var(--cream)", fontFamily: "var(--ff-m)", fontSize: "13px" }} />
                ) : (
                  <b>{u.phone || "—"}</b>
                )}
              </div>
              <div className="db-row"><span>Status</span><b style={{ textTransform: "capitalize" }}>{u.status}</b></div>
              <div className="db-row"><span>Member since</span><b>{memberSince}</b></div>
            </div>

            {editing ? (
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button className={"btn-gold" + (savingProfile ? " loading" : "")} onClick={saveProf} disabled={savingProfile} style={{ flex: 1, justifyContent: "center", padding: "11px" }}>Save</button>
                <button className="btn-ghost" onClick={() => setEditing(false)} style={{ flex: 1, justifyContent: "center", padding: "11px" }}>Cancel</button>
              </div>
            ) : (
              <button className="btn-ghost" onClick={startEdit} style={{ width: "100%", justifyContent: "center", marginTop: "16px", padding: "11px" }}>
                Edit profile
              </button>
            )}

            {isPartner && u.referralCode && (
              <div className="db-ref">
                <div className="db-ref-l">Your referral code</div>
                <button className="db-ref-code" onClick={copyCode} title="Copy">
                  {u.referralCode}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                </button>
              </div>
            )}
          </aside>

          {/* right: role content */}
          <div className="db-main">
            {isPartner ? (
              <>
                <div className="db-card">
                  <div className="db-kpis">
                    <div className="db-kpi"><div className="kv">{fmt(u.commission)}</div><div className="kl">Commission earned</div></div>
                    <div className="db-kpi"><div className="kv">{referrals.length}</div><div className="kl">Referrals</div></div>
                  </div>
                </div>
                <div className="db-card">
                  <h3 className="db-h3">Your referrals</h3>
                  {referrals.length === 0 ? (
                    <p className="db-muted">No referrals yet. Share your code <b>{u.referralCode}</b> — anyone who signs up with it appears here.</p>
                  ) : (
                    <table className="pd-fin">
                      <tbody>
                        {referrals.map((r, i) => (
                          <tr key={i}>
                            <td>{r.name || r.email}<div className="db-sub">{r.email}</div></td>
                            <td style={{ textAlign: "right", textTransform: "capitalize" }}>{r.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="db-card">
                  <h3 className="db-h3">Bank details</h3>
                  <p className="db-muted" style={{ marginBottom: "16px" }}>
                    Where we send your commission payouts. Stored securely; only you and the Money
                    Multiply team can see this.
                  </p>
                  <div className="frow">
                    <div className="field"><label>Account holder name</label><input value={bank.accountName || ""} onChange={setB("accountName")} placeholder="As per bank records" /></div>
                    <div className="field"><label>Bank name</label><input value={bank.bankName || ""} onChange={setB("bankName")} placeholder="e.g. HDFC Bank" /></div>
                  </div>
                  <div className="frow">
                    <div className="field"><label>Account number</label><input value={bank.accountNumber || ""} onChange={setB("accountNumber")} placeholder="Account number" /></div>
                    <div className="field"><label>IFSC code</label><input value={bank.ifsc || ""} onChange={setB("ifsc")} placeholder="e.g. HDFC0001234" /></div>
                  </div>
                  <div className="field"><label>UPI ID (optional)</label><input value={bank.upi || ""} onChange={setB("upi")} placeholder="name@upi" /></div>
                  <button className={"btn-gold" + (bankSaving ? " loading" : "")} onClick={saveBank} disabled={bankSaving} style={{ padding: "12px 22px" }}>
                    Save bank details
                  </button>
                </div>
              </>
            ) : (
              <div className="db-card">
                <h3 className="db-h3">My reservations</h3>
                {holdings.length === 0 ? (
                  <p className="db-muted">No reservations yet. Reserve tokens on any opportunity and our team records your allocation here.</p>
                ) : (
                  <table className="pd-fin">
                    <thead>
                      <tr><td>Project</td><td>Tokens</td><td>Amount</td><td style={{ textAlign: "right" }}>Status</td></tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr key={h.id}>
                          <td>{h.title}</td>
                          <td>{h.tokens.toLocaleString("en-IN")}</td>
                          <td>{fmt(h.amount)}</td>
                          <td style={{ textAlign: "right", textTransform: "capitalize" }}>{h.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* saved opportunities */}
            <div className="db-card">
              <div className="db-card-head">
                <h3 className="db-h3" style={{ margin: 0 }}>Saved opportunities</h3>
                <Link href="/#marketplace" className="db-link">Browse all →</Link>
              </div>
              {saved.length === 0 ? (
                <p className="db-muted">You haven’t saved any opportunities yet. Tap “Save” on a listing to shortlist it here.</p>
              ) : (
                <div className="grid" style={{ marginTop: "18px" }}>
                  {saved.map((l) => (
                    <ListingCard key={l.id} l={l} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
