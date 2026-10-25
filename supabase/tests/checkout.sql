do $$
declare c uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); v uuid:=gen_random_uuid();
  request_id uuid:=gen_random_uuid(); customer jsonb; items jsonb; a jsonb; b jsonb; n integer;
begin
  begin
    perform set_config('request.jwt.claims','{"role":"anon"}',true);
    insert into public.categories(id,slug,name) values(c,'checkout-test-'||c,'Checkout test');
    insert into public.products(id,category_id,slug,name,price,is_on_sale) values(p,c,'checkout-test-'||p,'Checkout test',10000,false);
    insert into public.product_variants(id,product_id,colour,size_system,size_value,stock) values(v,p,'Black','EU','42',7);
    customer:=jsonb_build_object('requestId',request_id,'fullName','Fixture','phone','0'||floor(100000000+random()*899999999)::text,
      'whatsapp','0770000001','email','fixture@example.com','address','Fixture','city','Fixture');
    items:=jsonb_build_array(jsonb_build_object('productId',p,'variantId',v,'quantity',2,'price',1));
    a:=public.place_order(customer,items);
    b:=public.place_order(customer,items);
    assert a=b,'Retry must return the same receipt';
    assert (a->>'subtotal')::integer=20000,'Price must come from products.price, ignoring supplied prices';
    assert (select count(*) from public.orders where id=(a->>'order_id')::uuid)=1,'Only one order on retry';
    assert (select whatsapp from public.orders where id=(a->>'order_id')::uuid)='0770000001','WhatsApp must persist';
    select stock into n from public.product_variants where id=v;
    assert n=7,'An inquiry must not reserve inventory';
    begin
      perform public.place_order(customer,jsonb_build_array(jsonb_build_object('variantId',v,'quantity',3)));
      raise exception 'Expected request reuse rejection';
    exception when raise_exception then
      if sqlerrm <> 'ERR_REQUEST_CHANGED' then raise; end if;
    end;
    for n in 1..4 loop
      perform public.place_order(jsonb_set(customer,'{requestId}',to_jsonb(gen_random_uuid())),items);
    end loop;
    begin
      perform public.place_order(jsonb_set(customer,'{requestId}',to_jsonb(gen_random_uuid())),items);
      raise exception 'Expected rate limit';
    exception when raise_exception then
      if sqlerrm <> 'ERR_RATE_LIMIT' then raise; end if;
    end;
    assert not has_table_privilege('anon','proedge_private.checkout_requests','SELECT'), 'Receipts must remain private';
    raise exception using errcode='ZX002',message='rollback successful checkout fixtures';
  exception when sqlstate 'ZX002' then null; end;
end; $$;
