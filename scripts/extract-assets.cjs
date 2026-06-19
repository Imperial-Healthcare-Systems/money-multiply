/* One-off: decode base64 assets from the original single-file HTML into
   /public/images, dedupe by content hash, and emit TS data + manifest. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SRC = "C:/Users/ROSE MEHRA/Downloads/Money_Multiply_2/money-multiply-marketplace.html";
const ROOT = path.resolve(__dirname, "..");
const IMGDIR = path.join(ROOT, "public", "images");
const LIBDIR = path.join(ROOT, "lib");
fs.mkdirSync(IMGDIR, { recursive: true });
fs.mkdirSync(LIBDIR, { recursive: true });

const html = fs.readFileSync(SRC, "utf8");

function grab(re) { const m = html.match(re); return m ? m[1] : null; }
const EMBLEM = grab(/var EMBLEM="(data:[^"]+)"/);
const PROPS = JSON.parse(grab(/var PROPS=(\[.*?\]);\s*\nvar IMG/s));
const IMG = JSON.parse(grab(/var IMG=(\{.*?\});\s*\nvar SEED/s));
const SEED = JSON.parse(grab(/var SEED=(\[.*?\]);\s*\n\/\* ===== ADMIN/s));

const extOf = (uri) =>
  uri.startsWith("data:image/png") ? "png" :
  uri.startsWith("data:image/jpeg") ? "jpg" :
  uri.startsWith("data:image/svg+xml") ? "svg" :
  uri.startsWith("data:image/webp") ? "webp" : "bin";

const hashToFile = {}; // content hash -> "/images/x.ext"
function writeAsset(name, uri) {
  const ext = extOf(uri);
  const b64 = uri.slice(uri.indexOf(",") + 1);
  const buf = Buffer.from(b64, "base64");
  const h = crypto.createHash("sha1").update(buf).digest("hex");
  if (hashToFile[h]) return hashToFile[h]; // dedupe
  const file = `${name}.${ext}`;
  fs.writeFileSync(path.join(IMGDIR, file), buf);
  const pub = `/images/${file}`;
  hashToFile[h] = pub;
  return pub;
}
function lookup(uri) {
  const b64 = uri.slice(uri.indexOf(",") + 1);
  const h = crypto.createHash("sha1").update(Buffer.from(b64, "base64")).digest("hex");
  return hashToFile[h] || null;
}

// 1) named IMG map
const imgMap = {};
for (const k of Object.keys(IMG)) imgMap[k] = writeAsset(k, IMG[k]);

// 2) PROPS artwork (dedupe identical)
const propPaths = PROPS.map((u, i) => writeAsset(`prop-${i}`, u));

// 3) emblem
const emblemPath = EMBLEM ? writeAsset("emblem", EMBLEM) : null;

// 4) footer brand logo (line 1138) — name it explicitly before generic pass
const fbLine = html.split(/\r?\n/)[1137] || "";
const fbm = fbLine.match(/<img[^>]*\bsrc="(data:image\/[^"]+)"/);
const fbLogo = fbm ? writeAsset("fb_logo", fbm[1]) : emblemPath;

// any remaining inline HTML data URIs, deduped by content hash
const inline = [...html.matchAll(/(?:src="|url\(')(data:image\/[^"')]+)/g)].map((m) => m[1]);
const unmatched = [];
let idx = 0;
for (const uri of inline) {
  if (lookup(uri)) continue;
  unmatched.push(writeAsset(`inline-${idx++}`, uri));
}

// hero frames in order of appearance (background-image url('...'))
const heroFrames = [...html.matchAll(/class="frame[^"]*"[^>]*url\('(data:image\/[^']+)'/g)]
  .map((m) => lookup(m[1]) || writeAsset(`hero-frame`, m[1]));

// 5) seed listings -> reference files, strip base64
const seedOut = SEED.map((l) => {
  const photo = l.photo ? lookup(l.photo) : null;
  const { photo: _p, ...rest } = l;
  return { ...rest, photo: photo || imgMap.card_golden };
});

// 6) emit manifest + seed
const manifest = {
  emblem: emblemPath,
  fbLogo,
  props: propPaths,
  img: imgMap,
  heroFrames,
};
fs.writeFileSync(
  path.join(LIBDIR, "_generated-images.json"),
  JSON.stringify(manifest, null, 2)
);
fs.writeFileSync(
  path.join(LIBDIR, "_generated-seed.json"),
  JSON.stringify(seedOut, null, 2)
);

console.log("Images written:", Object.keys(hashToFile).length);
console.log("IMG map:", Object.keys(imgMap).length, "| PROPS:", propPaths.length);
console.log("Hero frames:", heroFrames.length);
console.log("Unmatched inline assets:", unmatched.length, unmatched);
console.log("Seed photos mapped:", seedOut.map((s) => s.id + " -> " + s.photo).join("\n  "));
