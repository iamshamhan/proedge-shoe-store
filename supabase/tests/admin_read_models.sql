begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"is_admin":false}}', true);
do $$ begin
  begin
    perform public.admin_get_revenue_summary();
    raise exception 'Expected authorization rejection';
  exception when raise_exception then
    if sqlerrm <> 'Unauthorized' then raise; end if;
  end;
  begin
    perform public.admin_get_product_page();
    raise exception 'Expected authorization rejection';
  exception when raise_exception then
    if sqlerrm <> 'Unauthorized' then raise; end if;
  end;
  begin
    perform public.admin_reorder_product_images(gen_random_uuid(), array[]::uuid[]);
    raise exception 'Expected authorization rejection';
  exception when raise_exception then
    if sqlerrm <> 'Unauthorized' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"is_admin":true}}', true);
do $$
declare
  c uuid := gen_random_uuid(); p uuid; first_product uuid; image_a uuid := gen_random_uuid(); image_b uuid := gen_random_uuid();
  page_one jsonb; result jsonb; baseline jsonb; n integer; old_revision timestamptz;
begin
  insert into public.categories(id, slug, name) values(c, 'admin-read-test-' || c, 'Admin read test');
  for n in 1..27 loop
    p := gen_random_uuid();
    if n = 1 then first_product := p; end if;
    insert into public.products(id, category_id, name, slug, price, featured, is_on_sale, is_active, updated_at)
      values(p, c, 'Fixture ' || n, 'read-test-' || p, 1000, n = 1, n = 2, n <> 3, '2020-01-01');
    insert into public.product_variants(product_id, colour, size_system, size_value, stock)
      values(p, 'Black', 'UK', '8', 2);
  end loop;
  page_one := public.admin_get_product_page(1, 25, '', array[c], 'low-stock');
  result := public.admin_get_product_page(2, 25, '', array[c], 'low-stock');
  assert (result->>'count')::integer = 27 and jsonb_array_length(result->'products') = 2, 'Stock paging must retain full count';
  assert not exists(select 1 from jsonb_array_elements(page_one->'products') a
    join jsonb_array_elements(result->'products') b on a->>'id' = b->>'id'), 'Pages must not overlap';
  result := public.admin_get_product_page(3, 25, '', array[c], 'low-stock');
  assert (result->>'count')::integer = 27 and result->'products' = '[]'::jsonb, 'Empty page retains count';
  result := public.admin_get_product_page(1, 25, 'Fixture 27', array[c], 'low-stock');
  assert (result->>'count')::integer = 1, 'Search combined with stock filter';
  result := public.admin_get_product_page(1, 25, '', array[c], 'featured');
  assert (result->>'count')::integer = 1, 'Featured filter';
  result := public.admin_get_product_page(1, 25, '', array[c], 'on-sale');
  assert (result->>'count')::integer = 1, 'Sale filter';
  result := public.admin_get_product_page(1, 25, '', array[c], 'inactive');
  assert (result->>'count')::integer = 1, 'Inactive filter';
  result := public.admin_get_product_page(1, 25, '', array[]::uuid[], 'all');
  assert (result->>'count')::integer = 0, 'Unknown category must not show all products';
  update public.product_variants set stock = 0 where product_id = first_product;
  result := public.admin_get_product_page(1, 25, '', array[c], 'out-of-stock');
  assert (result->>'count')::integer = 1, 'Out of stock filter';

  select updated_at into old_revision from public.products where id = first_product;
  update public.products set name = 'New edit' where id = first_product and updated_at = old_revision;
  update public.products set name = 'Stale edit' where id = first_product and updated_at = old_revision;
  get diagnostics n = row_count;
  assert n = 0, 'Timestamp predicate must reject stale product edits';

  insert into public.product_images(id, product_id, url, sort_order)
    values(image_a, first_product, 'https://example.invalid/a.png', 0), (image_b, first_product, 'https://example.invalid/b.png', 1);
  perform public.admin_reorder_product_images(first_product, array[image_b, image_a]);
  assert (select sort_order from public.product_images where id = image_b) = 0, 'Reorder persisted';
  begin
    perform public.admin_reorder_product_images(first_product, array[image_a, image_a]);
    raise exception 'Expected stale gallery rejection';
  exception when raise_exception then
    if sqlerrm <> 'Gallery changed. Refresh before reordering.' then raise; end if;
  end;
  assert (select sort_order from public.product_images where id = image_b) = 0, 'Rejected reorder remains atomic';

  baseline := public.admin_get_revenue_summary();
  insert into public.orders(order_number, customer_name, phone, address, status, total)
    values('TEST-' || gen_random_uuid(), 'Rollback fixture', '0000000000', 'Fixture', 'ready_to_ship', 1234),
      ('TEST-' || gen_random_uuid(), 'Rollback fixture', '0000000000', 'Fixture', 'pending', 9876),
      ('TEST-' || gen_random_uuid(), 'Rollback fixture', '0000000000', 'Fixture', 'cancelled', 9876);
  result := public.admin_get_revenue_summary();
  assert (result->>'total')::bigint = (baseline->>'total')::bigint + 1234, 'Revenue includes ready-to-ship and excludes inquiries/cancellations';
  assert (result->>'count')::bigint = (baseline->>'count')::bigint + 1, 'Revenue count';
  assert not has_function_privilege('anon', 'public.admin_get_revenue_summary()', 'EXECUTE'), 'No public revenue access';
  assert not has_function_privilege('anon', 'public.admin_get_product_page(integer,integer,text,uuid[],text)', 'EXECUTE'), 'No public catalog admin access';
end $$;
rollback;
