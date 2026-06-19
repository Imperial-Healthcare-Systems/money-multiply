"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import AdminGate from "./admin/AdminGate";
import AdminReset from "./admin/AdminReset";
import AdminConsole from "./admin/AdminConsole";

type View = "gate" | "reset" | "panel";
type Win = "normal" | "maxed" | "mini";

export default function AdminModal() {
  const { modal, isAdmin, closeModal } = useMarketplace();
  const open = modal.type === "admin";
  const [view, setView] = useState<View>("gate");
  const [win, setWin] = useState<Win>("normal");

  useEffect(() => {
    if (open) {
      setView(isAdmin ? "panel" : "gate");
      setWin("normal");
    }
    // re-sync the view when auth state flips while open (login/logout)
  }, [open, isAdmin]);

  if (!open) return null;

  const cls = "modal open" + (win === "maxed" ? " maxed" : "") + (win === "mini" ? " mini" : "");

  return (
    <div
      className={cls}
      id="adminModal"
      onClick={(e) => {
        // clicking the minimized dock restores it
        if (win === "mini" && (e.target as HTMLElement).closest(".box")) setWin("normal");
      }}
    >
      <div className="scrim" onClick={closeModal} />
      <div className="box wide" id="adminBox">
        {view === "gate" && <AdminGate onForgot={() => setView("reset")} />}
        {view === "reset" && <AdminReset onBack={() => setView("gate")} />}
        {view === "panel" && (
          <AdminConsole
            onToggleMax={() => setWin((w) => (w === "maxed" ? "normal" : "maxed"))}
            onMinimize={() => setWin("mini")}
          />
        )}
      </div>
    </div>
  );
}
