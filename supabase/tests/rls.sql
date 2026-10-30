-- Valid schema inputs; fail unless PostgreSQL specifically denies permission.
-- Run as postgres in the SQL editor or CLI. No fixture data is committed.
begin;
set local role anon;
do $$
begin
  begin
    insert into public.orders(order_number, customer_name, phone, address, city, subtotal, delivery_fee, total, status)
    values('RLS-TEST-'||gen_random_uuid(), 'Fixture', '0770000000', 'Fixture', 'Colombo', 1000, 0, 1000, 'pending');
    raise exception 'Anonymous order insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.order_items(order_id, product_id, product_name, colour, size, quantity, unit_price)
    values(gen_random_uuid(), gen_random_uuid(), 'Fixture', 'Black', '42', 1, 1000);
    raise exception 'Anonymous order-item insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_delete_order(gen_random_uuid());
    raise exception 'Anonymous admin RPC unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"is_admin":false}}', true);
do $$ begin
  begin
    insert into public.orders(order_number, customer_name, phone, address, status)
      values('RLS-TEST-' || gen_random_uuid(), 'Fixture', '0000000000', 'Fixture', 'pending');
    raise exception 'Non-admin order insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.order_items(order_id, product_id, product_name, colour, size, quantity, unit_price)
      values(gen_random_uuid(), gen_random_uuid(), 'Fixture', 'Black', '42', 1, 1000);
    raise exception 'Non-admin item insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform public.admin_save_order_checked(null, null, '[]', 0, null);
    raise exception 'Non-admin order RPC unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform public.place_order('{}', '[]');
    raise exception 'Non-admin checkout RPC unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  assert not has_function_privilege('anon', 'public.place_order(jsonb,jsonb)', 'EXECUTE');
  assert not has_function_privilege('authenticated', 'public.place_order(jsonb,jsonb)', 'EXECUTE');
end $$;
rollback;
