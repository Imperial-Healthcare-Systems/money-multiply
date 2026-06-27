import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads-server";
import type { LeadSource } from "@/lib/types";

export const runtime = "nodejs";

const VALID: LeadSource[] = ["news", "wa", "email", "partner", "investor"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source = body?.source as LeadSource;
    if (!VALID.includes(source)) {
      return NextResponse.json({ ok: false, error: "bad_source" }, { status: 400 });
    }
    const lead = await createLead({
      source,
      contact: typeof body?.contact === "string" ? body.contact.slice(0, 300) : "",
      detail: typeof body?.detail === "string" ? body.detail.slice(0, 600) : "",
    });
    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
