# Money Multiply — Next.js

A Next.js (App Router, TypeScript) rebuild of the original single-file
`money-multiply-marketplace.html` — a luxury tokenised land-banking marketplace
with a public marketing site and a client-side admin console.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  (use PORT=3001 if 3000 is busy)
npm run build && npm run start
```

## How the conversion was done

- **Markup → React components** under `components/` (and `components/admin/`).
- **The vanilla-JS engine** (currency, listings CRUD, leads CRM, admin auth,
  modals, toast) became React state in `context/MarketplaceContext.tsx`
  (`useMarketplace()` hook), with `localStorage` persistence.
- **Styling** is the original stylesheet, ported verbatim to `app/globals.css`.
  Fonts load via `<link>` in `app/layout.tsx`.
- **Images** were base64-inlined in the original (~5.4 MB). They are decoded to
  real files in `public/images/` by `scripts/extract-assets.cjs`, which also
  generated `lib/_generated-seed.json` and `lib/_generated-images.json`.
  Re-run with `node scripts/extract-assets.cjs` if you ever need to regenerate.

First-load JS is ~125 KB and images are cacheable static files.

## Architecture

```
app/            layout (provider + fonts), page (composition), globals.css
components/     section + UI components; admin/ holds the console
context/        MarketplaceContext — single source of app state
lib/            data, types, currency, links, utils, auth helpers
public/images/  extracted, deduped image assets
```

## Carried-over notes (from the original review — NOT yet addressed)

These pre-existing concerns were intentionally left as-is during the port:

1. ~~Admin auth is client-side only.~~ **Resolved** — admin auth is now
   server-side (Supabase + bcrypt + signed httpOnly session cookie). See
   [`ADMIN_SETUP.md`](ADMIN_SETUP.md). Listings/leads still use `localStorage`.
2. **Financial/legal copy** (IRR figures, "₹4,200 Cr+", investor counts) are
   placeholder marketing numbers; footer Legal/Risk links are stubs (`#`).
3. **Enquiry email** routes to a personal Gmail (`lib/data.ts → EMAIL`) while the
   site displays `info@moneymultiplyglobal.com`. Reconcile before launch.

### Fixed during the port

- Footer brand typo "Money Multiplier" → "Money Multiply".
- React escapes all interpolated listing fields, removing the original's
  unescaped-`innerHTML` XSS/render-break risk.
- Misleading "Encrypted session · access is logged" gate copy replaced with an
  honest demo note.
