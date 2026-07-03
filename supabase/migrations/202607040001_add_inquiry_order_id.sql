alter table if exists public.inquiry
  add column if not exists order_id bigint references public.orders (order_id);

create index if not exists inquiry_order_id_idx on public.inquiry (order_id);
