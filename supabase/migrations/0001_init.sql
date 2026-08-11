-- QuickLink Cameroun — initial schema
-- Run this once against your Supabase project (SQL Editor, or `supabase db push`
-- if you're using the Supabase CLI). See DEPLOYMENT.md for the full walkthrough.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ --
-- users
-- ------------------------------------------------------------------ --
create table if not exists users (
  id                    text primary key,
  name                  text not null,
  phone                 text not null unique,
  area                  text not null,
  city                  text not null,
  avatar_url            text,
  profile_video_url     text,
  has_video_bio         boolean not null default false,
  specialty             text not null,
  services_offered      text[] not null default '{}',
  service_subcategories text[] not null default '{}',
  custom_profession     text,
  role_type             text not null default 'both',
  work_photos           text[] not null default '{}',
  rating_avg            numeric not null default 0,
  rating_count          integer not null default 0,
  bio                   text,
  created_at            timestamptz not null default now()
);
create index if not exists idx_users_city on users (lower(city));
create index if not exists idx_users_role on users (role_type);

-- ------------------------------------------------------------------ --
-- tasks
-- ------------------------------------------------------------------ --
create table if not exists tasks (
  id                text primary key,
  posted_by         text not null references users(id) on delete cascade,
  posted_by_name    text,
  posted_by_area    text,
  title             text not null,
  category          text not null default '',
  sub_category      text not null default '',
  description       text not null default '',
  area              text not null,
  city              text not null,
  lat               double precision not null,
  lng               double precision not null,
  urgency           text not null default 'flexible',
  status            text not null default 'open',
  created_at        timestamptz not null default now(),
  interested_count  integer not null default 0,
  image_url         text
);
create index if not exists idx_tasks_city on tasks (lower(city));
create index if not exists idx_tasks_category on tasks (category);
create index if not exists idx_tasks_created on tasks (created_at desc);
create index if not exists idx_tasks_posted_by on tasks (posted_by);

-- ------------------------------------------------------------------ --
-- services
-- ------------------------------------------------------------------ --
create table if not exists services (
  id                 text primary key,
  posted_by          text not null references users(id) on delete cascade,
  posted_by_name     text,
  posted_by_phone    text,
  posted_by_rating   numeric,
  title              text not null,
  category           text not null default '',
  sub_category       text not null default '',
  specialty          text,
  description        text not null default '',
  area               text not null,
  city               text not null,
  lat                double precision not null,
  lng                double precision not null,
  pricing_rate       text,
  work_photos        text[] not null default '{}',
  status             text not null default 'active',
  created_at         timestamptz not null default now(),
  interested_count   integer not null default 0
);
create index if not exists idx_services_city on services (lower(city));
create index if not exists idx_services_category on services (category);
create index if not exists idx_services_status on services (status);
create index if not exists idx_services_created on services (created_at desc);
create index if not exists idx_services_posted_by on services (posted_by);

-- ------------------------------------------------------------------ --
-- interests ("I'm interested" signals on a task or service post)
-- ------------------------------------------------------------------ --
create table if not exists interests (
  id                    text primary key,
  user_id               text not null references users(id) on delete cascade,
  post_id               text not null,
  post_type             text not null check (post_type in ('task', 'service_offer')),
  created_at            timestamptz not null default now(),
  preview_service_type  text,
  preview_rating_avg    numeric,
  preview_rating_count  integer,
  preview_area          text,
  preview_has_video     boolean
);
create unique index if not exists uniq_interest on interests (user_id, post_id, post_type);
create index if not exists idx_interests_post on interests (post_id);

-- ------------------------------------------------------------------ --
-- contact_unlocks — the 24h paid-contact window. Never store a boolean
-- "unlocked" flag; status is always derived from unlocked_at + 24h at
-- read time (see unlockStatus() in server.ts).
-- ------------------------------------------------------------------ --
create table if not exists contact_unlocks (
  id                    text primary key,
  unlocking_user_id     text not null references users(id) on delete cascade,
  unlocked_user_id      text not null references users(id) on delete cascade,
  unlocked_at           timestamptz not null default now(),
  payment_method        text not null default 'fapshi',
  amount_paid           numeric not null default 0,
  reference             text
);
create unique index if not exists uniq_unlock_pair on contact_unlocks (unlocking_user_id, unlocked_user_id);

-- ------------------------------------------------------------------ --
-- payments — shaped after Fapshi's collect API (trans_id + CREATED /
-- SUCCESSFUL / FAILED). A row here is only ever turned into a
-- contact_unlocks row by POST /api/payments/webhook.
-- ------------------------------------------------------------------ --
create table if not exists payments (
  id               text primary key,
  trans_id         text not null unique,
  user_id          text not null references users(id) on delete cascade,
  amount           numeric not null,
  status           text not null default 'CREATED' check (status in ('CREATED', 'SUCCESSFUL', 'FAILED')),
  phone            text not null,
  target_user_id   text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_payments_user on payments (user_id);

-- ------------------------------------------------------------------ --
-- reviews
-- ------------------------------------------------------------------ --
create table if not exists reviews (
  id                 text primary key,
  reviewer_id        text not null references users(id) on delete cascade,
  reviewer_name      text,
  reviewed_user_id   text not null references users(id) on delete cascade,
  task_id            text,
  rating             integer not null check (rating between 1 and 5),
  comment            text,
  created_at         timestamptz not null default now()
);
create index if not exists idx_reviews_reviewed on reviews (reviewed_user_id);

-- ------------------------------------------------------------------ --
-- Row Level Security is intentionally left off: the client app never
-- talks to Supabase directly, only our own API server does (with the
-- service-role key, which bypasses RLS anyway). Access control lives in
-- server.ts, not in Postgres policies.
-- ------------------------------------------------------------------ --
alter table users disable row level security;
alter table tasks disable row level security;
alter table services disable row level security;
alter table interests disable row level security;
alter table contact_unlocks disable row level security;
alter table payments disable row level security;
alter table reviews disable row level security;
