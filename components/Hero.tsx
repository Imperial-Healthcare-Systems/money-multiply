"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { HERO_FRAMES } from "@/lib/data";
import { fundedPct } from "@/lib/utils";

interface Firefly {
  left: number;
  top: number;
  size: number;
  dur: number;
  delay: number;
  opacity: number;
  variant: number;
  twDur: number;
}

export default function Hero() {
  const { listings, fmt, fmtPlain, openInvest } = useMarketplace();
  const [frame, setFrame] = useState(0);
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const bgRef = useRef<HTMLDivElement>(null);
  const featured = listings[0];

  /* rotate frames */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce || HERO_FRAMES.length < 2) return;
    const t = setInterval(() => setFrame((i) => (i + 1) % HERO_FRAMES.length), 6500);
    return () => clearInterval(t);
  }, []);

  /* fireflies + injected keyframes + parallax */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce) return;
    const n = window.innerWidth < 760 ? 12 : 24;
    const list: Firefly[] = [];
    for (let k = 0; k < n; k++) {
      list.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        dur: 6 + Math.random() * 10,
        delay: Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.5,
        variant: k % 3,
        twDur: 2 + Math.random() * 2,
      });
    }
    setFireflies(list);

    let css = "";
    for (let i = 0; i < 3; i++) {
      const dx = Math.random() * 60 - 30;
      const dy = Math.random() * -50 - 20;
      css += `@keyframes fly${i}{to{transform:translate(${dx}px,${dy}px)}}`;
    }
    css += "@keyframes tw{0%,100%{opacity:.2}50%{opacity:.9}}";
    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight && bgRef.current) {
        bgRef.current.style.transform = "translateY(" + y * 0.18 + "px)";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      styleEl.remove();
    };
  }, []);

  return (
    <section className="hero" id="home">
      <div className="heroBg" id="heroBg" ref={bgRef}>
        {HERO_FRAMES.map((src, i) => (
          <div
            key={i}
            className={"frame f" + (i % 3) + (i === frame ? " on" : "")}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
      </div>
      <div className="hero-veil" />
      <div className="fireflies" id="fireflies">
        {fireflies.map((f, i) => (
          <span
            key={i}
            className="firefly"
            style={{
              left: f.left + "%",
              top: f.top + "%",
              width: f.size + "px",
              height: f.size + "px",
              opacity: f.opacity,
              animation: `fly${f.variant} ${f.dur}s ease-in-out ${f.delay}s infinite alternate, tw ${f.twDur}s ease-in-out ${f.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Invest · Trade · Grow · Multiply</span>
            <h1>
              Own a fraction of the
              <br />
              <em>land that builds India.</em>
            </h1>
            <p className="lede">
              A curated marketplace for title-clear land banks and Grade-A developments across the
              Greater Noida growth corridor — now investable in tokenised sizes from ₹5,00,000.
            </p>
            <div className="hero-cta">
              <a className="btn-gold" href="#marketplace">
                Browse the marketplace
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a className="btn-ghost" href="#how">
                How tokenised land works
              </a>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <div className="n">₹4,200 Cr+</div>
                <div className="l">Assets Mapped</div>
              </div>
              <div className="hstat">
                <div className="n">11,400+</div>
                <div className="l">Investors</div>
              </div>
              <div className="hstat">
                <div className="n">19.6%</div>
                <div className="l">Avg. Target IRR</div>
              </div>
            </div>
          </div>
          <aside className="hero-card" id="featuredCard">
            {featured && (
              <>
                <div className="hc-top">
                  <span className="chip">★ Featured asset</span>
                  <span className="chip">{featured.cat}</span>
                </div>
                <div className="hc-title">{featured.title}</div>
                <div className="hc-loc">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {featured.loc}
                </div>
                <div className="hc-rows">
                  <div className="hc-row">
                    <span className="k">Total project cost</span>
                    <span className="v gold">{fmt(featured.total)}</span>
                  </div>
                  <div className="hc-row">
                    <span className="k">Token price</span>
                    <span className="v">{fmtPlain(featured.token)}</span>
                  </div>
                  <div className="hc-row">
                    <span className="k">Target return</span>
                    <span className="v">{featured.roi}</span>
                  </div>
                  <div className="hc-row" style={{ display: "block", borderBottom: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span className="k">Funded</span>
                      <span className="v gold">{fundedPct(featured)}%</span>
                    </div>
                    <div className="prog">
                      <i style={{ width: fundedPct(featured) + "%" }} />
                    </div>
                  </div>
                </div>
                <button
                  className="btn-gold"
                  style={{ width: "100%", justifyContent: "center", marginTop: "18px", padding: "13px" }}
                  onClick={() => openInvest(featured.id)}
                >
                  Invest from {fmtPlain(featured.token)}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
      <div className="scrollcue">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
