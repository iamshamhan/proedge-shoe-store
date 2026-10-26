-- Local test database only. All test writes are rolled back.
begin;
do $$
declare i integer;
begin
  assert not has_function_privilege('anon','public.place_order(jsonb,jsonb)','execute');
  assert not has_function_privilege('authenticated','public.place_order(jsonb,jsonb)','execute');
  assert not has_table_privilege('anon','public.orders','insert');
  assert not has_table_privilege('anon','public.order_items','insert');
  assert not has_function_privilege('anon','public.consume_checkout_limits(text,text)','execute');
  assert has_function_privilege('service_role','public.place_order(jsonb,jsonb)','execute');
  for i in 1..3 loop
    assert public.consume_checkout_limits(repeat('a',64),repeat('b',64));
  end loop;
  assert not public.consume_checkout_limits(repeat('c',64),repeat('b',64)), 'Email limit across IPs';
  for i in 1..10 loop
    assert public.consume_checkout_limits(repeat('d',64),null);
  end loop;
  assert not public.consume_checkout_limits(repeat('d',64),null), 'IP limit without email';
  update proedge_private.checkout_limits set window_start=now()-interval '61 minutes';
  assert public.consume_checkout_limits(repeat('d',64),null), 'Window resets';
end $$;
rollback;
