-- Synthetic fixtures are always rolled back, including when run with a migration.
begin;
set local role authenticated;
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
rollback;
