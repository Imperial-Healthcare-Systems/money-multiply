# Admin backend setup (Supabase)

The admin console is now backed by a real server-side auth system:

- **Passcode** is bcrypt-hashed and stored in Supabase (never in the browser/bundle).
- **Sessions** are HMAC-signed, httpOnly cookies (8 h, or 7 days with "keep me signed in").
- **Change passcode** is done from inside the console (current passcode required).
- API routes (`/api/admin/*`) run on the Node runtime and use the Supabase **service-role** key, so they're never exposed to the client.

## 3-step setup

### 1. Create the table
In your Supabase project → **SQL Editor**, run [`supabase/admin_auth.sql`](supabase/admin_auth.sql). It creates `mm_admin_auth` (single-row passcode hash) with RLS locked down (only the service role can touch it).

### 2. Configure env
Copy the template and fill it in:

```bash
cp .env.local.example .env.local
```

| Var | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | same page → `service_role` secret (⚠️ server-only) |
| `ADMIN_SESSION_SECRET` | run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ADMIN_INITIAL_PASSCODE` | the first passcode to seed (defaults to `MM@2026`) |

### 3. Restart the dev server
```bash
npm run dev
```
(env changes are only read on boot.)

## First login
1. Open the site → **Admin** → enter `ADMIN_INITIAL_PASSCODE` (default `MM@2026`).
   On first successful login the hash row is seeded automatically.
2. Immediately use **Change passcode** in the console to set your own.

## API reference
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/login` | POST `{passcode, remember}` | verify + set session cookie |
| `/api/admin/logout` | POST | clear session cookie |
| `/api/admin/session` | GET | `{authenticated: boolean}` |
| `/api/admin/change-password` | POST `{current, next}` | requires session; rotates passcode |

## Notes / next steps
- **Scope:** only admin **auth** is server-backed in this pass (your choice). Listings and leads still live in `localStorage` — say the word and I'll move those into Supabase tables behind the same protected API.
- **Deployment:** works on any Node host (incl. Vercel). The session cookie is `secure` in production, so serve over HTTPS.
- **Hardening ideas (optional):** rate-limit `/api/admin/login`, add an audit-log table, rotate `ADMIN_SESSION_SECRET` to force global logout.
