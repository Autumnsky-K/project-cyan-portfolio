alter table if exists public.member_address
  add column if not exists delivery_request text;
