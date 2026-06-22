"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Currency, Lead, LeadSource, Listing } from "@/lib/types";
import { SEED, PHOTO_POOL, IMG } from "@/lib/data";
import { fmt as fmtRaw, fmtPlain as fmtPlainRaw } from "@/lib/currency";
import { readSession, writeSession, clearSession } from "@/lib/auth";

const KEY = "mm_marketplace_v3";
const LEADKEY = "mm_leads_v1";

type ModalState =
  | { type: "none" }
  | { type: "invest"; listingId: string }
  | { type: "admin" };

interface MarketplaceCtx {
  // currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (inr: number) => string;
  fmtPlain: (inr: number) => string;
  // listings
  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  saveListing: (l: Listing) => void;
  deleteListing: (id: string) => void;
  // leads
  leads: Lead[];
  captureLead: (source: LeadSource, contact: string, detail?: string) => void;
  clearLeads: () => void;
  // admin
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  login: (remember: boolean) => void;
  logout: () => void;
  // modals
  modal: ModalState;
  openInvest: (id: string) => void;
  openAdmin: () => void;
  closeModal: () => void;
  // toast
  toast: (msg: string) => void;
  toastMsg: string;
  toastShown: boolean;
  // hydration flag (client storage loaded)
  ready: boolean;
}

const Ctx = createContext<MarketplaceCtx | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [listings, setListings] = useState<Listing[]>(SEED);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [toastMsg, setToastMsg] = useState("Saved");
  const [toastShown, setToastShown] = useState(false);
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- hydrate from localStorage after mount ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.listings?.length) setListings(parsed.listings as Listing[]);
      }
    } catch {}
    try {
      const lr = localStorage.getItem(LEADKEY);
      if (lr) {
        const parsed = JSON.parse(lr);
        if (Array.isArray(parsed)) setLeads(parsed as Lead[]);
      }
    } catch {}
    if (readSession()) setIsAdmin(true);
    setReady(true);
  }, []);

  /* ---- persist listings + leads ---- */
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ listings }));
    } catch {}
  }, [listings, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LEADKEY, JSON.stringify(leads));
    } catch {}
  }, [leads, ready]);

  /* ---- formatting bound to currency ---- */
  const fmt = useCallback((inr: number) => fmtRaw(inr, currency), [currency]);
  const fmtPlain = useCallback((inr: number) => fmtPlainRaw(inr, currency), [currency]);

  /* ---- toast ---- */
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShown(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShown(false), 2600);
  }, []);

  /* ---- listings CRUD ---- */
  const getListing = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);

  const saveListing = useCallback(
    (obj: Listing) => {
      setListings((prev) => {
        const exists = prev.some((x) => x.id === obj.id);
        if (exists) return prev.map((x) => (x.id === obj.id ? obj : x));
        // assign a default photo for brand-new listings without a custom image
        if (!obj.customImg && !obj.photo) {
          const key = PHOTO_POOL[prev.length % PHOTO_POOL.length];
          if (IMG[key]) obj = { ...obj, photo: IMG[key] };
        }
        return [obj, ...prev];
      });
    },
    []
  );

  const deleteListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((x) => x.id !== id));
  }, []);

  /* ---- leads ---- */
  const captureLead = useCallback((source: LeadSource, contact: string, detail?: string) => {
    const lead: Lead = {
      id: "ld-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      source,
      contact: contact || "",
      detail: detail || "",
      ts: Date.now(),
    };
    setLeads((prev) => [lead, ...prev].slice(0, 500));
  }, []);

  const clearLeads = useCallback(() => setLeads([]), []);

  /* ---- admin ---- */
  const login = useCallback((remember: boolean) => {
    setIsAdmin(true);
    if (remember) writeSession(7);
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    clearSession();
  }, []);

  /* ---- modals ---- */
  const openInvest = useCallback((id: string) => setModal({ type: "invest", listingId: id }), []);
  const openAdmin = useCallback(() => setModal({ type: "admin" }), []);
  const closeModal = useCallback(() => setModal({ type: "none" }), []);

  /* ---- lock body scroll while a modal is open ---- */
  useEffect(() => {
    document.body.style.overflow = modal.type === "none" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal.type]);

  const value = useMemo<MarketplaceCtx>(
    () => ({
      currency,
      setCurrency,
      fmt,
      fmtPlain,
      listings,
      getListing,
      saveListing,
      deleteListing,
      leads,
      captureLead,
      clearLeads,
      isAdmin,
      setIsAdmin,
      login,
      logout,
      modal,
      openInvest,
      openAdmin,
      closeModal,
      toast,
      toastMsg,
      toastShown,
      ready,
    }),
    [
      currency,
      fmt,
      fmtPlain,
      listings,
      getListing,
      saveListing,
      deleteListing,
      leads,
      captureLead,
      clearLeads,
      isAdmin,
      login,
      logout,
      modal,
      openInvest,
      openAdmin,
      closeModal,
      toast,
      toastMsg,
      toastShown,
      ready,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMarketplace(): MarketplaceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarketplace must be used within MarketplaceProvider");
  return ctx;
}
