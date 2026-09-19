-- =============================================================================
-- PROEDGE: Store Settings Migration (Free Delivery & Delivery Settings)
-- =============================================================================
-- Run this in the Supabase SQL Editor to enable editable Store Settings in Admin.
-- Safe to re-run (idempotent).
-- =============================================================================

-- 1. Create store_settings table
create table if not exists public.store_settings (
  id                      text primary key default 'default',
  free_delivery_enabled   boolean not null default true,
  free_delivery_threshold integer not null default 30000 check (free_delivery_threshold >= 0),
  default_delivery_fee    integer not null default 500 check (default_delivery_fee >= 0),
  banner_tagline          text default 'Built for Your Next Step',
  updated_at              timestamptz not null default now()
);

-- 2. Updated-at trigger
drop trigger if exists set_timestamp_store_settings on public.store_settings;
create trigger set_timestamp_store_settings
before update on public.store_settings
for each row execute function set_updated_at();

-- 3. Row Level Security (RLS)
alter table public.store_settings enable row level security;

-- Public can read store settings
drop policy if exists "Public read store settings" on public.store_settings;
create policy "Public read store settings"
on public.store_settings for select
using (true);

-- Admin can manage store settings
drop policy if exists "Admin manage store settings" on public.store_settings;
create policy "Admin manage store settings"
on public.store_settings for all
to authenticated
using (is_admin())
with check (is_admin());

-- 4. Seed default row
insert into public.store_settings (
  id,
  free_delivery_enabled,
  free_delivery_threshold,
  default_delivery_fee,
  banner_tagline
)
values (
  'default',
  true,
  30000,
  500,
  'Built for Your Next Step'
)
on conflict (id) do nothing;

