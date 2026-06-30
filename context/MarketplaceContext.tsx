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
import type { AppUser, BankDetails, Currency, Lead, LeadSource, Listing } from "@/lib/types";
import { SEED, PHOTO_POOL, IMG } from "@/lib/data";
import { fmt as fmtRaw, fmtPlain as fmtPlainRaw } from "@/lib/currency";

type ModalState =
  | { type: "none" }
  | { type: "invest"; listingId: string }
  | { type: "admin" }
  | { type: "associate" };

interface MarketplaceCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (inr: number) => string;
  fmtPlain: (inr: number) => string;
  // listings (server-backed)
  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  saveListing: (l: Listing) => Promise<{ ok: boolean; error?: string }>;
  deleteListing: (id: string) => Promise<{ ok: boolean }>;
  // leads (server-backed)
  leads: Lead[];
  captureLead: (source: LeadSource, contact: string, detail?: string) => void;
  clearLeads: () => Promise<void>;
  // admin
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  login: (passcode: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  // partner / investor accounts
  currentUser: AppUser | null;
  userReady: boolean;
  registerUser: (input: {
    role: "partner" | "investor";
    name: string;
    email: string;
    phone: string;
    password: string;
    referredBy?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  userLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  userLogout: () => Promise<void>;
  toggleSave: (listingId: string) => Promise<void>;
  isSaved: (listingId: string) => boolean;
  updateBank: (bank: BankDetails) => Promise<{ ok: boolean }>;
  saveProfile: (name: string, phone: string) => Promise<{ ok: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ ok: boolean; error?: string }>;
  // modals
  modal: ModalState;
  openInvest: (id: string) => void;
  openAdmin: () => void;
  openAssociate: () => void;
  closeModal: () => void;
  // toast
  toast: (msg: string) => void;
  toastMsg: string;
  toastShown: boolean;
  ready: boolean;
}

const Ctx = createContext<MarketplaceCtx | null>(null);

export function MarketplaceProvider({
  children,
  initialListings,
}: {
  children: React.ReactNode;
  initialListings?: Listing[];
}) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [listings, setListings] = useState<Listing[]>(
    initialListings?.length ? initialListings : SEED
  );
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [toastMsg, setToastMsg] = useState("Saved");
  const [toastShown, setToastShown] = useState(false);
  const [ready] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userReady, setUserReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- verify admin session on mount ---- */
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  /* ---- load partner/investor session on mount ---- */
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setCurrentUser(d.user as AppUser);
      })
      .catch(() => {})
      .finally(() => setUserReady(true));
  }, []);

  /* ---- load leads from the server whenever admin is authenticated ---- */
  useEffect(() => {
    if (!isAdmin) {
      setLeads([]);
      return;
    }
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.leads)) setLeads(d.leads as Lead[]);
      })
      .catch(() => {});
  }, [isAdmin]);

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

  /* ---- listings ---- */
  const getListing = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);

  const saveListing = useCallback(
    async (input: Listing): Promise<{ ok: boolean; error?: string }> => {
      const exists = listings.some((x) => x.id === input.id);
      let obj = input;
      if (!exists && !obj.customImg && !obj.photo) {
        const key = PHOTO_POOL[listings.length % PHOTO_POOL.length];
        if (IMG[key]) obj = { ...obj, photo: IMG[key] };
      }
      try {
        const res = await fetch(
          exists ? `/api/admin/listings/${obj.id}` : `/api/admin/listings`,
          {
            method: exists ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
          }
        );
        const d = await res.json().catch(() => ({}));
        if (res.ok && d.ok) {
          const saved: Listing = d.listing || obj;
          setListings((prev) =>
            exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]
          );
          return { ok: true };
        }
        return { ok: false, error: d.error || "server" };
      } catch {
        return { ok: false, error: "network" };
      }
    },
    [listings]
  );

  const deleteListing = useCallback(async (id: string): Promise<{ ok: boolean }> => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((x) => x.id !== id));
        return { ok: true };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }, []);

  /* ---- leads ---- */
  const captureLead = useCallback((source: LeadSource, contact: string, detail?: string) => {
    const optimistic: Lead = {
      id: "ld-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      source,
      contact: contact || "",
      detail: detail || "",
      ts: Date.now(),
    };
    setLeads((prev) => [optimistic, ...prev].slice(0, 1000));
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, contact, detail }),
    }).catch(() => {});
  }, []);

  const clearLeads = useCallback(async () => {
    try {
      await fetch("/api/admin/leads", { method: "DELETE" });
    } catch {}
    setLeads([]);
  }, []);

  /* ---- admin (server-backed) ---- */
  const login = useCallback(async (passcode: string, remember: boolean) => {
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, remember }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setIsAdmin(true);
        return { ok: true };
      }
      return { ok: false, error: d.error || "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsAdmin(false);
  }, []);

  /* ---- partner / investor accounts ---- */
  const registerUser = useCallback(
    async (input: {
      role: "partner" | "investor";
      name: string;
      email: string;
      phone: string;
      password: string;
      referredBy?: string;
    }) => {
      try {
        const r = await fetch("/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.ok) {
          setCurrentUser(d.user as AppUser);
          return { ok: true };
        }
        return { ok: false, error: d.error || "server" };
      } catch {
        return { ok: false, error: "network" };
      }
    },
    []
  );

  const userLogin = useCallback(async (email: string, password: string) => {
    try {
      const r = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setCurrentUser(d.user as AppUser);
        return { ok: true };
      }
      return { ok: false, error: d.error || "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const r = await fetch("/api/user/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) return { ok: true };
      return { ok: false, error: d.error || "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const userLogout = useCallback(async () => {
    try {
      await fetch("/api/user/logout", { method: "POST" });
    } catch {}
    setCurrentUser(null);
  }, []);

  const toggleSave = useCallback(async (listingId: string) => {
    try {
      const r = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok && Array.isArray(d.saved)) {
        setCurrentUser((u) => (u ? { ...u, saved: d.saved as string[] } : u));
      }
    } catch {}
  }, []);

  const isSaved = useCallback(
    (listingId: string) => !!currentUser?.saved?.includes(listingId),
    [currentUser]
  );

  const saveProfile = useCallback(async (name: string, phone: string) => {
    try {
      const r = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setCurrentUser(d.user as AppUser);
        return { ok: true };
      }
      return { ok: false, error: d.error || "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setCurrentUser(d.user as AppUser);
        return { ok: true };
      }
      return { ok: false, error: d.error || "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const updateBank = useCallback(async (bank: BankDetails) => {
    try {
      const r = await fetch("/api/user/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bank),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setCurrentUser((u) => (u ? { ...u, bank: d.bank as BankDetails } : u));
        return { ok: true };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }, []);

  /* ---- modals ---- */
  const openInvest = useCallback((id: string) => setModal({ type: "invest", listingId: id }), []);
  const openAdmin = useCallback(() => setModal({ type: "admin" }), []);
  const openAssociate = useCallback(() => setModal({ type: "associate" }), []);
  const closeModal = useCallback(() => setModal({ type: "none" }), []);

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
      currentUser,
      userReady,
      registerUser,
      userLogin,
      forgotPassword,
      userLogout,
      toggleSave,
      isSaved,
      updateBank,
      saveProfile,
      uploadAvatar,
      modal,
      openInvest,
      openAdmin,
      openAssociate,
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
      currentUser,
      userReady,
      registerUser,
      userLogin,
      forgotPassword,
      userLogout,
      toggleSave,
      isSaved,
      updateBank,
      saveProfile,
      uploadAvatar,
      modal,
      openInvest,
      openAdmin,
      openAssociate,
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
