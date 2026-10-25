begin;
set local role authenticated;
select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"is_admin":false}}',true);
do $$ begin
  begin
    perform public.admin_duplicate_product(gen_random_uuid());
    raise exception 'Expected authorization rejection';
  exception when raise_exception then
    if sqlerrm <> 'Unauthorized' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"is_admin":true}}',true);
do $$
declare c uuid:=gen_random_uuid(); p uuid:=gen_random_uuid(); result jsonb; copy_id uuid; n integer;
begin
  insert into public.categories(id,slug,name) values(c,'catalog-test-'||c,'Catalog test');
  insert into public.products(id,category_id,name,slug,brand,price)
    values(p,c,'Catalog test','catalog-test-'||p,'Fixture brand',1000);
  insert into public.product_images(product_id,url,sort_order) values(p,'https://example.invalid/shared.png',0);
  insert into public.product_variants(product_id,colour,size_system,size_value,stock)
    values(p,'Black','UK','8.5',7),(p,'Black','US','8.5',9);
  result:=public.admin_duplicate_product(p);
  copy_id:=(result->>'id')::uuid;
  assert exists(select 1 from public.products where id=copy_id and brand='Fixture brand' and not is_active),'Copy brand and inactive state';
  select count(*) into n from public.product_variants where product_id=copy_id;
  assert n=2,'Both sizing systems copied';
  assert exists(select 1 from public.product_images where product_id=copy_id and url='https://example.invalid/shared.png'),'Image copied';
  update public.product_variants set stock=5 where product_id=p and size_system='UK';
  update public.product_variants set stock=20 where product_id=p and size_system='UK' and stock=7;
  get diagnostics n=row_count;
  assert n=0,'Stale stock edit must not overwrite newer stock';
  delete from public.products where id=copy_id;
  assert exists(select 1 from public.product_images where product_id=p),'Deleting copy preserves original image row';
end $$;
rollback;
