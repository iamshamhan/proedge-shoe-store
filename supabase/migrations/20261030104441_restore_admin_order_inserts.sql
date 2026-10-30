-- Admin RPCs are SECURITY INVOKER and need INSERT privileges in addition to RLS.
-- Guest checkout remains service-only; authenticated customers still fail RLS.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "Only admins insert orders" on public.orders
  as restrictive for insert to authenticated with check ((select public.is_admin()));
create policy "Only admins insert order items" on public.order_items
  as restrictive for insert to authenticated with check ((select public.is_admin()));
revoke insert on public.orders, public.order_items from public, anon;
grant insert on public.orders, public.order_items to authenticated;
