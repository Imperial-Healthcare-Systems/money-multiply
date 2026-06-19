"use client";

import { useMemo, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import ListingCard from "./ListingCard";

export default function Marketplace() {
  const { listings } = useMarketplace();
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");

  const cats = useMemo(() => {
    const set: Record<string, true> = {};
    listings.forEach((l) => (set[l.cat] = true));
    return ["All", ...Object.keys(set)];
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return listings.filter((l) => {
      const okC = activeFilter === "All" || l.cat === activeFilter;
      const okQ = !q || (l.title + " " + l.loc + " " + l.cat).toLowerCase().indexOf(q) >= 0;
      return okC && okQ;
    });
  }, [listings, activeFilter, query]);

  return (
    <section className="sec" id="marketplace">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">The Marketplace</span>
          <h2>
            Live <em>land &amp; development</em> opportunities
          </h2>
          <p>
            Every listing is title-verified and structured for fractional ownership. Reserve your
            tokens online — a dedicated relationship manager closes the deal with you on WhatsApp.
          </p>
        </div>
        <div className="mkt-bar reveal">
          <div className="filters" id="filters">
            {cats.map((c) => (
              <button
                key={c}
                className={"filt" + (c === activeFilter ? " on" : "")}
                onClick={() => setActiveFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mkt-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              id="search"
              placeholder="Search location or asset…"
              aria-label="Search listings"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="grid" id="grid">
          {filtered.length === 0 ? (
            <div className="empty">
              <b>No matching assets</b>
              Try a different filter or search term — or check back soon as we add new land banks
              every month.
            </div>
          ) : (
            filtered.map((l) => <ListingCard key={l.id} l={l} />)
          )}
        </div>
      </div>
    </section>
  );
}
