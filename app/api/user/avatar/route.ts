import { NextRequest, NextResponse } from "next/server";
import { verifyUserSession, updateProfile, USER_SESSION_COOKIE } from "@/lib/user-server";
import { uploadImage } from "@/lib/storage-server";

export const runtime = "nodejs";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const sess = verifyUserSession(req.cookies.get(USER_SESSION_COOKIE)?.value);
  if (!sess) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
    const ext = EXT[file.type];
    if (!ext) return NextResponse.json({ ok: false, error: "bad_type" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.type, ext, "avatar");
    const user = await updateProfile(sess.uid, { avatar: url });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "server", detail: e instanceof Error ? e.message : String(e) },
      { status: 503 }
    );
  }
}
