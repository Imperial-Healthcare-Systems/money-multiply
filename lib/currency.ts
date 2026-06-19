import type { Currency } from "./types";

export const RATES: Record<Currency, number> = {
  INR: 1,
  USD: 1 / 83.4,
  AED: 1 / 22.7,
};

export const SYM: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  AED: "د.إ ",
};

export const CURRENCIES: { code: Currency; sym: string }[] = [
  { code: "INR", sym: "₹ INR" },
  { code: "USD", sym: "$ USD" },
  { code: "AED", sym: "د.إ AED" },
];

/** Compact format with Cr/L (INR) or M/K (USD/AED). */
export function fmt(inr: number, cur: Currency): string {
  const v = inr * RATES[cur];
  let s: string;
  if (cur === "INR") {
    if (v >= 1e7) s = (v / 1e7).toFixed(v >= 1e8 ? 0 : 2) + " Cr";
    else if (v >= 1e5) s = (v / 1e5).toFixed(2) + " L";
    else s = Math.round(v).toLocaleString("en-IN");
  } else {
    if (v >= 1e6) s = (v / 1e6).toFixed(2) + "M";
    else if (v >= 1e3) s = (v / 1e3).toFixed(1) + "K";
    else s = Math.round(v).toLocaleString("en-US");
  }
  return SYM[cur] + s;
}

/** Plain grouped format (no Cr/L abbreviation). */
export function fmtPlain(inr: number, cur: Currency): string {
  const v = Math.round(inr * RATES[cur]);
  return SYM[cur] + v.toLocaleString(cur === "INR" ? "en-IN" : "en-US");
}
