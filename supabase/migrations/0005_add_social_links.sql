-- Optional profile fields: email (used as an alternative password-reset
-- channel to SMS) and social links shown on the profile.
alter table users add column if not exists email text;
alter table users add column if not exists facebook_url text;
alter table users add column if not exists instagram_url text;

create index if not exists idx_users_email on users (email);
