-- ============================================================
-- Money Multiply — full backend schema (listings + leads)
-- Run this in the Supabase SQL editor (once). Safe to re-run.
-- Admin auth table lives in admin_auth.sql.
-- ============================================================

-- ---------- LISTINGS ----------
create table if not exists public.mm_listings (
  id           text primary key,
  title        text not null,
  cat          text not null default 'Land Bank',
  loc          text not null default '',
  img          int  not null default 0,
  total        bigint not null default 0,
  token        bigint not null default 500000,
  units        bigint not null default 1,
  sold         bigint not null default 0,
  roi          text not null default '—',
  tenure       text default '',
  size         text default '',
  tag          text default '',
  description  text default '',
  photo        text default '',
  custom_img   text default '',
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists mm_listings_position_idx on public.mm_listings (position asc, created_at desc);

-- ---------- LEADS ----------
create table if not exists public.mm_leads (
  id         text primary key,
  source     text not null,
  contact    text default '',
  detail     text default '',
  ts         bigint not null,
  created_at timestamptz not null default now()
);
create index if not exists mm_leads_ts_idx on public.mm_leads (ts desc);

-- ---------- RLS ----------
-- Both tables are accessed only by the Next.js API routes via the
-- SERVICE ROLE key (which bypasses RLS). Enabling RLS with no public
-- policies denies all anon/authenticated client access.
alter table public.mm_listings enable row level security;
alter table public.mm_listings force row level security;
alter table public.mm_leads     enable row level security;
alter table public.mm_leads     force row level security;

-- ---------- STORAGE ----------
-- A public bucket named "listings" is created automatically by the
-- upload API on first use. If you prefer to create it manually:
--   Storage → New bucket → name: listings → Public: ON

-- ============================================================
-- USERS (Partners & Investors) + HOLDINGS
-- ============================================================
create table if not exists public.mm_users (
  id            text primary key,
  role          text not null check (role in ('partner','investor')),
  name          text not null default '',
  email         text not null unique,
  phone         text default '',
  password_hash text not null,
  referral_code text default '',
  referred_by   text default '',
  commission    bigint not null default 0,
  status        text not null default 'active',
  saved         text[] not null default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists mm_users_email_idx on public.mm_users (lower(email));
create index if not exists mm_users_ref_idx on public.mm_users (referral_code);
create index if not exists mm_users_refby_idx on public.mm_users (referred_by);

create table if not exists public.mm_holdings (
  id         text primary key,
  user_id    text not null,
  listing_id text default '',
  title      text default '',
  tokens     int not null default 0,
  amount     bigint not null default 0,
  status     text not null default 'reserved',
  created_at timestamptz not null default now()
);
create index if not exists mm_holdings_user_idx on public.mm_holdings (user_id);

alter table public.mm_users    enable row level security;
alter table public.mm_users    force row level security;
alter table public.mm_holdings enable row level security;
alter table public.mm_holdings force row level security;
