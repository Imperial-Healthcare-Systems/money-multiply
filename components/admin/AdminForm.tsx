"use client";

import { useState } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { MOTIF_OPTIONS, PROPS } from "@/lib/data";
import type { Listing } from "@/lib/types";

export default function AdminForm({ editing, onDone }: { editing: Listing | null; onDone: () => void }) {
  const { saveListing, toast } = useMarketplace();
  const l = editing;
  const [f, setF] = useState({
    title: l?.title || "",
    cat: l?.cat || "",
    tag: l?.tag || "",
    loc: l?.loc || "",
    total: l ? String(l.total) : "",
    token: l ? String(l.token) : "",
    units: l ? String(l.units) : "",
    sold: l ? String(l.sold) : "",
    roi: l?.roi || "",
    tenure: l?.tenure || "",
    size: l?.size || "",
    desc: l?.desc || "",
    motif: l && typeof l.img === "number" ? String(l.img) : "0",
  });
  const [formImg, setFormImg] = useState<string | null>(l?.customImg || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const num = (s: string) => parseFloat(s) || 0;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast("Image too large (max 6MB)");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) setFormImg(d.url as string);
      else toast(d.error === "unauthorized" ? "Session expired — sign in again" : "Upload failed");
    } catch {
      toast("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (saving) return;
    const title = f.title.trim();
    if (!title) {
      toast("Please add a title");
      return;
    }
    let units = num(f.units) || 1;
    let sold = num(f.sold);
    if (sold > units) sold = units;
    const obj: Listing = {
      id:
        l?.id ||
        "mm-" +
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 40) +
          "-" +
          Date.now().toString(36).slice(-4),
      title,
      cat: f.cat.trim() || "Land Bank",
      tag: f.tag.trim(),
      loc: f.loc.trim(),
      total: num(f.total),
      token: num(f.token) || 10000,
      units,
      sold,
      roi: f.roi.trim() || "—",
      tenure: f.tenure.trim(),
      size: f.size.trim(),
      desc: f.desc.trim(),
      img: parseInt(f.motif, 10) || 0,
    };
    if (formImg) obj.customImg = formImg;
    else if (l?.photo) obj.photo = l.photo;
    else if (l?.customImg) obj.customImg = l.customImg;
    setSaving(true);
    const r = await saveListing(obj);
    setSaving(false);
    if (r.ok) {
      toast(l ? "Listing updated" : "Listing published");
      onDone();
    } else {
      toast(r.error === "unauthorized" ? "Session expired — sign in again" : "Couldn’t save listing");
    }
  };

  const preview = formImg || (l && typeof l.img === "number" ? PROPS[l.img] : null);

  return (
    <>
      <div className="mhead">
        <div>
          <h3>{l ? "Edit listing" : "New listing"}</h3>
          <div className="sub">All amounts in ₹ (INR)</div>
        </div>
        <CloseBtn />
      </div>
      <div className="mbody">
        <div className="field">
          <label>Title</label>
          <input value={f.title} onChange={set("title")} placeholder="e.g. Emerald Greens — Plotted Township" />
        </div>
        <div className="frow">
          <div className="field">
            <label>Category</label>
            <input value={f.cat} onChange={set("cat")} placeholder="Land Bank" />
          </div>
          <div className="field">
            <label>Tag</label>
            <input value={f.tag} onChange={set("tag")} placeholder="New / Premium" />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={f.loc} onChange={set("loc")} placeholder="Yamuna Expressway, Greater Noida" />
        </div>
        <div className="frow">
          <div className="field">
            <label>Total project cost (₹)</label>
            <input type="number" value={f.total} onChange={set("total")} placeholder="480000000" />
          </div>
          <div className="field">
            <label>Token price (₹)</label>
            <input type="number" value={f.token} onChange={set("token")} placeholder="25000" />
          </div>
        </div>
        <div className="frow">
          <div className="field">
            <label>Total units</label>
            <input type="number" value={f.units} onChange={set("units")} placeholder="19200" />
          </div>
          <div className="field">
            <label>Units sold</label>
            <input type="number" value={f.sold} onChange={set("sold")} placeholder="12740" />
          </div>
        </div>
        <div className="frow">
          <div className="field">
            <label>Target return</label>
            <input value={f.roi} onChange={set("roi")} placeholder="21% IRR (3-yr)" />
          </div>
          <div className="field">
            <label>Tenure</label>
            <input value={f.tenure} onChange={set("tenure")} placeholder="36 months" />
          </div>
        </div>
        <div className="field">
          <label>Size / scale</label>
          <input value={f.size} onChange={set("size")} placeholder="42-acre master plan" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={f.desc} onChange={set("desc")} placeholder="Short investor-facing summary…" />
        </div>
        <div className="field">
          <label>Default artwork</label>
          <select value={f.motif} onChange={set("motif")}>
            {MOTIF_OPTIONS.map((o, i) => (
              <option value={i} key={i}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Upload custom image (optional)</label>
          <label className="imgdrop" htmlFor="f_file">
            {uploading ? "Uploading…" : "Tap to upload a photo"}
            <div id="imgPrev">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" />
              )}
            </div>
          </label>
          <input type="file" id="f_file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
        </div>
        <button className={"btn-gold" + (saving ? " loading" : "")} onClick={save} disabled={saving || uploading}>
          {l ? "Save changes" : "Publish listing"}
        </button>
        <button className="btn-ghost" style={{ width: "100%", marginTop: "12px" }} onClick={onDone}>
          {l ? "Back to listings" : "Cancel"}
        </button>
      </div>
    </>
  );
}

function CloseBtn() {
  const { closeModal } = useMarketplace();
  return (
    <button className="mclose" onClick={closeModal}>
      ×
    </button>
  );
}
