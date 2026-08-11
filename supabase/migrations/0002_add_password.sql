-- Adds password-based auth. Existing rows (seeded/demo users) get no hash —
-- they simply can't log in until a password is set for them directly in
-- Postgres or they're recreated through the signup flow.
alter table users add column if not exists password_hash text;
