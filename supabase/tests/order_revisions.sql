-- Synthetic fixture and all updates roll back on success as well as failure.
begin;
set local role authenticated;
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
rollback;
