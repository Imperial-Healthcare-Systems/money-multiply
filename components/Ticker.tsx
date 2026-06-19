"use client";

import { useMarketplace } from "@/context/MarketplaceContext";
import type { Listing } from "@/lib/types";

export default function Ticker() {
  const { listings, fmt } = useMarketplace();

  const Item = ({ l, k }: { l: Listing; k: string }) => {
    const pct = Math.round((l.sold / l.units) * 100);
    return (
      <span className="tk" key={k}>
        <span className="dot" />
        <b>{l.cat}</b> {l.title.split("—")[0].trim()} · {fmt(l.total)}{" "}
        <span className="up">▲ {l.roi.split(" ")[0]}</span> · {pct}% funded
      </span>
    );
  };

  // render twice for a seamless marquee loop
  const sequence = [...listings, ...listings];

  return (
    <div className="ticker">
      <div className="ticker-track" id="ticker">
        {sequence.map((l, i) => (
          <Item l={l} k={l.id + "-" + i} key={l.id + "-" + i} />
        ))}
      </div>
    </div>
  );
}