-- 5. Update place_order function to read store_settings dynamically
create or replace function public.place_order(
  p_customer jsonb,
  p_items    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_name text;
  v_phone        text;
  v_whatsapp     text;
  v_email        text;
  v_address      text;
  v_city         text;
  v_postal_code  text;
  v_notes        text;

  v_item         jsonb;
  v_line         jsonb;
  v_product_id   uuid;
  v_variant_id   uuid;
  v_variant_resolved uuid;
  v_colour       text;
  v_size         integer;
  v_quantity     integer;
  v_unit_price   integer;
  v_product_name text;

  v_subtotal     bigint := 0;
  v_line_total   bigint;
  v_delivery_fee integer;
  v_total        bigint;

  v_order_id     uuid;
  v_order_number text;
  v_updated      integer;
  v_lines        jsonb := '[]'::jsonb;

  -- Default settings fallback
  v_delivery_threshold   integer := 30000;
  v_default_fee          integer := 500;
  v_free_delivery_enabled boolean := true;
  v_max_items            integer := 30;
  v_max_qty              integer := 99;
begin
  -- Try to load dynamic store settings if table exists
  begin
    select
      coalesce(free_delivery_enabled, true),
      coalesce(free_delivery_threshold, 30000),
      coalesce(default_delivery_fee, 500)
    into
      v_free_delivery_enabled,
      v_delivery_threshold,
      v_default_fee
    from public.store_settings
    where id = 'default';
  exception when others then
    null;
  end;

  -- Customer details
  v_customer_name := trim(coalesce(p_customer->>'fullName', ''));
  v_phone        := trim(coalesce(p_customer->>'phone', ''));
  v_whatsapp     := nullif(trim(coalesce(p_customer->>'whatsapp', '')), '');
  v_email        := nullif(trim(coalesce(p_customer->>'email', '')), '');
  v_address      := trim(coalesce(p_customer->>'address', ''));
  v_city         := trim(coalesce(p_customer->>'city', ''));
  v_postal_code  := nullif(trim(coalesce(p_customer->>'postalCode', '')), '');
  v_notes        := nullif(trim(coalesce(p_customer->>'notes', '')), '');

  if v_customer_name = '' then
    raise exception 'ERR_CUSTOMER_INVALID: Full name is required' using errcode = 'P0001';
  end if;
  if v_phone !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID: Valid phone number is required' using errcode = 'P0001';
  end if;
  if v_whatsapp is not null and v_whatsapp !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID: Valid WhatsApp number is required' using errcode = 'P0001';
  end if;
  if v_email is not null and v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'ERR_CUSTOMER_INVALID: Valid email address is required' using errcode = 'P0001';
  end if;
  if v_address = '' then
    raise exception 'ERR_CUSTOMER_INVALID: Address is required' using errcode = 'P0001';
  end if;
  if v_city = '' then
    raise exception 'ERR_CUSTOMER_INVALID: City is required' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ERR_CART_EMPTY: Cart is empty' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_CART_TOO_LARGE: Too many items' using errcode = 'P0001';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    begin
      v_product_id := (v_item->>'productId')::uuid;
    exception when others then
      raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end;

    begin
      v_quantity := (v_item->>'quantity')::integer;
      if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
        raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
      end if;
    exception when others then
      if sqlstate = 'P0001' then raise; end if;
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end;

    select name, price into v_product_name, v_unit_price
    from public.products
    where id = v_product_id and is_active = true;

    if not found then
      raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    v_variant_id := null;
    if (v_item ? 'variantId') and (v_item->>'variantId') is not null and (v_item->>'variantId') <> '' then
      begin
        v_variant_id := (v_item->>'variantId')::uuid;
      exception when others then
        v_variant_id := null;
      end;
    end if;

    if v_variant_id is not null then
      update public.product_variants
      set stock = stock - v_quantity
      where id = v_variant_id and product_id = v_product_id and stock >= v_quantity
      returning id, colour, size into v_variant_resolved, v_colour, v_size;

      if not found then
        perform 1 from public.product_variants where id = v_variant_id and product_id = v_product_id;
        if found then
          raise exception 'ERR_INSUFFICIENT_STOCK' using errcode = 'P0001';
        else
          raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
        end if;
      end if;
    else
      v_colour := trim(coalesce(v_item->>'color', ''));
      begin
        v_size := (v_item->>'size')::integer;
      exception when others then
        v_size := null;
      end;

      if v_colour = '' or v_size is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      update public.product_variants
      set stock = stock - v_quantity
      where id = (
        select id from public.product_variants
        where product_id = v_product_id
          and lower(colour) = lower(v_colour)
          and size = v_size
        for update
      ) and stock >= v_quantity
      returning id, colour, size into v_variant_resolved, v_colour, v_size;

      if not found then
        perform 1 from public.product_variants
        where product_id = v_product_id
          and lower(colour) = lower(v_colour)
          and size = v_size;
        if found then
          raise exception 'ERR_INSUFFICIENT_STOCK' using errcode = 'P0001';
        else
          raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
        end if;
      end if;
    end if;

    v_line_total := (v_unit_price::bigint) * (v_quantity::bigint);
    begin
      v_subtotal := v_subtotal + v_line_total;
    exception when numeric_value_out_of_range then
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end;

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product_id,
      'variant_id', v_variant_resolved,
      'name', v_product_name,
      'colour', v_colour,
      'size', v_size,
      'quantity', v_quantity,
      'unit_price', v_unit_price,
      'line_total', v_line_total
    );
  end loop;

  -- Compute delivery fee dynamically according to store_settings
  if v_free_delivery_enabled and v_subtotal >= v_delivery_threshold then
    v_delivery_fee := 0;
  else
    v_delivery_fee := v_default_fee;
  end if;

  v_total := v_subtotal + v_delivery_fee;

  v_order_number := 'PROE-'
    || to_char(now(), 'YYMMDD')
    || '-'
    || lpad(nextval('public.orders_seq')::text, 5, '0');

  insert into public.orders
    (order_number, customer_name, phone, email, address, city, postal_code,
     delivery_fee, subtotal, total, notes, status)
  values
    (v_order_number, v_customer_name, v_phone, v_email, v_address, v_city, v_postal_code,
     v_delivery_fee, v_subtotal, v_total, v_notes, 'pending')
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(v_lines) loop
    insert into public.order_items
      (order_id, product_id, variant_id, product_name, colour, size, quantity, unit_price)
    values
      (
        v_order_id,
        (v_line->>'product_id')::uuid,
        (v_line->>'variant_id')::uuid,
        v_line->>'name',
        v_line->>'colour',
        (v_line->>'size')::integer,
        (v_line->>'quantity')::integer,
        (v_line->>'unit_price')::integer
      );
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'status', 'pending',
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'customer', jsonb_build_object(
      'fullName', v_customer_name,
      'phone', v_phone,
      'whatsapp', v_whatsapp,
      'email', v_email,
      'address', v_address,
      'city', v_city,
      'postalCode', v_postal_code,
      'notes', v_notes
    ),
    'items', v_lines
  );
end;
$$;
