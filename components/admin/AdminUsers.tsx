"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { AppUser, Holding } from "@/lib/types";

interface Detail {
  user: AppUser;
  holdings: Holding[];
  referrals: { name: string; email: string; role: string; createdAt?: string }[];
}

export default function AdminUsers() {
  const { fmt, toast } = useMarketplace();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [commission, setCommission] = useState("");
  const [status, setStatus] = useState("active");
  const [hold, setHold] = useState({ title: "", tokens: "", amount: "" });
  const [newPass, setNewPass] = useState("");

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d?.ok ? d.users : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadUsers, []);

  const openDetail = async (id: string) => {
    const r = await fetch(`/api/admin/users/${id}`);
    const d = await r.json().catch(() => ({}));
    if (d?.ok) {
      setDetail({ user: d.user, holdings: d.holdings || [], referrals: d.referrals || [] });
      setCommission(String(d.user.commission || 0));
      setStatus(d.user.status || "active");
    }
  };

  const saveUser = async () => {
    if (!detail) return;
    const r = await fetch(`/api/admin/users/${detail.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission: parseFloat(commission) || 0, status }),
    });
    const d = await r.json().catch(() => ({}));
    if (d?.ok) {
      toast("User updated");
      setDetail((p) => (p ? { ...p, user: d.user } : p));
      setUsers((prev) => prev.map((u) => (u.id === d.user.id ? d.user : u)));
    } else toast("Couldn’t update user");
  };

  const addHolding = async () => {
    if (!detail) return;
    if (!hold.title.trim()) return toast("Add a project title");
    const r = await fetch(`/api/admin/users/${detail.user.id}/holdings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: hold.title.trim(),
        tokens: parseInt(hold.tokens, 10) || 0,
        amount: parseFloat(hold.amount) || 0,
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (d?.ok) {
      setDetail((p) => (p ? { ...p, holdings: [d.holding, ...p.holdings] } : p));
      setHold({ title: "", tokens: "", amount: "" });
      toast("Holding added");
    } else toast("Couldn’t add holding");
  };

  const delHolding = async (id: string) => {
    const r = await fetch(`/api/admin/holdings/${id}`, { method: "DELETE" });
    if (r.ok) setDetail((p) => (p ? { ...p, holdings: p.holdings.filter((h) => h.id !== id) } : p));
  };

  const setPassword = async () => {
    if (!detail) return;
    if (newPass.length < 6) return toast("Password must be at least 6 characters");
    const r = await fetch(`/api/admin/users/${detail.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPass }),
    });
    const d = await r.json().catch(() => ({}));
    if (d?.ok) {
      toast("Password reset — share it with the user");
      setNewPass("");
      setDetail((p) => (p ? { ...p, user: d.user } : p));
      setUsers((prev) => prev.map((u) => (u.id === d.user.id ? d.user : u)));
    } else toast("Couldn’t set password");
  };

  /* ---- detail view ---- */
  if (detail) {
    const u = detail.user;
    const isPartner = u.role === "partner";
    return (
      <div>
        <button className="au-back" onClick={() => setDetail(null)}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All users
        </button>
        <div className="au-detail">
          <div className="leads-head" style={{ marginBottom: "10px" }}>
            <div>
              <div className="lh-title">{u.name || u.email}</div>
              <div className="lh-sub">{u.email} · {u.phone || "—"} · <span style={{ textTransform: "capitalize" }}>{u.role}</span></div>
            </div>
          </div>

          <div className="frow">
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">active</option>
                <option value="pending">pending</option>
                <option value="suspended">suspended</option>
              </select>
            </div>
            {isPartner && (
              <div className="field">
                <label>Commission earned (₹)</label>
                <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </div>
            )}
          </div>
          <button className="btn-mini" onClick={saveUser}>Save changes</button>

          <h4 className="pd-sub">
            Password{" "}
            {u.resetRequested && (
              <span className="lead-src wa" style={{ marginLeft: "8px" }}>reset requested</span>
            )}
          </h4>
          <div className="au-form" style={{ gridTemplateColumns: "1fr auto" }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Set a new password for this user</label>
              <input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <button className="btn-mini" onClick={setPassword}>Set password</button>
          </div>

          {isPartner ? (
            <>
              <h4 className="pd-sub">Bank details (payout)</h4>
              {u.bank && (u.bank.accountNumber || u.bank.upi) ? (
                <table className="pd-fin">
                  <tbody>
                    <tr><td>Account holder</td><td style={{ textAlign: "right" }}>{u.bank.accountName || "—"}</td></tr>
                    <tr><td>Bank</td><td style={{ textAlign: "right" }}>{u.bank.bankName || "—"}</td></tr>
                    <tr><td>Account number</td><td style={{ textAlign: "right" }}>{u.bank.accountNumber || "—"}</td></tr>
                    <tr><td>IFSC</td><td style={{ textAlign: "right" }}>{u.bank.ifsc || "—"}</td></tr>
                    <tr><td>UPI</td><td style={{ textAlign: "right" }}>{u.bank.upi || "—"}</td></tr>
                  </tbody>
                </table>
              ) : (
                <p className="db-muted">No bank details added yet.</p>
              )}
              <h4 className="pd-sub">Referrals ({detail.referrals.length})</h4>
              {detail.referrals.length === 0 ? (
                <p className="db-muted">Code <b>{u.referralCode}</b> — no referrals yet.</p>
              ) : (
                <table className="pd-fin">
                  <tbody>
                    {detail.referrals.map((r, i) => (
                      <tr key={i}><td>{r.name || r.email}<div className="db-sub">{r.email}</div></td><td style={{ textAlign: "right", textTransform: "capitalize" }}>{r.role}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <h4 className="pd-sub">Reservations / holdings</h4>
              {detail.holdings.length > 0 && (
                <table className="pd-fin">
                  <tbody>
                    {detail.holdings.map((h) => (
                      <tr key={h.id}>
                        <td>{h.title}</td>
                        <td>{h.tokens}</td>
                        <td>{fmt(h.amount)}</td>
                        <td style={{ textAlign: "right" }}>
                          <button className="iconbtn del" onClick={() => delHolding(h.id)} aria-label="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="au-form">
                <div className="field" style={{ margin: 0 }}><label>Project</label><input value={hold.title} onChange={(e) => setHold({ ...hold, title: e.target.value })} placeholder="Hindon Prime…" /></div>
                <div className="field" style={{ margin: 0 }}><label>Tokens</label><input type="number" value={hold.tokens} onChange={(e) => setHold({ ...hold, tokens: e.target.value })} placeholder="2" /></div>
                <div className="field" style={{ margin: 0 }}><label>Amount (₹)</label><input type="number" value={hold.amount} onChange={(e) => setHold({ ...hold, amount: e.target.value })} placeholder="1000000" /></div>
                <button className="btn-mini" onClick={addHolding}>Add</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---- list view ---- */
  if (loading) return <p className="db-muted">Loading users…</p>;
  if (users.length === 0)
    return (
      <div className="lead-empty">
        <b>No users yet</b>
        <p>Partner & investor registrations from “Become an Associate” will appear here.</p>
      </div>
    );

  return (
    <div className="admin-list">
      {users.map((u) => (
        <button className="adm-item" key={u.id} style={{ textAlign: "left", cursor: "pointer" }} onClick={() => openDetail(u.id)}>
          <span className={"lead-src " + (u.role === "partner" ? "partner" : "investor")} style={{ flexShrink: 0 }}>{u.role}</span>
          <div className="ai-info">
            <b>{u.name || u.email}</b>
            <span>{u.email}{u.role === "partner" ? ` · ${fmt(u.commission)} commission` : ""}</span>
          </div>
          {u.resetRequested && <span className="lead-src wa" style={{ flexShrink: 0 }}>reset</span>}
          <span className="lead-time">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
        </button>
      ))}
    </div>
  );
}
