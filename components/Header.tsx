"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { CURRENCIES } from "@/lib/currency";
import MobileDrawer from "./MobileDrawer";

const HEADER_LOGO = "/images/MM_Icon.png";

const NAV = [
  { href: "#marketplace", label: "Marketplace" },
  { href: "#how", label: "How It Works" },
  { href: "#why", label: "Why Invest" },
  { href: "#about", label: "About" },
  { href: "#stats", label: "Global Stats" },
];

const CurrencyFlag = ({ code }: { code: string }) => {
  if (code === "INR")
    return (
      <svg className="flag" viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="4" y="0" fill="#FF9933" />
        <rect width="18" height="4" y="4" fill="#fff" />
        <rect width="18" height="4" y="8" fill="#138808" />
        <circle cx="9" cy="6" r="1.5" fill="none" stroke="#0a3a8c" strokeWidth=".5" />
        <circle cx="9" cy="6" r=".35" fill="#0a3a8c" />
      </svg>
    );
  if (code === "USD")
    return (
      <svg className="flag" viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="12" fill="#b22234" />
        <rect width="18" height="1.4" y="1.4" fill="#fff" />
        <rect width="18" height="1.4" y="4.2" fill="#fff" />
        <rect width="18" height="1.4" y="7" fill="#fff" />
        <rect width="18" height="1.4" y="9.8" fill="#fff" />
        <rect width="8" height="6.5" fill="#3c3b6e" />
      </svg>
    );
  return (
    <svg className="flag" viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="4" y="0" fill="#00843D" />
      <rect width="18" height="4" y="4" fill="#fff" />
      <rect width="18" height="4" y="8" fill="#000" />
      <rect width="5" height="12" fill="#FF0000" />
    </svg>
  );
};

export default function Header() {
  const { currency, setCurrency, openAdmin } = useMarketplace();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("marketplace");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    const secs = ["marketplace", "how", "why", "about", "stats"];
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 300);
      setScrolled(y > 10);
      last = y;
      const probe = window.scrollY + 160;
      let cur = "marketplace";
      secs.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) cur = id;
      });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={"site" + (scrolled ? " scrolled" : "")} id="hdr" style={{ transform: hidden ? "translateY(-100%)" : "none" }}>
        <div className="topbar">
          <div className="wrap">
            <div className="tb-left">
              <svg className="tb-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
              </svg>
              <span>Global Land &amp; Tokenised Investment Platform · Greater Noida, India</span>
            </div>
            <div className="currGrp" id="currGrp">
              {CURRENCIES.map((c, i) => (
                <span key={c.code} style={{ display: "contents" }}>
                  {i > 0 && <span className="tb-div" />}
                  <button
                    className={"curr" + (currency === c.code ? " on" : "")}
                    onClick={() => setCurrency(c.code)}
                  >
                    <CurrencyFlag code={c.code} />
                    <span className="sym">{c.sym}</span>
                    <span className="chev">⌄</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="navbar">
          <div className="wrap nav-in">
            <a className="brand" href="#home" aria-label="Money Multiply home">
              <span className="mk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HEADER_LOGO} alt="Money Multiply emblem" />
              </span>
              <span className="bt">
                <span className="b1">Money Multiply</span>
                <span className="b2">The Land Bankers &amp; Traders</span>
              </span>
            </a>
            <nav className="links" id="links">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className={active === n.href.slice(1) ? "on" : ""}>
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="nav-right">
              <button className="btn-ghost" onClick={openAdmin}>
                Admin
              </button>
              <a className="btn-gold" href="#marketplace">
                Start Investing
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <button
                className={"menuBtn" + (drawerOpen ? " x" : "")}
                aria-label="Open menu"
                onClick={() => setDrawerOpen((o) => !o)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdmin={() => {
          setDrawerOpen(false);
          openAdmin();
        }}
      />
    </>
  );
}
