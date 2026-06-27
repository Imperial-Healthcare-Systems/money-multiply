"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import { SECTION_IMAGES } from "@/lib/data";
import { genericWa } from "@/lib/links";

const LEAD_TAGS = [
  "Real Estate Investment",
  "Land Acquisition",
  "Investor Relations",
  "Indian & Global Markets",
  "Risk & Advisory",
  "Strategic Planning",
];

const TIMELINE = [
  { ty: "Real Estate", h: "Property & land advisory", p: "Consulting, land acquisition, project marketing and investment planning across the NCR region." },
  { ty: "Digital Assets", h: "Global crypto markets", p: "Trading, market analysis and portfolio management in international cryptocurrency markets." },
  { ty: "Equities", h: "Indian stock market", p: "Equity trading and long-horizon investment strategies grounded in fundamentals." },
  { ty: "International", h: "Global market research", p: "Cross-border research and the discovery of international investment opportunities." },
];

export default function About() {
  const { captureLead } = useMarketplace();

  return (
    <section className="sec" id="about">
      <div className="wrap">
        <div className="sec-head reveal up">
          <span className="eyebrow">About Us</span>
          <h2>
            Built on <em>trust</em>, led by experience
          </h2>
          <p>
            Money Multiply — The Land Bankers &amp; Traders exists to make institutional-grade land
            accessible to everyday investors. Technology surfaces the opportunity; seasoned
            professionals close it.
          </p>
        </div>

        <div className="split reveal scale" style={{ marginBottom: "64px" }}>
          <div>
            <span className="eyebrow">Our story</span>
            <h2
              style={{
                fontFamily: "var(--ff-d)",
                fontWeight: 400,
                fontSize: "clamp(26px,3.4vw,40px)",
                lineHeight: 1.1,
                margin: "16px 0 14px",
              }}
            >
              A marketplace that opens land to everyone.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15.5px", lineHeight: 1.7, marginBottom: "14px" }}>
              For decades, the best land deals in India were closed behind closed doors — reserved
              for those with crores to deploy and the right relationships. We are changing that.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "15.5px", lineHeight: 1.7 }}>
              By tokenising title-clear assets into small, documented fractions, we let everyday
              investors own a real stake in India&apos;s growth corridors — with the diligence,
              transparency and human guidance the asset class deserves.
            </p>
            <div className="proof">
              <span className="pchip pp" style={{ animationDelay: "0s" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 21h18M5 21V9l7-5 7 5v12" />
                </svg>
                Land banking
              </span>
              <span className="pchip pp" style={{ animationDelay: ".4s" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 17 9 11l4 4 8-8" />
                </svg>
                Market expertise
              </span>
              <span className="pchip pp" style={{ animationDelay: ".8s" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Investor-first
              </span>
            </div>
          </div>
          <div className="split-media magnet">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SECTION_IMAGES.aboutMedia} alt="Money Multiply leadership" />
            <div className="floatcard">
              <div>
                <div className="fc-n">12+ yrs</div>
                <div className="fc-l">Leadership experience</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="fc-n">4</div>
                <div className="fc-l">Markets mastered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="sec-head reveal up" style={{ marginBottom: "30px" }}>
          <span className="eyebrow">Leadership</span>
          <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)" }}>The people behind the platform</h2>
        </div>
        <div className="lead-card reveal scale">
          <div className="lead-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ashutosh.jpg" alt="Ashutosh Kumar Mishra" />
          </div>
          <div className="lead-info">
            <h3>Ashutosh Kumar Mishra</h3>
            <div className="role">Founder · Real Estate &amp; Investment Consultant</div>
            <p>
              A business leader with over twelve years of experience across real estate, investment
              consulting, financial markets, and sales &amp; advisory — committed to delivering
              strategic solutions and long-term value to every client and stakeholder.
            </p>
            <p style={{ marginTop: "12px" }}>
              His expertise spans property consulting and land acquisition, project marketing, equity
              and global market analysis, and building transparent, lasting investor relationships.
            </p>
            <div className="lead-tags">
              {LEAD_TAGS.map((t) => (
                <span className="lead-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Career timeline + vision/mission */}
        <div className="split" style={{ marginTop: "54px", alignItems: "start" }}>
          <div className="reveal left">
            <span className="eyebrow">Track record</span>
            <h3
              style={{
                fontFamily: "var(--ff-d)",
                fontWeight: 400,
                fontSize: "clamp(22px,2.8vw,32px)",
                margin: "14px 0 6px",
              }}
            >
              A career across markets
            </h3>
            <div className="tl">
              {TIMELINE.map((t) => (
                <div className="tl-item" key={t.h}>
                  <div className="ty">{t.ty}</div>
                  <h5>{t.h}</h5>
                  <p>{t.p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal right">
            <span className="eyebrow">What guides us</span>
            <div className="vm-grid">
              <div className="vm-card">
                <div className="vm-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
                <h4>Vision</h4>
                <p>
                  To build long-term, transparent, value-driven relationships — helping people
                  identify genuinely profitable investment opportunities.
                </p>
              </div>
              <div className="vm-card">
                <div className="vm-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </div>
                <h4>Mission</h4>
                <p>
                  To deliver ethical investment guidance, promote transparency, and create
                  sustainable wealth-generation for every investor.
                </p>
              </div>
            </div>
            <div className="vm-card" style={{ marginTop: "24px" }}>
              <div className="vm-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5Z" />
                </svg>
              </div>
              <h4>Talk to leadership</h4>
              <p style={{ marginBottom: "16px" }}>
                Have a question about an asset or a custom mandate? Reach the team directly.
              </p>
              <a
                className="btn-gold"
                href={genericWa()}
                target="_blank"
                rel="noopener"
                style={{ justifyContent: "center" }}
                onClick={() => captureLead("wa", "WhatsApp enquiry", "Leadership enquiry")}
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
                </svg>
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Trust pillars */}
        <div className="sec-head reveal up" style={{ margin: "64px 0 30px" }}>
          <span className="eyebrow">Trust &amp; Security</span>
          <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)" }}>
            Built for <em>confidence</em>, closed by people
          </h2>
        </div>
        <div className="pillars reveal-stagger">
          <div className="pillar">
            <div className="pic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
              </svg>
            </div>
            <h4>Legal-first diligence</h4>
            <p>Title search, encumbrance checks and RERA alignment before a listing ever goes live.</p>
          </div>
          <div className="pillar">
            <div className="pic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5Z" />
              </svg>
            </div>
            <h4>Human relationship managers</h4>
            <p>Every reservation is confirmed and closed by a named manager over WhatsApp — never a faceless form.</p>
          </div>
          <div className="pillar">
            <div className="pic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="4" y="9" width="16" height="11" rx="2" />
                <path d="M8 9V6a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <h4>Documented ownership</h4>
            <p>Your tokenised allocation maps to clear paperwork at every step of the holding period.</p>
          </div>
        </div>

        <div
          className="reveal scale"
          style={{
            marginTop: "64px",
            padding: "48px 20px",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            background: "linear-gradient(165deg,rgba(15,30,23,.4),transparent)",
          }}
        >
          <p className="quote">
            &quot;With over a decade across real estate and financial markets, we are committed to
            delivering <em>strategic solutions and long-term value</em> to every client and
            stakeholder.&quot;
          </p>
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--ff-m)",
              fontSize: "12px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--brass-lt)",
              marginTop: "22px",
            }}
          >
            — Ashutosh Kumar Mishra, Founder
          </p>
        </div>
      </div>
    </section>
  );
}
