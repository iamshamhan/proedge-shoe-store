-- 1. Ensure orders sequence exists
create sequence if not exists public.orders_seq;

-- 2. Ensure store_settings table exists
create table if not exists public.store_settings (
  id text primary key,
  sale_enabled boolean not null default false,
  sale_discount_percent numeric not null default 0,
  hero_product_id text,
  brand_name text default 'PROEDGE',
  contact_address text default 'Galle Road, Colombo 03, Sri Lanka',
  contact_phone text default '+94 11 234 5678',
  contact_email text default 'support@proedge.lk',
  free_delivery_enabled boolean default true,
  free_delivery_threshold integer default 30000,
  default_delivery_fee integer default 500,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.store_settings (id, sale_enabled, sale_discount_percent)
values ('default', false, 0)
on conflict (id) do nothing;

-- 3. Replace the place_order RPC to ensure it perfectly handles the new sizes and store settings
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

  v_item                 jsonb;
  v_requested_product_id uuid;
  v_variant_product_id   uuid;
  v_product_id           uuid;
  v_variant_id           uuid;
  v_variant_resolved     uuid;
  v_colour               text;
  v_size_value           text;
  v_size_system          text;
  v_quantity             integer;
  v_unit_price           integer;
  v_product_name         text;

  v_subtotal     bigint := 0;
  v_line_total   bigint;
  v_delivery_fee integer;
  v_total        bigint;

  v_order_id     uuid;
  v_order_number text;
  v_updated      integer;
  v_lines        jsonb := '[]'::jsonb;

  -- Settings defaults
  v_sale_enabled         boolean := false;
  v_discount_pct         numeric := 0;
  v_delivery_threshold   integer := 30000;
  v_default_fee          integer := 500;
  v_free_delivery_enabled boolean := true;
  v_max_items            integer := 30;
  v_max_qty              integer := 99;
begin
  -- Try to load dynamic store settings if table exists
  begin
    select
      coalesce(sale_enabled, false),
      coalesce(sale_discount_percent, 0),
      coalesce(free_delivery_enabled, true),
      coalesce(free_delivery_threshold, 30000),
      coalesce(default_delivery_fee, 500)
    into
      v_sale_enabled,
      v_discount_pct,
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

  if v_customer_name = '' or v_phone = '' or v_address = '' or v_city = '' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if not (v_phone ~ '^0[0-9]{9}$') then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_whatsapp is not null and not (v_whatsapp ~ '^0[0-9]{9}$') then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_email is not null and not (v_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ERR_CART_EMPTY' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_CART_TOO_LARGE' using errcode = 'P0001';
  end if;

  for v_item in select jsonb_array_elements(p_items)
  loop
    v_requested_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id'), '')::uuid;
    v_quantity             := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end if;

    v_variant_id := nullif(coalesce(v_item->>'variantId', v_item->>'variant_id'), '')::uuid;
    if v_variant_id is not null then
      select pv.id, pv.product_id, pv.colour, pv.size_system, pv.size_value
        into v_variant_resolved, v_variant_product_id, v_colour, v_size_system, v_size_value
        from public.product_variants pv
       where pv.id = v_variant_id;

      if v_variant_resolved is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      if v_requested_product_id is not null and v_requested_product_id <> v_variant_product_id then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      v_product_id := v_variant_product_id;
    else
      if v_requested_product_id is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      v_product_id  := v_requested_product_id;
      v_colour      := trim(coalesce(v_item->>'colour', v_item->>'color', ''));
      v_size_value  := trim(coalesce(v_item->>'sizeValue', v_item->>'size_value', v_item->>'size', ''));
      v_size_system := trim(coalesce(v_item->>'sizeSystem', v_item->>'size_system', 'EU'));

      if v_colour = '' or v_size_value = '' or v_size_system not in ('UK', 'US', 'EU', 'Custom') then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      select pv.id, pv.colour, pv.size_system, pv.size_value
        into v_variant_resolved, v_colour, v_size_system, v_size_value
        from public.product_variants pv
       where pv.product_id  = v_product_id
         and pv.colour      = v_colour
         and pv.size_system = v_size_system
         and pv.size_value  = v_size_value;

      if v_variant_resolved is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;
    end if;

    select p.name, p.price
      into v_product_name, v_unit_price
      from public.products p
     where p.id = v_product_id
       and p.is_active = true;

    if v_product_name is null then
      raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    if v_sale_enabled and v_discount_pct > 0 then
      v_unit_price := v_unit_price - (v_unit_price * (v_discount_pct / 100.0))::integer;
    end if;

    update public.product_variants
       set stock = stock - v_quantity
     where id = v_variant_resolved
       and stock >= v_quantity;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'ERR_INSUFFICIENT_STOCK' using errcode = 'P0001';
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal   := v_subtotal + v_line_total;

    v_lines := v_lines || jsonb_build_object(
      'product_id',   v_product_id,
      'variant_id',   v_variant_resolved,
      'name',         v_product_name,
      'colour',       v_colour,
      'size_system',  v_size_system,
      'size_value',   v_size_value,
      'quantity',     v_quantity,
      'unit_price',   v_unit_price,
      'line_total',   v_line_total
    );
  end loop;

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
    (order_number, customer, items, subtotal, delivery_fee, total, status)
  values
    (v_order_number, 
     jsonb_build_object(
       'fullName', v_customer_name,
       'phone', v_phone,
       'whatsapp', v_whatsapp,
       'email', v_email,
       'address', v_address,
       'city', v_city,
       'postalCode', v_postal_code,
       'notes', v_notes
     ),
     v_lines,
     v_subtotal, v_delivery_fee, v_total, 'pending')
  returning id into v_order_id;

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
