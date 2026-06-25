"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import AdminGate from "./admin/AdminGate";
import AdminConsole from "./admin/AdminConsole";
import ChangePasscode from "./admin/ChangePasscode";

type View = "gate" | "panel" | "change";
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
  }, [open, isAdmin]);

  if (!open) return null;

  const cls = "modal open" + (win === "maxed" ? " maxed" : "") + (win === "mini" ? " mini" : "");

  return (
    <div
      className={cls}
      id="adminModal"
      onClick={(e) => {
        if (win === "mini" && (e.target as HTMLElement).closest(".box")) setWin("normal");
      }}
    >
      <div className="scrim" onClick={closeModal} />
      <div className="box wide" id="adminBox">
        {view === "gate" && <AdminGate />}
        {view === "panel" && (
          <AdminConsole
            onToggleMax={() => setWin((w) => (w === "maxed" ? "normal" : "maxed"))}
            onMinimize={() => setWin("mini")}
            onChangePasscode={() => setView("change")}
          />
        )}
        {view === "change" && <ChangePasscode onBack={() => setView("panel")} />}
      </div>
    </div>
  );
}
