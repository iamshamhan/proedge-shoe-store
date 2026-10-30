-- Keep admin reporting bounded without exposing aggregates to public clients.
create function public.admin_get_revenue_summary()
returns jsonb language plpgsql stable security invoker set search_path = ''
as $$
begin
  if public.is_admin() is not true then raise exception 'Unauthorized'; end if;
  return (select jsonb_build_object('total', coalesce(sum(total), 0), 'count', count(*))
    from public.orders where status in ('confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered'));
end;
$$;
revoke all on function public.admin_get_revenue_summary() from public, anon;
grant execute on function public.admin_get_revenue_summary() to authenticated;

create function public.admin_get_product_page(
  p_page integer default 1, p_page_size integer default 25,
  p_query text default '', p_category_ids uuid[] default null, p_filter text default 'all'
)
returns jsonb language plpgsql stable security invoker set search_path = ''
as $$
begin
  if public.is_admin() is not true then raise exception 'Unauthorized'; end if;
  if p_page is null or p_page < 1 or p_page > 100000
    or p_page_size is null or p_page_size < 1 or p_page_size > 100
    or p_query is null or length(p_query) > 100
    or p_filter is null or p_filter not in ('all', 'featured', 'on-sale', 'inactive', 'low-stock', 'out-of-stock') then
    raise exception 'Invalid product filters';
  end if;
  return (
    with matched as materialized (
      select p.* from public.products p
      where (p_query = '' or strpos(lower(p.name), lower(p_query)) > 0 or strpos(lower(p.slug), lower(p_query)) > 0)
        and (p_category_ids is null or p.category_id = any(p_category_ids))
        and case p_filter
          when 'featured' then p.featured
          when 'on-sale' then p.is_on_sale
          when 'inactive' then not p.is_active
          when 'low-stock' then coalesce((select sum(v.stock) from public.product_variants v where v.product_id = p.id), 0) between 1 and 5
          when 'out-of-stock' then coalesce((select sum(v.stock) from public.product_variants v where v.product_id = p.id), 0) = 0
          else true
        end
    ), paged as (
      select * from matched order by created_at desc, id
      limit p_page_size offset (p_page - 1) * p_page_size
    )
    select jsonb_build_object('count', (select count(*) from matched), 'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'slug', p.slug, 'price', p.price,
        'is_active', p.is_active, 'featured', p.featured, 'is_new_arrival', p.is_new_arrival,
        'is_on_sale', p.is_on_sale, 'category_id', p.category_id,
        'categories', (select jsonb_build_object('id', c.id, 'slug', c.slug, 'name', c.name, 'parent_id', c.parent_id)
          from public.categories c where c.id = p.category_id),
        'product_images', coalesce((select jsonb_agg(jsonb_build_object('url', i.url, 'sort_order', i.sort_order) order by i.sort_order, i.id)
          from public.product_images i where i.product_id = p.id), '[]'::jsonb),
        'product_variants', coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'stock', v.stock) order by v.id)
          from public.product_variants v where v.product_id = p.id), '[]'::jsonb)
      ) order by p.created_at desc, p.id) from paged p
    ), '[]'::jsonb))
  );
end;
$$;
revoke all on function public.admin_get_product_page(integer, integer, text, uuid[], text) from public, anon;
grant execute on function public.admin_get_product_page(integer, integer, text, uuid[], text) to authenticated;

-- Foreign-key lookups on catalog deletion must not scan all historical order items.
set local lock_timeout = '5s';
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_order_items_variant on public.order_items(variant_id);
