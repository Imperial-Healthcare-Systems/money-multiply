"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { aggregate, imgFor, leadsToday, timeAgo, exportLeadsCSV, fundedPct } from "@/lib/utils";
import { fmt as fmtRaw } from "@/lib/currency";
import { DonutSVG, Sparkline } from "./charts";
import AdminForm from "./AdminForm";
import AdminUsers from "./AdminUsers";
import type { Lead, LeadSource, Listing } from "@/lib/types";

const COLORS = ["#c6a35a", "#3a6b4f", "#d8b96a", "#5fb98a", "#8a6d2f", "#b08d44"];

const SRC_LABEL: Record<LeadSource, string> = {
  news: "Newsletter",
  wa: "WhatsApp",
  email: "Email",
  partner: "Partner",
  investor: "Investor",
};

function AnimatedNumber({ to, format }: { to: number; format: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 900;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else setV(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{format(v)}</>;
}

export default function AdminConsole({
  onToggleMax,
  onMinimize,
  onChangePasscode,
}: {
  onToggleMax: () => void;
  onMinimize: () => void;
  onChangePasscode: () => void;
}) {
  const { listings, leads, currency, fmt, fmtPlain, logout, deleteListing, clearLeads, toast } =
    useMarketplace();
  const [tab, setTab] = useState<"dash" | "leads" | "list" | "users">("dash");
  const [editing, setEditing] = useState<Listing | null | undefined>(undefined); // undefined = no form
  const [leadFilter, setLeadFilter] = useState<"all" | LeadSource>("all");

  if (editing !== undefined) {
    return <AdminForm editing={editing} onDone={() => setEditing(undefined)} />;
  }

  const a = aggregate(listings);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="mhead">
        <div>
          <h3>Admin console</h3>
          <div className="sub">
            {a.n} projects · {fmt(a.totalGMV)} under management
          </div>
        </div>
        <div className="win-ctrls">
          <button className="win-btn" title="Minimise" onClick={onMinimize}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="19" x2="19" y2="19" />
            </svg>
          </button>
          <button className="win-btn" title="Maximise" onClick={onToggleMax}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
          <CloseBtn />
        </div>
      </div>
      <div className="mbody">
        <div className="adm-greet">
          <div className="ag-av">AM</div>
          <div className="ag-txt">
            <b>{greet}, Admin</b>
            <span>Money Multiply · Greater Noida HQ</span>
          </div>
          <span className="ag-live">
            <i />
            Live
          </span>
        </div>
        <div className="tabs">
          <button className={"tab" + (tab === "dash" ? " on" : "")} onClick={() => setTab("dash")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            Dashboard
          </button>
          <button className={"tab" + (tab === "leads" ? " on" : "")} onClick={() => setTab("leads")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
            </svg>
            Leads
            {leads.length > 0 && <span className="tab-badge">{leads.length}</span>}
          </button>
          <button className={"tab" + (tab === "list" ? " on" : "")} onClick={() => setTab("list")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="16" width="18" height="4" rx="1" />
            </svg>
            Listings
          </button>
          <button className={"tab" + (tab === "users" ? " on" : "")} onClick={() => setTab("users")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
            </svg>
            Users
          </button>
        </div>

        <div id="admTabBody">
          {tab === "dash" && <Dashboard a={a} listings={listings} leads={leads} fmt={fmt} currency={currency} />}
          {tab === "leads" && (
            <Leads
              leads={leads}
              leadFilter={leadFilter}
              setLeadFilter={setLeadFilter}
              onExport={() => {
                exportLeadsCSV(leads, (s) => SRC_LABEL[s as LeadSource] || s);
                toast("Leads exported");
              }}
              onClear={async () => {
                if (confirm("Clear all captured leads? This cannot be undone.")) {
                  await clearLeads();
                  toast("Leads cleared");
                }
              }}
            />
          )}
          {tab === "list" && (
            <Listings
              listings={listings}
              fmt={fmt}
              fmtPlain={fmtPlain}
              onAdd={() => setEditing(null)}
              onEdit={(l) => setEditing(l)}
              onDelete={async (id) => {
                if (confirm("Delete this listing? This cannot be undone.")) {
                  const r = await deleteListing(id);
                  toast(r.ok ? "Listing deleted" : "Couldn’t delete listing");
                }
              }}
            />
          )}
          {tab === "users" && <AdminUsers />}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", minWidth: "150px" }} onClick={onChangePasscode}>
            Change passcode
          </button>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", minWidth: "150px" }} onClick={() => logout()}>
            Sign out of console
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({
  a,
  listings,
  leads,
  fmt,
  currency,
}: {
  a: ReturnType<typeof aggregate>;
  listings: Listing[];
  leads: Lead[];
  fmt: (n: number) => string;
  currency: ReturnType<typeof useMarketplace>["currency"];
}) {
  const catKeys = Object.keys(a.byCat);
  const donutData = catKeys.map((k) => ({ k, v: Math.round(a.byCat[k] / 1e7) }));
  const today = leadsToday(leads);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      barsRef.current?.querySelectorAll<HTMLElement>(".bar-track > i").forEach((i) => {
        i.style.width = (i.getAttribute("data-w") || "0") + "%";
      });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const fmtCr = (n: number) => fmtRaw(n, currency);
  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-IN");

  return (
    <div className="dash">
      <div className="kpi-row">
        <div className="kpi">
          <div className="kl">Total Project Value</div>
          <div className="kv">
            <AnimatedNumber to={a.totalGMV} format={fmtCr} />
          </div>
          <div className="kd">
            <span className="delta up">▲ 8.4%</span> vs last quarter
          </div>
          <Sparkline seed={1} w={52} h={22} col="#5fb98a" />
        </div>
        <div className="kpi">
          <div className="kl">Capital Reserved</div>
          <div className="kv">
            <AnimatedNumber to={a.raised} format={fmtCr} />
          </div>
          <div className="kd">
            <span className="delta up">▲ {a.totalGMV ? Math.round((a.raised / a.totalGMV) * 100) : 0}%</span> of total value
          </div>
          <Sparkline seed={2} w={52} h={22} col="#c6a35a" />
        </div>
        <div className="kpi">
          <div className="kl">Tokens Allotted</div>
          <div className="kv">
            <AnimatedNumber to={a.tokensSold} format={fmtInt} />
          </div>
          <div className="kd">
            <span className="delta up">{a.fundedPct}%</span> of {a.tokensTotal.toLocaleString("en-IN")}
          </div>
          <Sparkline seed={3} w={52} h={22} col="#d8b96a" />
        </div>
        <div className="kpi">
          <div className="kl">Leads Captured</div>
          <div className="kv">
            <AnimatedNumber to={leads.length} format={fmtInt} />
          </div>
          <div className="kd">
            <span className="delta up">{today} today</span> · all sources
          </div>
          <Sparkline seed={4} w={52} h={22} col="#9ad6b3" />
        </div>
      </div>
      <div className="dash-2">
        <div className="panel">
          <h4>Value by segment</h4>
          <div className="psub">Project value split across asset categories</div>
          <div className="donut-wrap">
            <DonutSVG data={donutData} colors={COLORS} />
            <div className="legend">
              {catKeys.map((k, i) => (
                <div className="leg" key={k}>
                  <span className="sw" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="ln">{k}</span>
                  <span className="lv">{fmt(a.byCat[k])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <h4>Funding progress</h4>
          <div className="psub">Tokens allotted vs available, by project</div>
          <div className="bars" ref={barsRef}>
            {listings.map((l) => {
              const pct = fundedPct(l);
              return (
                <div className="bar-row" key={l.id}>
                  <span className="bn">{l.title.split("—")[0].trim()}</span>
                  <div className="bar-track">
                    <i data-w={pct} />
                  </div>
                  <span className="bv">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="panel">
        <h4>All projects</h4>
        <div className="psub">Live snapshot across the marketplace</div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Segment</th>
                <th>Project cost</th>
                <th>Reserved</th>
                <th>IRR</th>
                <th>Funded</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => {
                const pct = fundedPct(l);
                const col = pct >= 85 ? "#5fb98a" : pct >= 50 ? "#d8b96a" : "#c6a35a";
                return (
                  <tr key={l.id}>
                    <td>
                      <span className="ddot" style={{ background: col }} />
                      {l.title.split("—")[0].trim()}
                    </td>
                    <td>{l.cat}</td>
                    <td>{fmt(l.total)}</td>
                    <td>{fmt(l.sold * l.token)}</td>
                    <td>{l.roi.split(" ")[0]}</td>
                    <td>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Leads ---------------- */
function Leads({
  leads,
  leadFilter,
  setLeadFilter,
  onExport,
  onClear,
}: {
  leads: Lead[];
  leadFilter: "all" | LeadSource;
  setLeadFilter: (f: "all" | LeadSource) => void;
  onExport: () => void;
  onClear: () => void;
}) {
  const byNews = leads.filter((l) => l.source === "news").length;
  const byWA = leads.filter((l) => l.source === "wa").length;
  const byEmail = leads.filter((l) => l.source === "email").length;
  const byPartner = leads.filter((l) => l.source === "partner").length;
  const byInvestor = leads.filter((l) => l.source === "investor").length;
  const shown = leads.filter((l) => leadFilter === "all" || l.source === leadFilter);

  return (
    <>
      <div className="lead-kpis">
        <div className="lead-kpi">
          <div className="lkn">{byPartner}</div>
          <div className="lkl">Partners</div>
        </div>
        <div className="lead-kpi">
          <div className="lkn">{byInvestor}</div>
          <div className="lkl">Investors</div>
        </div>
        <div className="lead-kpi">
          <div className="lkn">{byNews}</div>
          <div className="lkl">Newsletter</div>
        </div>
        <div className="lead-kpi">
          <div className="lkn">{byWA}</div>
          <div className="lkl">WhatsApp</div>
        </div>
        <div className="lead-kpi">
          <div className="lkn">{byEmail}</div>
          <div className="lkl">Email</div>
        </div>
      </div>
      <div className="leads-head">
        <div>
          <div className="lh-title">Captured leads</div>
          <div className="lh-sub">{leads.length} total · newest first</div>
        </div>
        <div className="lh-actions">
          <button className="btn-mini" disabled={!leads.length} style={leads.length ? undefined : { opacity: 0.4 }} onClick={onExport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            Export CSV
          </button>
          <button className="btn-mini danger" disabled={!leads.length} style={leads.length ? undefined : { opacity: 0.4 }} onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
      <div className="lead-filter">
        <button className={leadFilter === "all" ? "on" : ""} onClick={() => setLeadFilter("all")}>
          All ({leads.length})
        </button>
        <button className={leadFilter === "partner" ? "on" : ""} onClick={() => setLeadFilter("partner")}>
          Partners ({byPartner})
        </button>
        <button className={leadFilter === "investor" ? "on" : ""} onClick={() => setLeadFilter("investor")}>
          Investors ({byInvestor})
        </button>
        <button className={leadFilter === "news" ? "on" : ""} onClick={() => setLeadFilter("news")}>
          Newsletter ({byNews})
        </button>
        <button className={leadFilter === "wa" ? "on" : ""} onClick={() => setLeadFilter("wa")}>
          WhatsApp ({byWA})
        </button>
        <button className={leadFilter === "email" ? "on" : ""} onClick={() => setLeadFilter("email")}>
          Email ({byEmail})
        </button>
      </div>
      {shown.length === 0 ? (
        <div className="lead-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 8l9 6 9-6" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
          <b>No leads yet</b>
          <p>Newsletter sign-ups and WhatsApp / email enquiries from the site will appear here automatically.</p>
        </div>
      ) : (
        <div className="lead-list">
          {shown.map((l) => {
            const detail = l.detail || (l.source === "news" ? "Newsletter subscription" : "General enquiry");
            return (
              <div className="lead-item" key={l.id}>
                <div className={"lead-ic " + l.source}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </div>
                <div className="lead-info">
                  <b>{l.contact || "—"}</b>
                  <span>{detail}</span>
                </div>
                <div className="lead-meta">
                  <span className={"lead-src " + l.source}>{SRC_LABEL[l.source]}</span>
                  <div className="lead-time">{timeAgo(l.ts)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------------- Listings manager ---------------- */
function Listings({
  listings,
  fmt,
  fmtPlain,
  onAdd,
  onEdit,
  onDelete,
}: {
  listings: Listing[];
  fmt: (n: number) => string;
  fmtPlain: (n: number) => string;
  onAdd: () => void;
  onEdit: (l: Listing) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="admin-list">
        {listings.map((l) => (
          <div className="adm-item" key={l.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgFor(l)} alt="" />
            <div className="ai-info">
              <b>{l.title}</b>
              <span>
                {l.cat} · {fmt(l.total)} · {fmtPlain(l.token)}/token
              </span>
            </div>
            <div className="adm-actions">
              <button className="iconbtn" aria-label="Edit" onClick={() => onEdit(l)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button className="iconbtn del" aria-label="Delete" onClick={() => onDelete(l.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="adm-add" onClick={onAdd}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add new listing
      </button>
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
