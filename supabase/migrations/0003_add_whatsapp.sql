-- A separate WhatsApp line, since many users call from one number but chat
-- from another. Falls back to `phone` in the app when left empty.
alter table users add column if not exists whatsapp text;
