begin;
-- Close both direct table writes and the SECURITY DEFINER RPC bypass.
revoke insert on public.orders, public.order_items from public, anon, authenticated;
revoke execute on function public.place_order(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb,jsonb) to service_role;

create table proedge_private.checkout_limits (
  key text primary key,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0)
);
create index checkout_limits_window_idx on proedge_private.checkout_limits(window_start);
alter table proedge_private.checkout_limits enable row level security;
revoke all on proedge_private.checkout_limits from public, anon, authenticated;

-- Separate committed RPC: failed order attempts still consume capacity.
create function public.consume_checkout_limits(p_ip text, p_email text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_key text;
  v_count integer;
  v_limit integer;
  v_now timestamptz := clock_timestamp();
  v_allowed boolean := true;
begin
  if p_ip is null or p_ip !~ '^[a-f0-9]{64}$'
    or (p_email is not null and p_email !~ '^[a-f0-9]{64}$') then
    raise exception 'ERR_INVALID_LIMIT_KEY';
  end if;
  -- Stable ordering and row locks serialize concurrent calls on every instance.
  for v_key, v_limit in
    select k, n from (values ('ip:' || p_ip, 10), ('email:' || p_email, 3)) as limits(k,n)
    where k is not null order by k
  loop
    insert into proedge_private.checkout_limits as current (key, window_start, attempts)
    values (v_key, v_now, 1)
    on conflict (key) do update set
      window_start = case when current.window_start <= v_now - interval '1 hour' then v_now else current.window_start end,
      attempts = case when current.window_start <= v_now - interval '1 hour' then 1 else least(current.attempts + 1, 1000000) end
    returning attempts into v_count;
    if v_count > v_limit then v_allowed := false; end if;
  end loop;
  delete from proedge_private.checkout_limits where window_start < v_now - interval '2 hours';
  return v_allowed;
end;
$$;
revoke all on function public.consume_checkout_limits(text,text) from public, anon, authenticated;
grant execute on function public.consume_checkout_limits(text,text) to service_role;
commit;
