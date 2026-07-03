alter table public.goods_category
  add column if not exists fulfillment_type text;

update public.goods_category
set fulfillment_type = 'PHYSICAL'
where fulfillment_type is null or btrim(fulfillment_type) = '';

alter table public.goods_category
  alter column fulfillment_type set default 'PHYSICAL',
  alter column fulfillment_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'goods_category_fulfillment_type_check'
  ) then
    alter table public.goods_category
      add constraint goods_category_fulfillment_type_check
      check (fulfillment_type in ('PHYSICAL', 'DIGITAL'));
  end if;
end $$;
