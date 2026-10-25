-- These functions use only JWT claims and pg_catalog built-ins.
alter function public.is_admin() security invoker;
alter function public.is_admin() set search_path = '';
alter function public.set_updated_at() set search_path = '';

-- Check the role predicate without changing data or session state permanently.
do $$
begin
  begin
    perform set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{"is_admin":true}}',true);
    assert public.is_admin(), 'Admin claim must still be recognized';
    perform set_config('request.jwt.claims','{"role":"authenticated","app_metadata":{}}',true);
    assert not public.is_admin(), 'Non-admin must remain denied';
    perform set_config('request.jwt.claims','{"role":"anon"}',true);
    assert not public.is_admin(), 'Anonymous must remain denied';
    raise exception using errcode='ZX003',message='rollback test claims';
  exception when sqlstate 'ZX003' then null; end;
end $$;

