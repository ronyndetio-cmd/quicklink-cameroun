-- One pending OTP code per phone number, for the "forgot password" flow.
-- A new request just overwrites the previous row (upsert by phone).
create table if not exists password_resets (
  phone       text primary key,
  code        text not null,
  expires_at  timestamptz not null
);

alter table password_resets disable row level security;
