import "server-only";
import { supabaseAdmin } from "./supabase-admin";
import type { Lead, LeadSource } from "./types";

const TABLE = "mm_leads";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToLead(r: any): Lead {
  return {
    id: r.id,
    source: r.source as LeadSource,
    contact: r.contact || "",
    detail: r.detail || "",
    ts: Number(r.ts) || 0,
  };
}

export async function listLeads(): Promise<Lead[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from(TABLE).select("*").order("ts", { ascending: false }).limit(1000);
  if (error) throw new Error(error.message || JSON.stringify(error));
  return (data || []).map(rowToLead);
}

export async function createLead(input: {
  source: LeadSource;
  contact?: string;
  detail?: string;
}): Promise<Lead> {
  const sb = supabaseAdmin();
  const lead: Lead = {
    id: "ld-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    source: input.source,
    contact: input.contact || "",
    detail: input.detail || "",
    ts: Date.now(),
  };
  const { error } = await sb.from(TABLE).insert({
    id: lead.id,
    source: lead.source,
    contact: lead.contact,
    detail: lead.detail,
    ts: lead.ts,
  });
  if (error) throw new Error(error.message || JSON.stringify(error));
  return lead;
}

export async function clearLeads(): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from(TABLE).delete().neq("id", "");
  if (error) throw new Error(error.message || JSON.stringify(error));
}
