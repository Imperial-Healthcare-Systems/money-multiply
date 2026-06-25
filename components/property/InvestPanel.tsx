"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { waInvest, mailEnquire } from "@/lib/links";
import { CONTACT_EMAIL } from "@/lib/data";
import { fundedPct } from "@/lib/utils";
import type { Listing } from "@/lib/types";

export default function InvestPanel({ l }: { l: Listing }) {
  const { fmtPlain, currency, captureLead } = useMarketplace();
  const maxT = Math.max(1, l.units - l.sold);
  const [tokens, setTokens] = useState(1);
  const clamp = (n: number) => Math.max(1, Math.min(maxT, isNaN(n) ? 1 : n));
  const pct = fundedPct(l);
  const avail = l.units - l.sold;

  return (
    <div className="pd-invest">
      <div className="pi-top">
        <div>
          <div className="k">Price per token</div>
          <div className="pi-price">{fmtPlain(l.token)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="k">Target return</div>
          <div className="pi-apy">{l.roi.split(" ")[0]}</div>
        </div>
      </div>

      <div className="pi-fund">
        <span>
          <b>{pct}%</b> funded
        </span>
        <span>{avail.toLocaleString("en-IN")} tokens left</span>
      </div>
      <div className="prog">
        <i style={{ width: pct + "%" }} />
      </div>

      <div className="pi-div" />

      <div className="pi-lab">Number of tokens</div>
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

      <div className="pi-rows">
        <div className="pi-row">
          <span>
            Subtotal ({tokens} × {fmtPlain(l.token)})
          </span>
          <span className="amt">{fmtPlain(l.token * tokens)}</span>
        </div>
        <div className="pi-row">
          <span>Share of project</span>
          <span className="amt">{((100 * tokens) / l.units).toFixed(4)}%</span>
        </div>
        <div className="pi-row total">
          <span>Total</span>
          <b>{fmtPlain(l.token * tokens)}</b>
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
        onClick={() => captureLead("email", CONTACT_EMAIL, l.title)}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        Enquire by email
      </a>

      <div className="pi-trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Title-verified · Closed personally on WhatsApp
      </div>
    </div>
  );
}
