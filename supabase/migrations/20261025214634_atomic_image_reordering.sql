create or replace function public.admin_reorder_product_images(p_product_id uuid, p_image_ids uuid[])
returns void language plpgsql security invoker set search_path = ''
as $$
declare
  image_count integer;
begin
  if public.is_admin() is not true then raise exception 'Unauthorized'; end if;
  perform 1 from public.products where id = p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  perform 1 from public.product_images where product_id = p_product_id for update;
  select count(*) into image_count from public.product_images where product_id = p_product_id;
  if p_image_ids is null
    or cardinality(p_image_ids) <> image_count
    or (select count(distinct id) from unnest(p_image_ids) as ids(id)) <> image_count
    or exists (select 1 from unnest(p_image_ids) as ids(id)
      where id is null or not exists (select 1 from public.product_images image
        where image.id = ids.id and image.product_id = p_product_id)) then
    raise exception 'Gallery changed. Refresh before reordering.';
  end if;
  update public.product_images image set sort_order = ordered.position - 1
    from unnest(p_image_ids) with ordinality as ordered(id, position)
    where image.id = ordered.id and image.product_id = p_product_id;
end;
$$;
revoke all on function public.admin_reorder_product_images(uuid, uuid[]) from public, anon;
grant execute on function public.admin_reorder_product_images(uuid, uuid[]) to authenticated;
