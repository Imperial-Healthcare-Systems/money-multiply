# Backend setup (Supabase)

The whole site is now backend-driven via Supabase + Next.js Route Handlers:

| Area | Storage | How it works |
|---|---|---|
| **Admin auth** | `mm_admin_auth` | bcrypt passcode + signed httpOnly session cookie |
| **Listings** | `mm_listings` | SSR-read on every page; admin CRUD via protected API |
| **Leads** | `mm_leads` | captured from the public site; admin reads/clears/exports |
| **Images** | Storage bucket `listings` | admin uploads go to Supabase Storage (auto-created) |

The public site **server-renders listings from the DB**. If the DB isn't reachable yet, it falls back to the bundled seed so the site never breaks.

## One-time setup

### 1. Env (`.env.local`)
Already set if admin login works. Required:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...      # long service_role JWT
ADMIN_SESSION_SECRET=...           # long random string
ADMIN_INITIAL_PASSCODE=MM@2026     # optional
```

### 2. Create the tables
In Supabase → **SQL Editor**, run **both** files:
- [`supabase/admin_auth.sql`](supabase/admin_auth.sql) — admin passcode table
- [`supabase/schema.sql`](supabase/schema.sql) — `mm_listings` + `mm_leads`

(Storage bucket `listings` is created automatically on the first admin image upload — or make it manually: Storage → New bucket → `listings` → Public ON.)

### 3. Restart the dev server
```
npm run dev
```
On first load, `mm_listings` is **auto-seeded** from the current 6 projects in `lib/_generated-seed.json`. After that, the database is the source of truth — edit everything from the admin console.

## How data flows now
- **Public pages** read listings server-side (`lib/listings-server.ts`) → always fresh, SEO-friendly.
- **Admin create/edit/delete** → `POST/PUT/DELETE /api/admin/listings` (session-protected) → writes to Supabase. Admin's view updates instantly; public reflects on next load.
- **Leads** (newsletter / WhatsApp / email / partner / investor) → `POST /api/leads` → `mm_leads`. Admin → `GET/DELETE /api/admin/leads`.
- **Image uploads** → `POST /api/admin/upload` → Supabase Storage → public URL stored on the listing.

## API summary
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/listings` | GET | public | list (also used to refresh client) |
| `/api/admin/listings` | POST | session | create |
| `/api/admin/listings/[id]` | PUT / DELETE | session | update / delete |
| `/api/leads` | POST | public | capture a lead |
| `/api/admin/leads` | GET / DELETE | session | list / clear |
| `/api/admin/upload` | POST | session | upload image to Storage |
| `/api/admin/login \| logout \| session \| change-password` | — | — | auth |

## Notes
- All DB access goes through the **service-role key on the server only**; RLS is enabled with no public policies, so the tables can't be touched directly from a browser.
- Until the tables exist, listing/lead APIs return **503** and the site uses the seed fallback — that's expected.
- `localStorage` is no longer used for listings/leads.

---

## Partner / Investor accounts + dashboards

"Become an Associate" now creates **real accounts** (no longer just leads):

- **Tables:** `mm_users` (partners & investors, bcrypt password, referral code, commission, saved[]) and `mm_holdings` (investor reservations). Both added to `schema.sql` — re-run it.
- **Auth:** email + password → httpOnly signed session cookie (`mm_user_session`, 30 days). Instant access (signup → auto login → `/dashboard`).
- **Dashboard** (`/dashboard`, role-aware):
  - Profile + account details
  - Saved opportunities (Save button on each product page)
  - **Partner:** referral code, referred users, commission summary
  - **Investor:** reservations / holdings (recorded by admin)
- **Admin → Users tab:** list partners/investors, edit status & commission, view referrals, add/remove investor holdings.

### User API
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/user/register` | POST | public | create account + session |
| `/api/user/login` | POST | public | login |
| `/api/user/logout` | POST | — | logout |
| `/api/user/me` | GET | cookie | current user + holdings/referrals |
| `/api/user/save` | POST | user | toggle a saved listing |
| `/api/admin/users` | GET | admin | list users |
| `/api/admin/users/[id]` | GET/PUT | admin | detail / update commission+status |
| `/api/admin/users/[id]/holdings` | POST | admin | add a holding |
| `/api/admin/holdings/[id]` | DELETE | admin | remove a holding |

Reuses `ADMIN_SESSION_SECRET` to sign user sessions — no new env needed. Just re-run `supabase/schema.sql` and restart.
