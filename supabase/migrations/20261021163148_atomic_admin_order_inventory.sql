-- Admin order changes and stock adjustments must commit as one transaction.
-- SECURITY INVOKER retains the existing admin RLS policies.
create or replace function public.admin_save_order(
  p_order_id uuid, p_items jsonb, p_delivery_fee integer, p_notes text,
  p_customer jsonb default null, p_status text default 'confirmed'
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_order public.orders;
  v_id uuid := p_order_id;
  v_item jsonb;
  v_lines jsonb;
  v_reserved boolean := false;
  v_subtotal bigint;
  v_stock record;
  v_new_quantity bigint;
  v_old_quantity bigint;
begin
  if not coalesce(public.is_admin(), false) then raise insufficient_privilege; end if;
  if p_status is null or p_status not in ('pending', 'confirmed')
    or p_delivery_fee is null or p_delivery_fee < 0 or p_delivery_fee > 10000000
    or length(coalesce(p_notes,'')) > 4000 then raise exception 'ERR_ORDER_INVALID'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'ERR_ITEMS_INVALID'; end if;
  if jsonb_array_length(p_items) not between 1 and 100 then raise exception 'ERR_ITEMS_INVALID'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or coalesce(v_item->>'variantId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or coalesce(v_item->>'quantity','') !~ '^[0-9]{1,3}$'
      or (v_item->>'quantity')::integer not between 1 and 999
      or coalesce(v_item->>'unitPrice','') !~ '^[0-9]{1,8}$'
      then raise exception 'ERR_ITEMS_INVALID'; end if;
  end loop;
  -- Duplicates are merged; conflicting prices for one variant are rejected.
  if exists(select 1 from jsonb_array_elements(p_items) x
    group by x->>'variantId' having count(distinct x->>'unitPrice') > 1
      or sum((x->>'quantity')::integer) > 999) then raise exception 'ERR_ITEMS_INVALID'; end if;
  select jsonb_agg(jsonb_build_object('variantId', id, 'quantity', qty, 'unitPrice', price) order by id)
    into v_lines from (select (x->>'variantId')::uuid id, sum((x->>'quantity')::integer) qty,
      min((x->>'unitPrice')::integer) price from jsonb_array_elements(p_items) x group by 1) q;

  if v_id is null then
    if jsonb_typeof(p_customer) is distinct from 'object'
      or length(trim(coalesce(p_customer->>'name',''))) not between 1 and 200
      or length(trim(coalesce(p_customer->>'phone',''))) not between 1 and 40
      or length(trim(coalesce(p_customer->>'address',''))) not between 1 and 1000
      or length(trim(coalesce(p_customer->>'city',''))) not between 1 and 100
      then raise exception 'ERR_CUSTOMER_INVALID'; end if;
    v_id := gen_random_uuid();
    insert into public.orders(id,order_number,customer_name,phone,address,city,status)
      values(v_id,'PROE-'||to_char(now(),'YYMMDD')||'-'||replace(v_id::text,'-',''),
        trim(p_customer->>'name'),trim(p_customer->>'phone'),trim(p_customer->>'address'),
        trim(p_customer->>'city'),'pending') returning * into v_order;
  else
    select * into v_order from public.orders where id=v_id for update;
    if not found then raise exception 'ERR_ORDER_NOT_FOUND'; end if;
    if v_order.status in ('shipped','delivered') then raise exception 'ERR_ORDER_FULFILLED'; end if;
    if p_status <> 'confirmed' then raise exception 'ERR_ORDER_INVALID'; end if;
    v_reserved := v_order.status not in ('pending','cancelled');
  end if;

  -- All mutations take the same ordered variant locks, preventing lost updates.
  for v_stock in select pv.id,pv.stock from public.product_variants pv
    where pv.id in (select (x->>'variantId')::uuid from jsonb_array_elements(v_lines) x)
      or pv.id in (select variant_id from public.order_items where order_id=v_id)
    order by pv.id for update loop
    select coalesce(sum((x->>'quantity')::integer),0) into v_new_quantity
      from jsonb_array_elements(v_lines) x where (x->>'variantId')::uuid=v_stock.id;
    select coalesce(sum(quantity),0) into v_old_quantity from public.order_items
      where order_id=v_id and variant_id=v_stock.id;
    if not v_reserved then v_old_quantity := 0; end if;
    if p_status='pending' then v_new_quantity := 0; end if;
    if v_stock.stock + v_old_quantity < v_new_quantity then raise exception 'ERR_INSUFFICIENT_STOCK'; end if;
    update public.product_variants set stock=stock+v_old_quantity-v_new_quantity where id=v_stock.id;
  end loop;
  if exists(select 1 from jsonb_array_elements(v_lines) x where not exists
    (select 1 from public.product_variants where id=(x->>'variantId')::uuid))
    then raise exception 'ERR_VARIANT_UNAVAILABLE'; end if;

  select sum((x->>'quantity')::bigint*(x->>'unitPrice')::bigint) into v_subtotal
    from jsonb_array_elements(v_lines) x;
  if v_subtotal+p_delivery_fee > 2147483647 then raise exception 'ERR_ORDER_INVALID'; end if;
  delete from public.order_items where order_id=v_id;
  insert into public.order_items(order_id,product_id,variant_id,product_name,colour,size,size_system,size_value,quantity,unit_price)
    select v_id,p.id,pv.id,p.name,pv.colour,pv.size_value,pv.size_system,pv.size_value,
      (x->>'quantity')::integer,(x->>'unitPrice')::integer
    from jsonb_array_elements(v_lines) x join public.product_variants pv on pv.id=(x->>'variantId')::uuid
      join public.products p on p.id=pv.product_id;
  update public.orders set subtotal=v_subtotal,delivery_fee=p_delivery_fee,total=v_subtotal+p_delivery_fee,
    notes=coalesce(p_notes,v_order.notes),status=p_status where id=v_id;
  return jsonb_build_object('order_id',v_id,'order_number',v_order.order_number,
    'total',v_subtotal+p_delivery_fee,'item_count',(select sum((x->>'quantity')::integer) from jsonb_array_elements(v_lines) x));
end; $$;

create or replace function public.admin_change_order_status(p_order_id uuid,p_status text)
returns void language plpgsql security invoker set search_path='' as $$
declare v_order public.orders; v_item record; v_old_active boolean; v_new_active boolean;
begin
  if not coalesce(public.is_admin(),false) then raise insufficient_privilege; end if;
  if p_status is null or p_status not in ('pending','confirmed','processing','ready_to_ship','shipped','delivered','cancelled')
    then raise exception 'ERR_ORDER_INVALID'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'ERR_ORDER_NOT_FOUND'; end if;
  if v_order.status=p_status then return; end if;
  if v_order.status='delivered' or (v_order.status='shipped' and p_status<>'delivered')
    then raise exception 'ERR_ORDER_FULFILLED'; end if;
  v_old_active := v_order.status not in ('pending','cancelled');
  v_new_active := p_status not in ('pending','cancelled');
  if v_old_active is distinct from v_new_active then
    if exists(select 1 from public.order_items where order_id=p_order_id and variant_id is null)
      or not exists(select 1 from public.order_items where order_id=p_order_id)
      then raise exception 'ERR_ITEMS_INVALID'; end if;
    for v_item in select pv.id,pv.stock,q.quantity from public.product_variants pv join
      (select variant_id,sum(quantity)::bigint quantity from public.order_items where order_id=p_order_id group by variant_id) q
      on q.variant_id=pv.id order by pv.id for update of pv loop
      if v_new_active and v_item.stock<v_item.quantity then raise exception 'ERR_INSUFFICIENT_STOCK'; end if;
      update public.product_variants set stock=stock+(case when v_new_active then -v_item.quantity else v_item.quantity end) where id=v_item.id;
    end loop;
  end if;
  update public.orders set status=p_status where id=p_order_id;
end; $$;

create or replace function public.admin_delete_order(p_order_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare v_status text;
begin
  if not coalesce(public.is_admin(),false) then raise insufficient_privilege; end if;
  select status into v_status from public.orders where id=p_order_id for update;
  if not found then raise exception 'ERR_ORDER_NOT_FOUND'; end if;
  -- Cancellation releases reservations. Deleting completed history never restocks sold goods.
  if v_status not in ('pending','cancelled','delivered') then raise exception 'ERR_CANCEL_BEFORE_DELETE'; end if;
  delete from public.orders where id=p_order_id;
end; $$;

revoke all on function public.admin_save_order(uuid,jsonb,integer,text,jsonb,text) from public,anon;
revoke all on function public.admin_change_order_status(uuid,text) from public,anon;
revoke all on function public.admin_delete_order(uuid) from public,anon;
grant execute on function public.admin_save_order(uuid,jsonb,integer,text,jsonb,text) to authenticated;
grant execute on function public.admin_change_order_status(uuid,text) to authenticated;
grant execute on function public.admin_delete_order(uuid) to authenticated;
-- Synthetic fixtures are always rolled back, including when run with a migration.
do $$
declare c uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); v uuid:=gen_random_uuid();
  o uuid; result jsonb; n integer; order_total integer; before_count integer;
  lines jsonb;
begin
  begin
    perform set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"is_admin":true}}',true);
    insert into public.categories(id,slug,name) values(c,'inventory-test-'||c,'Inventory test');
    insert into public.products(id,category_id,slug,name,price) values(p,c,'inventory-test-'||p,'Inventory test',1000);
    insert into public.product_variants(id,product_id,colour,size_system,size_value,stock) values(v,p,'Black','EU','42',7);
    lines:=jsonb_build_array(jsonb_build_object('variantId',v,'quantity',2,'unitPrice',1000));
    result:=public.admin_save_order(null,lines,500,null,'{"name":"Fixture","phone":"0770000000","address":"Fixture","city":"Fixture"}','confirmed');
    o:=(result->>'order_id')::uuid;
    select stock into n from public.product_variants where id=v;
    assert n=5,'Initial confirmation must deduct exactly two';
    perform public.admin_save_order(o,lines,500,null);
    select stock into n from public.product_variants where id=v;
    assert n=5,'Repeated confirmation must not double deduct';
    begin
      perform public.admin_save_order(o,jsonb_build_array(jsonb_build_object('variantId',v,'quantity',10,'unitPrice',1000)),500,null);
      raise exception 'Expected insufficient stock';
    exception when raise_exception then
      if sqlerrm <> 'ERR_INSUFFICIENT_STOCK' then raise; end if;
    end;
    select stock into n from public.product_variants where id=v;
    select total into order_total from public.orders where id=o;
    assert n=5 and order_total=2500,'Failed adjustment must preserve stock and order';
    begin
      perform public.admin_delete_order(o);
      raise exception 'Expected active deletion rejection';
    exception when raise_exception then
      if sqlerrm <> 'ERR_CANCEL_BEFORE_DELETE' then raise; end if;
    end;
    perform public.admin_change_order_status(o,'cancelled');
    perform public.admin_change_order_status(o,'cancelled');
    select stock into n from public.product_variants where id=v;
    assert n=7,'Repeated cancellation must restore stock only once';
    perform public.admin_change_order_status(o,'confirmed');
    perform public.admin_change_order_status(o,'shipped');
    begin
      perform public.admin_change_order_status(o,'cancelled');
      raise exception 'Expected shipped cancellation rejection';
    exception when raise_exception then
      if sqlerrm <> 'ERR_ORDER_FULFILLED' then raise; end if;
    end;
    perform public.admin_change_order_status(o,'delivered');
    perform public.admin_delete_order(o);
    select stock into n from public.product_variants where id=v;
    assert n=5,'Deleting delivered history must not restore sold items';
    select count(*) into before_count from public.orders;
    begin
      perform public.admin_save_order(null,jsonb_build_array(jsonb_build_object('variantId',v,'quantity',9,'unitPrice',1000)),0,null,
        '{"name":"Fixture","phone":"0770000000","address":"Fixture","city":"Fixture"}','confirmed');
      raise exception 'Expected manual order rejection';
    exception when raise_exception then
      if sqlerrm <> 'ERR_INSUFFICIENT_STOCK' then raise; end if;
    end;
    assert (select count(*) from public.orders)=before_count,'Failed manual order must not leave a header';
    perform set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{}}',true);
    begin
      perform public.admin_save_order(null,lines,0,null);
      raise exception 'Non-admin was allowed';
    exception when insufficient_privilege then null; end;
    assert not has_function_privilege('anon','public.admin_save_order(uuid,jsonb,integer,text,jsonb,text)','EXECUTE'), 'Anonymous RPC access';
    raise exception using errcode='ZX001',message='rollback successful fixtures';
  exception when sqlstate 'ZX001' then null; end;
end; $$;

