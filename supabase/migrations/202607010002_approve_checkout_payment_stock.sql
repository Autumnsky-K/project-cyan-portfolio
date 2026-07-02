create or replace function public.approve_checkout_payment(
  p_order_key text,
  p_payment_status text,
  p_order_status text,
  p_provider_payment_key text,
  p_payment_method text,
  p_provider text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_payment_id bigint;
  v_order_status text;
  v_payment_status text;
  v_managed_stock_count integer := 0;
  v_updated_stock_count integer := 0;
begin
  select o.order_id, o.order_status
    into v_order_id, v_order_status
  from public.orders o
  where o.order_no = p_order_key
     or o.order_id::text = p_order_key
  order by o.order_id desc
  limit 1
  for update;

  if v_order_id is null then
    return jsonb_build_object(
      'status', 'NOT_SYNCED',
      'message', 'No order row matched the payment order key.',
      'orderRows', 0,
      'paymentRows', 0,
      'stockUpdatedRows', 0
    );
  end if;

  select p.payment_id, p.payment_status
    into v_payment_id, v_payment_status
  from public.payment p
  where p.order_id = v_order_id
  order by p.payment_id desc
  limit 1
  for update;

  if upper(coalesce(v_order_status, '')) = 'PAID'
     or upper(coalesce(v_payment_status, '')) = 'APPROVED' then
    update public.orders
       set order_status = p_order_status
     where order_id = v_order_id;

    update public.payment
       set payment_status = p_payment_status,
           provider_payment_key = coalesce(nullif(p_provider_payment_key, ''), provider_payment_key),
           payment_method = coalesce(nullif(p_payment_method, ''), payment_method),
           provider = coalesce(nullif(p_provider, ''), provider)
     where payment_id = v_payment_id;

    return jsonb_build_object(
      'status', 'SYNCED',
      'message', 'Payment was already approved. Stock was not deducted again.',
      'orderRows', 1,
      'paymentRows', case when v_payment_id is null then 0 else 1 end,
      'stockUpdatedRows', 0,
      'stockSkipped', true
    );
  end if;

  with requested as (
    select oi.goods_id, sum(oi.quantity)::integer as quantity
    from public.order_item oi
    where oi.order_id = v_order_id
    group by oi.goods_id
  )
  select count(*)
    into v_managed_stock_count
  from requested r
  join public.goods_stock gs on gs.goods_id = r.goods_id
  where gs.current_stock is not null;

  with requested as (
    select oi.goods_id, sum(oi.quantity)::integer as quantity
    from public.order_item oi
    where oi.order_id = v_order_id
    group by oi.goods_id
  )
  update public.goods_stock gs
     set current_stock = gs.current_stock - requested.quantity
  from requested
  where gs.goods_id = requested.goods_id
    and gs.current_stock is not null
    and gs.current_stock >= requested.quantity;

  get diagnostics v_updated_stock_count = row_count;

  if v_updated_stock_count <> v_managed_stock_count then
    raise exception 'Not enough stock for order %.', p_order_key
      using errcode = 'P0001';
  end if;

  update public.orders
     set order_status = p_order_status
   where order_id = v_order_id;

  update public.payment
     set payment_status = p_payment_status,
         provider_payment_key = coalesce(nullif(p_provider_payment_key, ''), provider_payment_key),
         payment_method = coalesce(nullif(p_payment_method, ''), payment_method),
         provider = coalesce(nullif(p_provider, ''), provider)
   where payment_id = v_payment_id;

  return jsonb_build_object(
    'status', 'SYNCED',
    'message', 'Payment was approved and stock was deducted.',
    'orderRows', 1,
    'paymentRows', case when v_payment_id is null then 0 else 1 end,
    'stockUpdatedRows', v_updated_stock_count,
    'stockSkipped', false
  );
end;
$$;
