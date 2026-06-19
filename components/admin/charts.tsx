"use client";

export function DonutSVG({ data, colors }: { data: { k: string; v: number }[]; colors: string[] }) {
  const total = data.reduce((a, b) => a + b.v, 0) || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  let off = 0;
  const segs = data.map((d, i) => {
    const len = (d.v / total) * c;
    const seg = (
      <circle
        key={i}
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={colors[i % colors.length]}
        strokeWidth="20"
        strokeDasharray={`${len} ${c - len}`}
        strokeDashoffset={-off}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)" }}
      />
    );
    off += len;
    return seg;
  });
  return (
    <svg className="donut" width="140" height="140" viewBox="0 0 140 140">
      {segs}
      <circle cx="70" cy="70" r="34" fill="#0a0f0c" />
      <text x="70" y="66" textAnchor="middle" fontFamily="Fraunces,serif" fontSize="24" fill="#e3cf9b">
        {data.length}
      </text>
      <text
        x="70"
        y="84"
        textAnchor="middle"
        fontFamily="Spline Sans Mono,monospace"
        fontSize="7.5"
        fill="#93a09a"
        letterSpacing="1"
      >
        SEGMENTS
      </text>
    </svg>
  );
}

export function Sparkline({ seed, w, h, col }: { seed: number; w: number; h: number; col: string }) {
  const n = 12;
  const pts: [number, number][] = [];
  let v = h * 0.7;
  for (let i = 0; i < n; i++) {
    const rnd = (Math.sin(seed * 9.7 + i * 1.3) + 1) / 2;
    v = v - h * 0.04 + (rnd - 0.5) * h * 0.22;
    v = Math.max(h * 0.15, Math.min(h * 0.9, v));
    pts.push([(i / (n - 1)) * w, v]);
  }
  const d = "M " + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}
