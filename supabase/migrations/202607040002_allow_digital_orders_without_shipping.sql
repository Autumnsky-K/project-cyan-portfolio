alter table if exists public.orders
  alter column recipient_name drop not null,
  alter column recipient_phone drop not null,
  alter column postal_code drop not null,
  alter column address drop not null,
  alter column address_detail drop not null,
  alter column delivery_request drop not null;
