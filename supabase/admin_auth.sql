-- ============================================================
-- Money Multiply — admin auth table
-- Run this in the Supabase SQL editor once.
-- ============================================================

create table if not exists public.mm_admin_auth (
  id            int primary key default 1,
  password_hash text not null,
  updated_at    timestamptz not null default now(),
  constraint mm_admin_auth_single_row check (id = 1)
);

-- Lock the table down: only the service-role key (used by our server
-- API routes) may read/write it. RLS with no policies = deny all to
-- anon/authenticated clients.
alter table public.mm_admin_auth enable row level security;
alter table public.mm_admin_auth force row level security;

-- No public policies are created on purpose. The Next.js API routes use
-- the SERVICE ROLE key, which bypasses RLS. The passcode row is seeded
-- automatically on the first login attempt (from ADMIN_INITIAL_PASSCODE).
