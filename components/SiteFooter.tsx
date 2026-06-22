"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { SECTION_IMAGES, PHONE_TEL, CONTACT_EMAIL } from "@/lib/data";

const FOOTER_LOGO = "/images/logo-mark.png";
import { genericWa, genericMail } from "@/lib/links";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function SiteFooter() {
  const { captureLead, toast } = useMarketplace();
  const [email, setEmail] = useState("");

  const subscribe = () => {
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      toast("Please enter a valid email");
      return;
    }
    captureLead("news", v, "Newsletter subscription");
    setEmail("");
    toast("Subscribed — welcome aboard");
  };

  return (
    <footer className="site" id="siteFooter">
      <div className="foot-cta">
        <div className="wrap reveal">
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            Begin Today
          </span>
          <h2>
            Your stake in the <em>next India</em> starts with one token.
          </h2>
          <p>
            Talk to a Money Multiply relationship manager on WhatsApp, or drop us an email. No
            obligation — just a clear, honest conversation about the assets that fit you.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              className="btn-gold"
              href={genericWa()}
              target="_blank"
              rel="noopener"
              style={{ padding: "15px 30px", fontSize: "15px" }}
              onClick={() => captureLead("wa", "WhatsApp enquiry", "Footer CTA")}
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
              </svg>
              Chat with a manager
            </a>
            <a
              className="btn-ghost"
              href={genericMail()}
              style={{ padding: "15px 28px", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "9px" }}
              onClick={() => captureLead("email", CONTACT_EMAIL, "Footer CTA")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Email the team
            </a>
          </div>
        </div>
      </div>

      <div className="foot-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="foot-archi" src={SECTION_IMAGES.footArchi} alt="" />
        <div className="wrap">
          <div className="foot-rule" />
          <div className="foot-cols reveal">
            <div className="foot-brandblock">
              <div className="fb-top">
                <span className="fb-logo" style={{ width: "auto", aspectRatio: "auto", background: "transparent", border: "none", boxShadow: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FOOTER_LOGO} alt="Money Multiply — Trading & Consultant" style={{ width: "auto", height: "84px", objectFit: "contain" }} />
                </span>
                <span className="fbt">
                  <b>Money Multiply</b>
                  <span>The Land Bankers &amp; Traders</span>
                </span>
              </div>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a href="#about"><i className="fchev">›</i>About Us</a>
              <a href="#about"><i className="fchev">›</i>Our Mission</a>
              <a href="#about"><i className="fchev">›</i>Leadership</a>
              <a href="#about"><i className="fchev">›</i>Careers</a>
              <a
                href={genericWa()}
                target="_blank"
                rel="noopener"
                onClick={() => captureLead("wa", "WhatsApp enquiry", "Contact Us")}
              >
                <i className="fchev">›</i>Contact Us
              </a>
            </div>
            <div className="foot-col">
              <h5>Investments</h5>
              <a href="#marketplace"><i className="fchev">›</i>Marketplace</a>
              <a href="#marketplace"><i className="fchev">›</i>Tokenised Properties</a>
              <a href="#how"><i className="fchev">›</i>How It Works</a>
              <a
                href={genericWa()}
                target="_blank"
                rel="noopener"
                onClick={() => captureLead("wa", "WhatsApp enquiry", "Investor Portal")}
              >
                <i className="fchev">›</i>Investor Portal
              </a>
              <a href="#marketplace"><i className="fchev">›</i>Investment Tiers</a>
            </div>
            <div className="foot-col">
              <h5>Resources</h5>
              <a href="#"><i className="fchev">›</i>Blog</a>
              <a href="#"><i className="fchev">›</i>Guides &amp; Insights</a>
              <a href="#"><i className="fchev">›</i>FAQs</a>
              <a href="#"><i className="fchev">›</i>Reports</a>
              <a href="#"><i className="fchev">›</i>Webinars</a>
            </div>
            <div className="foot-col">
              <h5>Legal</h5>
              <a href="#"><i className="fchev">›</i>Privacy Policy</a>
              <a href="#"><i className="fchev">›</i>Terms of Use</a>
              <a href="#"><i className="fchev">›</i>Risk Disclosure</a>
              <a href="#"><i className="fchev">›</i>Token Disclaimer</a>
              <a href="#"><i className="fchev">›</i>Compliance</a>
            </div>
          </div>

          <div className="foot-news reveal">
            <div className="fn-left">
              <span className="fn-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <div>
                <h4>Stay updated</h4>
                <p>Subscribe to our newsletter for the latest investment opportunities and market insights.</p>
              </div>
            </div>
            <div className="fn-form">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && subscribe()}
              />
              <button className="btn-gold" onClick={subscribe}>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="foot-contact">
        <div className="wrap">
          <a className="fc-item" href={"tel:" + PHONE_TEL}>
            <span className="fc-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            9911176822
          </a>
          <span className="fc-div" />
          <a
            className="fc-item"
            href={genericMail()}
            onClick={() => captureLead("email", CONTACT_EMAIL, "Footer contact")}
          >
            <span className="fc-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            {CONTACT_EMAIL}
          </a>
          <span className="fc-div" />
          <a className="fc-item" href="#">
            <span className="fc-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
              </svg>
            </span>
            moneymultiplyglobal.com
          </a>
          <div className="foot-soc">
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.5 8h4V24h-4V8Zm7 0h3.8v2.2h.1c.5-1 1.8-2.2 3.9-2.2 4.2 0 5 2.7 5 6.3V24h-4v-7.1c0-1.7 0-3.9-2.4-3.9s-2.7 1.8-2.7 3.7V24h-4V8Z" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.1L7.5 21H4.5l7.4-8.5L4 3h6.5l4.5 5.6L17.5 3Zm-1 16h1.7L7.5 4.8H5.7L16.5 19Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="foot-bot">
        <div
          className="wrap"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", width: "100%", textAlign: "center" }}
        >
          <p>© 2026 Money Multiply Trading &amp; Consultant Pvt. Ltd. · All rights reserved.</p>
          <p style={{ opacity: 0.75 }}>
            Real Estate Tokenisation Platform · Fractional Ownership · Global Opportunities
          </p>
        </div>
      </div>
    </footer>
  );
}
