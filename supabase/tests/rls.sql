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
rollback;
