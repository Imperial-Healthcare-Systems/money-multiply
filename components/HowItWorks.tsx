import { SECTION_IMAGES } from "@/lib/data";

export default function HowItWorks() {
  return (
    <section
      className="sec"
      id="how"
      style={{ background: "linear-gradient(180deg,transparent,rgba(14,44,32,.35),transparent)" }}
    >
      <div className="wrap">
        <div className="sec-head reveal up">
          <span className="eyebrow">How It Works</span>
          <h2>
            From browsing to <em>ownership</em>, in four steps
          </h2>
          <p>
            Tokenisation lets you own a verified fraction of a high-value asset — without the ticket
            size, paperwork, or guesswork of buying land alone.
          </p>
        </div>
        <div className="split reveal scale" style={{ marginBottom: "54px" }}>
          <div className="split-media magnet">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SECTION_IMAGES.howFlow} alt="Tokenised land flow" />
            <div className="floatcard">
              <div>
                <div className="fc-n">₹5,00,000</div>
                <div className="fc-l">Minimum entry</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="fc-n">19.6%</div>
                <div className="fc-l">Avg. target IRR</div>
              </div>
            </div>
          </div>
          <div>
            <span className="eyebrow">The model</span>
            <h2
              style={{
                fontFamily: "var(--ff-d)",
                fontWeight: 400,
                fontSize: "clamp(26px,3.4vw,40px)",
                lineHeight: 1.1,
                margin: "16px 0 14px",
              }}
            >
              Cash becomes a documented, fractional stake in real land.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15.5px", lineHeight: 1.7 }}>
              Your capital is pooled into a single, title-clear asset and held in a structured,
              transparent vehicle. Each token maps to a precise share of the project — so you always
              know exactly what you own.
            </p>
            <div className="proof">
              <span className="pchip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
                </svg>
                Title-verified
              </span>
              <span className="pchip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 17 9 11l4 4 8-8" />
                </svg>
                RERA-aligned
              </span>
              <span className="pchip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Documented
              </span>
            </div>
          </div>
        </div>
        <div className="steps reveal-stagger">
          <div className="step">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h4>Discover</h4>
            <p>Filter title-clear land banks and developments by location, ticket size and target return.</p>
          </div>
          <div className="step">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h4>Verify</h4>
            <p>Review the project cost, legal title, RERA status and the per-token economics — all upfront.</p>
          </div>
          <div className="step">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 10h18M7 15h4" />
            </svg>
            <h4>Reserve tokens</h4>
            <p>Choose how many tokens to hold. Your tokenised stake maps directly to your share of the asset.</p>
          </div>
          <div className="step">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5Z" />
            </svg>
            <h4>Close on WhatsApp</h4>
            <p>A relationship manager confirms allocation, documentation and payment — securely, with a human.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
