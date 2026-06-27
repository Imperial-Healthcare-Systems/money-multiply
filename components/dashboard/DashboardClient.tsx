"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import ListingCard from "@/components/ListingCard";
import type { Holding } from "@/lib/types";

interface Referral {
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function DashboardClient() {
  const { currentUser, userReady, userLogout, listings, fmt, openAssociate, toast } = useMarketplace();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    if (!currentUser) return;
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
            <div className="db-av">{(u.name || u.email)[0]?.toUpperCase()}</div>
            <div className="db-name">{u.name || "—"}</div>
            <span className="db-role">{isPartner ? "Official Partner" : "Investor"}</span>
            <div className="db-rows">
              <div className="db-row"><span>Email</span><b>{u.email}</b></div>
              <div className="db-row"><span>Phone</span><b>{u.phone || "—"}</b></div>
              <div className="db-row"><span>Status</span><b style={{ textTransform: "capitalize" }}>{u.status}</b></div>
              <div className="db-row"><span>Member since</span><b>{memberSince}</b></div>
            </div>
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
