import type { Listing, Lead } from "./types";
import { PROPS } from "./data";

/** Resolve the best image source for a listing. */
export function imgFor(l: Listing): string {
  if (l.customImg) return l.customImg;
  if (l.photo) return l.photo;
  if (typeof l.img === "number" && PROPS[l.img]) return PROPS[l.img];
  return PROPS[0];
}

export function fundedPct(l: Listing): number {
  return Math.min(100, Math.round((l.sold / l.units) * 100));
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d ago";
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export interface Aggregate {
  n: number;
  totalGMV: number;
  raised: number;
  tokensTotal: number;
  tokensSold: number;
  avgIrr: number;
  fundedPct: number;
  byCat: Record<string, number>;
}

export function aggregate(listings: Listing[]): Aggregate {
  const n = listings.length;
  let totalGMV = 0,
    raised = 0,
    tokensTotal = 0,
    tokensSold = 0,
    irrSum = 0;
  const byCat: Record<string, number> = {};
  listings.forEach((l) => {
    totalGMV += l.total;
    raised += l.sold * l.token;
    tokensTotal += l.units;
    tokensSold += l.sold;
    const m = (l.roi || "").match(/([0-9.]+)\s*%/);
    irrSum += m ? parseFloat(m[1]) : 0;
    byCat[l.cat] = (byCat[l.cat] || 0) + l.total;
  });
  return {
    n,
    totalGMV,
    raised,
    tokensTotal,
    tokensSold,
    avgIrr: n ? irrSum / n : 0,
    fundedPct: tokensTotal ? Math.round((tokensSold / tokensTotal) * 100) : 0,
    byCat,
  };
}

export function leadsToday(leads: Lead[]): number {
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  const t0 = d0.getTime();
  return leads.filter((l) => l.ts >= t0).length;
}

export function exportLeadsCSV(leads: Lead[], labelFor: (s: string) => string): void {
  const rows: string[][] = [["Source", "Contact", "Detail", "Date"]];
  leads.forEach((l) => {
    rows.push([
      labelFor(l.source),
      l.contact || "",
      (l.detail || "").replace(/"/g, "'"),
      new Date(l.ts).toLocaleString("en-IN"),
    ]);
  });
  const csv = rows
    .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "money-multiply-leads.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
