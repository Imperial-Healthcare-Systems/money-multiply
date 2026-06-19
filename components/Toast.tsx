"use client";

import { useMarketplace } from "@/context/MarketplaceContext";

export default function Toast() {
  const { toastMsg, toastShown } = useMarketplace();
  return (
    <div className={"toast" + (toastShown ? " show" : "")} id="toast">
      <span className="dot" />
      <span>{toastMsg}</span>
    </div>
  );
}
