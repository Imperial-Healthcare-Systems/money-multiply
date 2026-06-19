"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { imgFor } from "@/lib/utils";
import { waInvest, mailEnquire } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/data";

export default function InvestModal() {
  const { modal, getListing, closeModal, fmt, fmtPlain, currency, captureLead } = useMarketplace();
  const open = modal.type === "invest";
  const listing = open ? getListing(modal.listingId) : undefined;
  const [tokens, setTokens] = useState(1);

  useEffect(() => {
    if (open) setTokens(1);
  }, [open, modal.type === "invest" ? modal.listingId : null]);

  if (!open || !listing) return null;

  const l = listing;
  const maxT = Math.max(1, l.units - l.sold);
  const clamp = (n: number) => Math.max(1, Math.min(maxT, isNaN(n) ? 1 : n));

  return (
    <div className="modal open" id="investModal">
      <div className="scrim" onClick={closeModal} />
      <div className="box" id="investBox">
        <div className="mhead">
          <div>
            <h3>{l.title}</h3>
            <div className="sub">
              {l.loc} · {l.cat}
            </div>
          </div>
          <button className="mclose" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="mbody">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgFor(l)}
            alt={l.title}
            style={{ width: "100%", aspectRatio: "16/7", objectFit: "cover", borderRadius: "14px", marginBottom: "18px" }}
          />
          <p className="note" style={{ marginBottom: "18px", fontSize: "13.5px", color: "var(--muted)" }}>
            {l.desc}
          </p>
          <div className="metrics" style={{ marginBottom: "4px" }}>
            <div className="metric">
              <div className="ml">Total project cost</div>
              <div className="mv gold">{fmt(l.total)}</div>
            </div>
            <div className="metric">
              <div className="ml">Token price</div>
              <div className="mv">{fmtPlain(l.token)}</div>
            </div>
            <div className="metric">
              <div className="ml">Target return</div>
              <div className="mv">{l.roi}</div>
            </div>
            <div className="metric">
              <div className="ml">Tenure</div>
              <div className="mv">{l.tenure || "—"}</div>
            </div>
          </div>
          <div className="invest-calc">
            <div className="ic-row">
              <span className="icl">How many tokens?</span>
              <div className="stepper">
                <button onClick={() => setTokens((t) => clamp(t - 1))}>−</button>
                <input
                  type="number"
                  min={1}
                  max={maxT}
                  value={tokens}
                  onChange={(e) => setTokens(clamp(parseInt(e.target.value || "1", 10)))}
                />
                <button onClick={() => setTokens((t) => clamp(t + 1))}>+</button>
              </div>
            </div>
            <div className="ic-row" style={{ marginBottom: 0 }}>
              <span className="icl">Your investment</span>
              <span className="icv">{fmtPlain(l.token * tokens)}</span>
            </div>
            <div className="ic-total ic-row" style={{ marginBottom: 0 }}>
              <span className="icl">Share of project</span>
              <span className="icv">{((100 * tokens) / l.units).toFixed(4)}%</span>
            </div>
          </div>
          <a
            className="btn-gold"
            href={waInvest(l, tokens, currency)}
            target="_blank"
            rel="noopener"
            onClick={() => captureLead("wa", "WhatsApp enquiry", l.title)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
            </svg>
            Reserve on WhatsApp
          </a>
          <a
            className="btn-ghost"
            href={mailEnquire(l, currency)}
            style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "9px", padding: "13px", marginTop: "10px" }}
            onClick={() => captureLead("email", CONTACT_EMAIL, l.title)}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Or enquire by email
          </a>
          <p className="note" style={{ textAlign: "center" }}>
            You won&apos;t be charged here. A relationship manager confirms allocation, paperwork
            &amp; payment with you directly.
          </p>
        </div>
      </div>
    </div>
  );
}
