"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import { imgFor, fundedPct } from "@/lib/utils";
import { waEnquire } from "@/lib/links";
import type { Listing } from "@/lib/types";

export default function ListingCard({ l }: { l: Listing }) {
  const { fmt, fmtPlain, currency, openInvest, captureLead } = useMarketplace();
  const pct = fundedPct(l);
  const avail = l.units - l.sold;

  return (
    <article className="card reveal in tilt" data-tilt>
      <span className="sheen" />
      <div className="card-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgFor(l)} alt={l.title} loading="lazy" />
        <span className="card-tag">{l.tag || "Live"}</span>
        <span className="card-cat">{l.cat}</span>
      </div>
      <div className="card-body">
        <h3>{l.title}</h3>
        <div className="loc">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {l.loc}
        </div>
        <div className="metrics">
          <div className="metric">
            <div className="ml">Project cost</div>
            <div className="mv gold">{fmt(l.total)}</div>
          </div>
          <div className="metric">
            <div className="ml">Token price</div>
            <div className="mv">{fmtPlain(l.token)}</div>
          </div>
          <div className="metric">
            <div className="ml">Target IRR</div>
            <div className="mv">{l.roi.split(" ")[0]}</div>
          </div>
          <div className="metric">
            <div className="ml">Tenure</div>
            <div className="mv">{l.tenure || "—"}</div>
          </div>
        </div>
        <div className="token-line">
          <span className="tl">Funded</span>
          <span className="tv">{pct}%</span>
        </div>
        <div className="prog">
          <i style={{ width: pct + "%" }} />
        </div>
        <div className="subbar">
          <span>{avail.toLocaleString("en-IN")} tokens left</span>
          <span>{l.size}</span>
        </div>
        <div className="card-foot">
          <button className="btn-gold" onClick={() => openInvest(l.id)}>
            Invest in tokens
          </button>
          <a
            className="btn-wa"
            href={waEnquire(l, currency)}
            target="_blank"
            rel="noopener"
            aria-label="Enquire on WhatsApp"
            onClick={() => captureLead("wa", "WhatsApp enquiry", l.title)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
