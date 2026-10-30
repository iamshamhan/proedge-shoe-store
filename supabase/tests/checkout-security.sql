-- Local test database only. All test writes are rolled back.
begin;
do $$
declare i integer;
  ip_a text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  ip_b text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  ip_c text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  email_key text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  assert not has_function_privilege('anon','public.place_order(jsonb,jsonb)','execute');
  assert not has_function_privilege('authenticated','public.place_order(jsonb,jsonb)','execute');
  assert not has_table_privilege('anon','public.orders','insert');
  assert not has_table_privilege('anon','public.order_items','insert');
  assert not has_function_privilege('anon','public.consume_checkout_limits(text,text)','execute');
  assert has_function_privilege('service_role','public.place_order(jsonb,jsonb)','execute');
  for i in 1..3 loop
    assert public.consume_checkout_limits(ip_a,email_key);
  end loop;
  assert not public.consume_checkout_limits(ip_b,email_key), 'Email limit across IPs';
  for i in 1..10 loop
    assert public.consume_checkout_limits(ip_c,null);
  end loop;
  assert not public.consume_checkout_limits(ip_c,null), 'IP limit without email';
  update proedge_private.checkout_limits set window_start=now()-interval '61 minutes' where key = 'ip:' || ip_c;
  assert public.consume_checkout_limits(ip_c,null), 'Window resets';
end $$;
rollback;
