-- Atomic catalog copy. Shared storage objects are retained by application deletion paths.
create or replace function public.admin_duplicate_product(p_source_id uuid)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  source public.products%rowtype;
  new_id uuid := gen_random_uuid();
  new_slug text;
begin
  if not public.is_admin() then raise exception 'Unauthorized'; end if;
  select * into source from public.products where id = p_source_id for share;
  if not found then raise exception 'Source product not found'; end if;
  new_slug := source.slug || '-copy-' || new_id::text;
  insert into public.products
    (id, category_id, name, slug, brand, description, price, compare_at_price,
     featured, is_new_arrival, is_on_sale, is_active)
  values (new_id, source.category_id, source.name || ' (Copy)', new_slug,
    source.brand, source.description, source.price, source.compare_at_price,
    source.featured, source.is_new_arrival, source.is_on_sale, false);
  insert into public.product_images (product_id, url, alt_text, sort_order)
    select new_id, url, alt_text, sort_order from public.product_images where product_id = p_source_id;
  insert into public.product_variants (product_id, colour, size, size_system, size_value, stock)
    select new_id, colour, size, size_system, size_value, stock
    from public.product_variants where product_id = p_source_id;
  return jsonb_build_object('id', new_id, 'slug', new_slug);
end;
$$;
revoke all on function public.admin_duplicate_product(uuid) from public, anon;
grant execute on function public.admin_duplicate_product(uuid) to authenticated;
