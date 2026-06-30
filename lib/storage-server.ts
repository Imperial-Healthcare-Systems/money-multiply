import "server-only";
import { supabaseAdmin } from "./supabase-admin";

const BUCKET = "listings";

let ensured = false;
async function ensureBucket(): Promise<void> {
  if (ensured) return;
  const sb = supabaseAdmin();
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    await sb.storage.createBucket(BUCKET, { public: true });
  }
  ensured = true;
}

export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  ext: string,
  prefix = "listing"
): Promise<string> {
  await ensureBucket();
  const sb = supabaseAdmin();
  const name =
    prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + "." + ext;
  const { error } = await sb.storage.from(BUCKET).upload(name, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message || JSON.stringify(error));
  const { data } = sb.storage.from(BUCKET).getPublicUrl(name);
  return data.publicUrl;
}
