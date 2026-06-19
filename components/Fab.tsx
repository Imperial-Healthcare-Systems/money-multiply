"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import { genericWa } from "@/lib/links";

export default function Fab() {
  const { captureLead } = useMarketplace();
  return (
    <a
      className="fab"
      href={genericWa()}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      onClick={() => captureLead("wa", "WhatsApp enquiry", "Floating button")}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2s-1.2.2-3.7-.8a12.6 12.6 0 0 1-5-4.4c-.4-.6-1.2-1.8-1.2-3.4s.8-2.4 1.1-2.7a1.2 1.2 0 0 1 .9-.4h.6c.2 0 .5 0 .7.6l1 2.4c0 .2.1.4 0 .6l-.5.7c-.2.2-.4.4-.2.8a8 8 0 0 0 3.7 3.2c.4.2.6.2.9-.1l.8-1c.2-.3.4-.2.7-.1l2.3 1.1c.3.2.5.2.6.3s.1.7-.1 1.5Z" />
      </svg>
    </a>
  );
}
