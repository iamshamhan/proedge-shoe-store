-- Monotonic versions prevent stale admin screens from overwriting newer orders.
alter table public.orders add column if not exists revision integer not null default 0;
create or replace function proedge_private.bump_order_revision()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  new.revision := old.revision + 1;
  return new;
end $$;
create trigger orders_revision before update on public.orders
for each row execute function proedge_private.bump_order_revision();

create function public.admin_check_order_revision(p_order_id uuid,p_revision integer)
returns void language plpgsql security invoker set search_path='' as $$
declare current_revision integer;
begin
  if not coalesce(public.is_admin(),false) then raise insufficient_privilege; end if;
  select revision into current_revision from public.orders where id=p_order_id for update;
  if not found then raise exception 'ERR_ORDER_NOT_FOUND'; end if;
  if p_revision is null or current_revision <> p_revision then raise exception 'ERR_ORDER_CHANGED'; end if;
end $$;

create function public.admin_save_order_checked(p_order_id uuid,p_revision integer,p_items jsonb,p_delivery_fee integer,p_notes text)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
  perform public.admin_check_order_revision(p_order_id,p_revision);
  return public.admin_save_order(p_order_id,p_items,p_delivery_fee,p_notes);
end $$;
create function public.admin_change_order_status_checked(p_order_id uuid,p_revision integer,p_status text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  perform public.admin_check_order_revision(p_order_id,p_revision);
  perform public.admin_change_order_status(p_order_id,p_status);
end $$;
create function public.admin_delete_order_checked(p_order_id uuid,p_revision integer)
returns void language plpgsql security invoker set search_path='' as $$
begin
  perform public.admin_check_order_revision(p_order_id,p_revision);
  perform public.admin_delete_order(p_order_id);
end $$;

-- One statement gives the editor a consistent header/items/version snapshot.
create function public.admin_get_order_snapshot(p_order_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
  if not coalesce(public.is_admin(),false) then raise insufficient_privilege; end if;
  select jsonb_build_object('revision',o.revision,'deliveryFee',o.delivery_fee,'notes',o.notes,
    'items',coalesce((select jsonb_agg(to_jsonb(i)||jsonb_build_object('current_stock',
      coalesce(v.stock,0) + case when o.status not in ('pending','cancelled') then
        coalesce((select sum(quantity) from public.order_items where order_id=o.id and variant_id=i.variant_id),0)
        else 0 end) order by i.id)
      from public.order_items i left join public.product_variants v on v.id=i.variant_id
      where i.order_id=o.id),'[]'::jsonb)) into result
    from public.orders o where o.id=p_order_id;
  if result is null then raise exception 'ERR_ORDER_NOT_FOUND'; end if;
  return result;
end $$;

revoke all on function public.admin_check_order_revision(uuid,integer) from public,anon;
revoke all on function public.admin_save_order_checked(uuid,integer,jsonb,integer,text) from public,anon;
revoke all on function public.admin_change_order_status_checked(uuid,integer,text) from public,anon;
revoke all on function public.admin_delete_order_checked(uuid,integer) from public,anon;
revoke all on function public.admin_get_order_snapshot(uuid) from public,anon;
grant execute on function public.admin_check_order_revision(uuid,integer) to authenticated;
grant execute on function public.admin_save_order_checked(uuid,integer,jsonb,integer,text) to authenticated;
grant execute on function public.admin_change_order_status_checked(uuid,integer,text) to authenticated;
grant execute on function public.admin_delete_order_checked(uuid,integer) to authenticated;
grant execute on function public.admin_get_order_snapshot(uuid) to authenticated;
-- Synthetic fixture and all updates roll back on success as well as failure.
do $$
declare o uuid:=gen_random_uuid(); snapshot jsonb;
begin
  begin
    perform set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"is_admin":true}}',true);
    insert into public.orders(id,order_number,customer_name,phone,address,city,status)
      values(o,'REVISION-TEST-'||o,'Fixture','0770000000','Fixture','Colombo','pending');
    snapshot:=public.admin_get_order_snapshot(o);
    assert (snapshot->>'revision')::integer=0;
    perform public.admin_change_order_status_checked(o,0,'cancelled');
    assert (select revision from public.orders where id=o)=1;
    begin
      perform public.admin_change_order_status_checked(o,0,'pending');
      raise exception 'Stale status accepted';
    exception when raise_exception then if sqlerrm<>'ERR_ORDER_CHANGED' then raise; end if; end;
    begin
      perform public.admin_save_order_checked(o,0,'[]',0,null);
      raise exception 'Stale edit accepted';
    exception when raise_exception then if sqlerrm<>'ERR_ORDER_CHANGED' then raise; end if; end;
    begin
      perform public.admin_delete_order_checked(o,0);
      raise exception 'Stale delete accepted';
    exception when raise_exception then if sqlerrm<>'ERR_ORDER_CHANGED' then raise; end if; end;
    assert (select status from public.orders where id=o)='cancelled';
    perform public.admin_delete_order_checked(o,1);
    assert not exists(select 1 from public.orders where id=o);
    raise exception using errcode='ZX004',message='rollback revision fixture';
  exception when sqlstate 'ZX004' then null; end;
end $$;
