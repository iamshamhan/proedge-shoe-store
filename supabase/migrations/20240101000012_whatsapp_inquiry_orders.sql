-- =============================================================================
-- PROEDGE: WhatsApp Order Inquiries Migration
-- =============================================================================
-- In PROEDGE's WhatsApp-first commerce model:
-- 1. Web checkout submits an order *inquiry* with status 'pending'.
-- 2. Stock is NOT deducted at web checkout time (prevents inquiries from locking stock).
-- 3. The store admin reviews the order in Admin Orders, confirms what
--    the customer actually agreed to purchase on WhatsApp (with quantity and
--    item adjustments), and clicks "Confirm Sale" to deduct stock from inventory.
-- 4. If the customer does not proceed, the admin clicks "Cancel" and no stock
--    is touched.
-- =============================================================================

-- Ensure orders columns exist
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists postal_code text;

-- Ensure order_items columns exist
alter table public.order_items alter column size type text using size::text;
alter table public.order_items add column if not exists size_system text not null default 'EU';
alter table public.order_items add column if not exists size_value text;

-- Ensure sequence exists
create sequence if not exists public.orders_seq;

-- Trusted order-placement RPC (without stock deduction)
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
  v_lines        jsonb := '[]'::jsonb;

  -- Settings defaults
  v_sale_enabled          boolean := false;
  v_discount_pct          numeric := 0;
  v_delivery_threshold    integer := 30000;
  v_default_fee           integer := 500;
  v_free_delivery_enabled boolean := true;
  v_max_items             integer := 30;
  v_max_qty               integer := 99;
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

  -- Customer details validation
  v_customer_name := trim(coalesce(p_customer->>'fullName', p_customer->>'customer_name', ''));
  v_phone        := trim(coalesce(p_customer->>'phone', ''));
  v_whatsapp     := nullif(trim(coalesce(p_customer->>'whatsapp', '')), '');
  v_email        := nullif(trim(coalesce(p_customer->>'email', '')), '');
  v_address      := trim(coalesce(p_customer->>'address', ''));
  v_city         := trim(coalesce(p_customer->>'city', ''));
  v_postal_code  := nullif(trim(coalesce(p_customer->>'postalCode', p_customer->>'postal_code', '')), '');
  v_notes        := nullif(trim(coalesce(p_customer->>'notes', '')), '');

  if v_customer_name = '' or v_phone = '' or v_address = '' or v_city = '' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_phone !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_whatsapp is not null and v_whatsapp !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ERR_CART_EMPTY' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_CART_TOO_LARGE' using errcode = 'P0001';
  end if;

  -- Validate each item and calculate totals WITHOUT deducting stock
  for v_item in select jsonb_array_elements(p_items)
  loop
    v_requested_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id'), '')::uuid;
    v_quantity             := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end if;

    -- Variant resolution
    v_variant_id := nullif(coalesce(v_item->>'variantId', v_item->>'variant_id'), '')::uuid;
    if v_variant_id is not null then
      select pv.id, pv.product_id, pv.colour, coalesce(pv.size_system, 'EU'), coalesce(pv.size_value, pv.size::text)
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

      if v_colour = '' or v_size_value = '' then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      select pv.id, pv.colour, coalesce(pv.size_system, 'EU'), coalesce(pv.size_value, pv.size::text)
        into v_variant_resolved, v_colour, v_size_system, v_size_value
        from public.product_variants pv
       where pv.product_id  = v_product_id
         and lower(pv.colour) = lower(v_colour)
         and (pv.size_value = v_size_value or pv.size::text = v_size_value)
       limit 1;

      if v_variant_resolved is null then
        raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
      end if;
    end if;

    -- Verify parent product is active and get price
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

    v_line_total := v_unit_price * v_quantity;
    v_subtotal   := v_subtotal + v_line_total;

    v_lines := v_lines || jsonb_build_object(
      'product_id',   v_product_id,
      'variant_id',   v_variant_resolved,
      'name',         v_product_name,
      'colour',       v_colour,
      'size',         v_size_value,
      'size_system',  v_size_system,
      'size_value',   v_size_value,
      'quantity',     v_quantity,
      'unit_price',   v_unit_price,
      'line_total',   v_line_total
    );
  end loop;

  -- Delivery calculation
  if v_free_delivery_enabled and v_subtotal >= v_delivery_threshold then
    v_delivery_fee := 0;
  else
    v_delivery_fee := v_default_fee;
  end if;

  v_total := v_subtotal + v_delivery_fee;

  -- Generate sequential order number
  v_order_number := 'PROE-'
    || to_char(now(), 'YYMMDD')
    || '-'
    || lpad(nextval('public.orders_seq')::text, 5, '0');

  -- Insert order header (Pending WhatsApp Inquiry)
  insert into public.orders (
    order_number,
    customer_name,
    phone,
    email,
    address,
    city,
    postal_code,
    delivery_fee,
    subtotal,
    total,
    notes,
    status
  ) values (
    v_order_number,
    v_customer_name,
    v_phone,
    v_email,
    v_address,
    v_city,
    v_postal_code,
    v_delivery_fee,
    v_subtotal,
    v_total,
    v_notes,
    'pending'
  )
  returning id into v_order_id;

  -- Insert order items
  for v_item in select jsonb_array_elements(v_lines)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      colour,
      size,
      size_system,
      size_value,
      quantity,
      unit_price
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      v_item->>'name',
      v_item->>'colour',
      v_item->>'size',
      coalesce(v_item->>'size_system', 'EU'),
      coalesce(v_item->>'size_value', v_item->>'size'),
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::integer
    );
  end loop;

  return jsonb_build_object(
    'order_id',      v_order_id,
    'order_number',  v_order_number,
    'status',        'pending',
    'subtotal',      v_subtotal,
    'delivery_fee',  v_delivery_fee,
    'total',         v_total,
    'customer', jsonb_build_object(
      'fullName',    v_customer_name,
      'phone',       v_phone,
      'whatsapp',    v_whatsapp,
      'email',       v_email,
      'address',     v_address,
      'city',        v_city,
      'postalCode',  v_postal_code,
      'notes',       v_notes
    ),
    'items', v_lines
  );
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
