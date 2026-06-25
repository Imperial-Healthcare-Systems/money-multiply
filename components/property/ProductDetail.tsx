"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { imgFor, fundedPct } from "@/lib/utils";
import { waLink } from "@/lib/links";
import ListingCard from "@/components/ListingCard";
import InvestPanel from "./InvestPanel";

const DOCS = [
  { name: "Project Information Report", kind: "PDF" },
  { name: "Title & Ownership Documents", kind: "PDF" },
  { name: "Legal Diligence & RERA Status", kind: "PDF" },
];

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const TABS = ["Overview", "Details", "Financials", "Documents", "Tokenomics", "Location"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetail({ id }: { id: string }) {
  const { listings, getListing, fmt, fmtPlain, ready, captureLead } = useMarketplace();
  const [tab, setTab] = useState<Tab>("Overview");
  const l = getListing(id);

  if (!l) {
    return (
      <section className="sec" style={{ paddingTop: "calc(var(--header-h) + 60px)", textAlign: "center" }}>
        <div className="wrap">
          <div className="empty">
            <b>{ready ? "Opportunity not found" : "Loading…"}</b>
            {ready && (
              <>
                This listing may have been removed.{" "}
                <Link href="/#marketplace" style={{ color: "var(--brass-lt)" }}>
                  Back to marketplace
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  const pct = fundedPct(l);
  const avail = l.units - l.sold;
  const raised = l.sold * l.token;
  const mapSrc = "https://www.google.com/maps?q=" + encodeURIComponent(l.loc) + "&output=embed";
  const similar = listings.filter((x) => x.id !== l.id).slice(0, 3);
  const closing = pct >= 90;

  const highlights = [
    "Minimum ticket " + fmtPlain(l.token) + " per token",
    "Target return " + l.roi,
    l.tenure ? "Tenure / lock-in " + l.tenure : "Flexible holding period",
    l.size || "Title-clear land parcel",
    "Title-verified, demarcated & documented ownership",
    "Closed personally by a relationship manager on WhatsApp",
  ];

  const specs = [
    { l: "Min. ticket", v: fmtPlain(l.token), icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { l: "Target return", v: l.roi.split(" ")[0], icon: <path d="M3 17l6-6 4 4 8-8M21 7v5h-5" /> },
    { l: "Tenure", v: l.tenure || "—", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
    { l: "Total units", v: l.units.toLocaleString("en-IN"), icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
    { l: "Available", v: avail.toLocaleString("en-IN"), icon: <><path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></> },
  ];

  return (
    <article>
      <div className="wrap pd-crumb">
        <Link href="/#marketplace">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to marketplace
        </Link>
      </div>

      <div className="wrap pd-layout">
        {/* LEFT */}
        <div className="pd-left">
          <div className="pd-imgcard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgFor(l)} alt={l.title} />
          </div>

          <div className="pd-meta">
            <span className="loc">
              <Pin />
              {l.loc}
            </span>
            <span className={"pd-status" + (closing ? " soon" : "")}>{closing ? "Closing soon" : "Open"}</span>
          </div>
          <h1 className="pd-title">{l.title}</h1>

          {/* spec strip */}
          <div className="pd-specs">
            {specs.map((s) => (
              <div className="pd-spec" key={s.l}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  {s.icon}
                </svg>
                <div>
                  <div className="l">{s.l}</div>
                  <div className="v">{s.v}</div>
                </div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="pd-tabs">
            {TABS.map((t) => (
              <button key={t} className={"pd-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>
                {t === "Documents" ? `Documents (${DOCS.length})` : t}
              </button>
            ))}
          </div>

          <div className="pd-panel-c">
            {tab === "Overview" && (
              <>
                <span className="pd-eyebrow">Description</span>
                <p>{l.desc}</p>
                <div className="pd-trust3">
                  <div>
                    <div className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
                      </svg>
                    </div>
                    <h4>Legal-first diligence</h4>
                    <p>Title search, encumbrance checks and RERA alignment before listing.</p>
                  </div>
                  <div>
                    <div className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5Z" />
                      </svg>
                    </div>
                    <h4>Human relationship managers</h4>
                    <p>Every reservation is confirmed and closed by a named manager.</p>
                  </div>
                  <div>
                    <div className="ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <rect x="4" y="9" width="16" height="11" rx="2" />
                        <path d="M8 9V6a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                    <h4>Documented ownership</h4>
                    <p>Your tokenised allocation maps to clear paperwork at every step.</p>
                  </div>
                </div>
              </>
            )}

            {tab === "Details" && (
              <>
                <h3>Investment highlights</h3>
                <ul className="pd-highlights">
                  {highlights.map((h, i) => (
                    <li key={i}>
                      <Check />
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === "Financials" && (
              <>
                <h3>Financial snapshot</h3>
                <table className="pd-fin">
                  <tbody>
                    <tr><td>Total project cost</td><td>{fmt(l.total)}</td></tr>
                    <tr><td>Token price (min. ticket)</td><td>{fmtPlain(l.token)}</td></tr>
                    <tr><td>Total units</td><td>{l.units.toLocaleString("en-IN")}</td></tr>
                    <tr><td>Units available</td><td>{avail.toLocaleString("en-IN")}</td></tr>
                    <tr><td>Capital reserved</td><td>{fmt(raised)} ({pct}%)</td></tr>
                    <tr><td>Target return</td><td>{l.roi}</td></tr>
                    <tr><td>Tenure</td><td>{l.tenure || "—"}</td></tr>
                    <tr><td>Asset size / scale</td><td>{l.size || "—"}</td></tr>
                  </tbody>
                </table>
              </>
            )}

            {tab === "Documents" && (
              <>
                <h3>Documents</h3>
                <div className="pd-docs">
                  {DOCS.map((d) => (
                    <div className="pd-doc" key={d.name}>
                      <span className="di">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </span>
                      <div className="dinfo">
                        <b>{d.name}</b>
                        <span>{d.kind} · Shared with verified investors</span>
                      </div>
                      <a
                        className="dreq"
                        href={waLink("Hello Money Multiply, please share the '" + d.name + "' for *" + l.title + "*.")}
                        target="_blank"
                        rel="noopener"
                        onClick={() => captureLead("wa", "WhatsApp enquiry", l.title + " — " + d.name)}
                      >
                        Request
                      </a>
                    </div>
                  ))}
                </div>
                <p className="note" style={{ marginTop: "16px" }}>
                  Documents are released to KYC-verified investors. Tap “Request” and a relationship
                  manager will share them with you on WhatsApp.
                </p>
              </>
            )}

            {tab === "Tokenomics" && (
              <>
                <h3>Tokenomics</h3>
                <div className="pd-tok-grid">
                  <div className="pd-tok-stat">
                    <div className="l">Total tokens</div>
                    <div className="v">{l.units.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="pd-tok-stat">
                    <div className="l">Token price</div>
                    <div className="v">{fmtPlain(l.token)}</div>
                  </div>
                  <div className="pd-tok-stat">
                    <div className="l">Target raise</div>
                    <div className="v">{fmt(l.units * l.token)}</div>
                  </div>
                  <div className="pd-tok-stat">
                    <div className="l">Ownership / token</div>
                    <div className="v">{(100 / l.units).toFixed(4)}%</div>
                  </div>
                </div>

                <h4 className="pd-sub">Capital allocation</h4>
                <div className="pd-alloc">
                  <span className="res" style={{ width: pct + "%" }} />
                </div>
                <div className="pd-alloc-key">
                  <span>
                    <i className="res" />
                    Reserved {pct}% · {fmt(raised)}
                  </span>
                  <span>
                    <i className="ava" />
                    Available {100 - pct}% · {fmt(avail * l.token)}
                  </span>
                </div>

                <h4 className="pd-sub">Returns &amp; distribution</h4>
                <table className="pd-fin">
                  <tbody>
                    <tr><td>Strategic investors</td><td>{l.roi} · priority tier</td></tr>
                    <tr><td>Corporate associates</td><td>7% incentive · performance tier</td></tr>
                    <tr><td>Promoter / parent org</td><td>Residual profit · post payouts</td></tr>
                  </tbody>
                </table>
              </>
            )}

            {tab === "Location" && (
              <>
                <h3>Location</h3>
                <div className="loc-line">
                  <Pin />
                  {l.loc}
                </div>
                <div className="pd-map">
                  <iframe src={mapSrc} title={"Map of " + l.loc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              </>
            )}

            <p className="note pd-disclaimer">
              Disclaimer: Figures shown are illustrative financial projections, not guaranteed
              returns. Tokenised land investments carry market and liquidity risk. Please verify all
              legal and market feasibility independently before investing.
            </p>
          </div>
        </div>

        {/* RIGHT — sticky invest card */}
        <aside className="pd-right">
          <InvestPanel l={l} />
        </aside>
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <section className="pd-similar">
          <div className="wrap">
            <div className="sec-head" style={{ marginBottom: "30px" }}>
              <span className="eyebrow">Keep exploring</span>
              <h2>
                Other <em>opportunities</em>
              </h2>
            </div>
            <div className="grid">
              {similar.map((x) => (
                <ListingCard key={x.id} l={x} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
