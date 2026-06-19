import type { Currency, Listing } from "./types";
import { WA, EMAIL } from "./data";
import { fmtPlain } from "./currency";

export function waLink(msg: string): string {
  return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
}

export function mailLink(subject: string, body: string): string {
  return (
    "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
  );
}

export function enquiryMsg(l: Listing, cur: Currency): string {
  return (
    "Hello Money Multiply, I'm interested in *" +
    l.title +
    "* (" +
    l.loc +
    ").\nTotal project cost: " +
    fmtPlain(l.total, cur) +
    "\nToken price: " +
    fmtPlain(l.token, cur) +
    "\nPlease share the investment details and next steps."
  );
}

export function waEnquire(l: Listing, cur: Currency): string {
  return waLink(enquiryMsg(l, cur));
}

export function mailEnquire(l: Listing, cur: Currency): string {
  return mailLink("Enquiry: " + l.title, enquiryMsg(l, cur));
}

export function waInvest(l: Listing, tokens: number, cur: Currency): string {
  const amt = tokens * l.token;
  return waLink(
    "Hello Money Multiply, I'd like to reserve *" +
      tokens +
      " token(s)* in *" +
      l.title +
      "* (" +
      l.loc +
      ").\nToken price: " +
      fmtPlain(l.token, cur) +
      "\nMy investment: " +
      fmtPlain(amt, cur) +
      "\nProject cost: " +
      fmtPlain(l.total, cur) +
      "\nPlease confirm my allocation and next steps."
  );
}

export const GENERIC_MSG =
  "Hello Money Multiply, I'd like to know more about your tokenised land investment opportunities.";

export function genericWa(): string {
  return waLink(GENERIC_MSG);
}

export function genericMail(): string {
  return mailLink("Investment enquiry — Money Multiply", GENERIC_MSG);
}
