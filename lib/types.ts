export type Currency = "INR" | "USD" | "AED";

export type LeadSource = "news" | "wa" | "email" | "partner" | "investor";

export interface Listing {
  id: string;
  title: string;
  cat: string;
  loc: string;
  /** index into the default-artwork (PROPS) array */
  img: number;
  total: number;
  token: number;
  units: number;
  sold: number;
  roi: string;
  tenure?: string;
  size?: string;
  tag?: string;
  desc?: string;
  /** path to a bundled photo in /public/images */
  photo?: string;
  /** base64/data-URL uploaded by an admin (kept in localStorage) */
  customImg?: string;
}

export interface Lead {
  id: string;
  source: LeadSource;
  contact: string;
  detail: string;
  ts: number;
}

export interface ImagesManifest {
  emblem: string;
  fbLogo: string;
  props: string[];
  img: Record<string, string>;
  heroFrames: string[];
}
