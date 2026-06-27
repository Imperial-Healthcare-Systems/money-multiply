import "server-only";
import { supabaseAdmin } from "./supabase-admin";
import { SEED } from "./data";
import type { Listing } from "./types";

const TABLE = "mm_listings";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToListing(r: any): Listing {
  return {
    id: r.id,
    title: r.title,
    cat: r.cat,
    loc: r.loc,
    img: r.img ?? 0,
    total: Number(r.total) || 0,
    token: Number(r.token) || 0,
    units: Number(r.units) || 1,
    sold: Number(r.sold) || 0,
    roi: r.roi || "—",
    tenure: r.tenure || "",
    size: r.size || "",
    tag: r.tag || "",
    desc: r.description || "",
    photo: r.photo || undefined,
    customImg: r.custom_img || undefined,
  };
}

function listingToRow(l: Listing, position?: number) {
  const row: any = {
    id: l.id,
    title: l.title,
    cat: l.cat,
    loc: l.loc,
    img: l.img ?? 0,
    total: l.total,
    token: l.token,
    units: l.units,
    sold: l.sold,
    roi: l.roi,
    tenure: l.tenure || "",
    size: l.size || "",
    tag: l.tag || "",
    description: l.desc || "",
    photo: l.photo || "",
    custom_img: l.customImg || "",
    updated_at: new Date().toISOString(),
  };
  if (typeof position === "number") row.position = position;
  return row;
}

/** Seed the table from the bundled SEED data the first time it's empty. */
async function seedIfEmpty(): Promise<void> {
  const sb = supabaseAdmin();
  const { count, error } = await sb.from(TABLE).select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message || JSON.stringify(error));
  if ((count ?? 0) > 0) return;
  const rows = SEED.map((l, i) => listingToRow(l, i));
  const { error: insErr } = await sb.from(TABLE).upsert(rows);
  if (insErr) throw new Error(insErr.message || JSON.stringify(insErr));
}

export async function getListings(): Promise<Listing[]> {
  const sb = supabaseAdmin();
  await seedIfEmpty();
  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || JSON.stringify(error));
  return (data || []).map(rowToListing);
}

export async function getListing(id: string): Promise<Listing | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message || JSON.stringify(error));
  return data ? rowToListing(data) : null;
}

export async function createListing(l: Listing): Promise<Listing> {
  const sb = supabaseAdmin();
  // new listings go to the top (lowest position)
  const { data: top } = await sb.from(TABLE).select("position").order("position", { ascending: true }).limit(1).maybeSingle();
  const position = (top?.position ?? 0) - 1;
  const { data, error } = await sb.from(TABLE).insert(listingToRow(l, position)).select().single();
  if (error) throw new Error(error.message || JSON.stringify(error));
  return rowToListing(data);
}

export async function updateListing(id: string, l: Listing): Promise<Listing> {
  const sb = supabaseAdmin();
  const row = listingToRow(l);
  delete row.id; // never change PK
  const { data, error } = await sb.from(TABLE).update(row).eq("id", id).select().single();
  if (error) throw new Error(error.message || JSON.stringify(error));
  return rowToListing(data);
}

export async function deleteListing(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message || JSON.stringify(error));
}
