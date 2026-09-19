/*
 * PROEDGE shoe-store - Stage 6: Secure Orders + Checkout + WhatsApp
 * -----------------------------------------------------------------
 * Run this file in the Supabase SQL Editor AFTER schema.sql + seed.sql.
 * Re-runnable (idempotent unless noted).
 *
 * What it does:
 *   1) Adds city / postal_code to orders; expands status to the full
 *      workflow: pending, confirmed, processing, ready_to_ship, shipped,
 *      delivered, cancelled.
 *   2) Drops the insecure DEMO-ONLY public INSERT policies on orders and
 *      order_items (client-supplied prices/totals are no longer accepted).
 *   3) Creates the trusted, atomic order-placement function place_order()
 *      which recalculates price, stock, subtotal, delivery fee and total
 *      inside one transaction. Anon/authenticated users may call this RPC,
 *      but can no longer INSERT order rows directly.
 */

-- 1. Orders schema -----------------------------------------------------------

alter table public.orders
  add column if not exists city text;

alter table public.orders
  add column if not exists postal_code text;

-- Full status workflow (was: pending, processing, shipped, delivered, cancelled)
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','confirmed','processing','ready_to_ship','shipped','delivered','cancelled'));

-- Deterministic unique order numbers: PROE-YYMMDD-NNNNN
create sequence if not exists public.orders_seq;

-- 2. Remove the insecure public INSERT paths --------------------------------
-- Demo policy allowed ANY visitor to insert rows with client-supplied
-- prices/totals. Replaced by the server-side RPC below.
drop policy if exists "Public submit orders (demo only)" on public.orders;
drop policy if exists "Public submit order items (demo only)" on public.order_items;

-- 3. Trusted order-placement RPC --------------------------------------------
create or replace function public.place_order(p_customer jsonb, p_items jsonb)
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

  v_delivery_threshold integer := 30000; -- must mirror STORE_CONFIG.freeDeliveryThreshold
  v_default_fee        integer := 500;   -- must mirror STORE_CONFIG.defaultDeliveryFee
  v_max_items          integer := 30;
  v_max_qty            integer := 99;
begin
  -- Customer details (validated server-side; client values are identifiers only)
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

  -- Phone formats are enforced at the server boundary too (defense in depth).
  if v_phone !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;
  if v_whatsapp is not null and v_whatsapp !~ '^0[0-9]{9}$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;
  if v_email is not null and v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'ERR_CUSTOMER_INVALID' using errcode = 'P0001';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
  end if;

  -- Per-line validation. Any failure aborts the whole transaction.
  for v_item in select * from jsonb_array_elements(p_items) loop
    begin
      v_product_id := coalesce(
        nullif(v_item->>'productId', '')::uuid,
        nullif(v_item->>'product_id', '')::uuid
      );
      v_quantity := (v_item->>'quantity')::integer;

      if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
        raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
      end if;

      -- Resolve the variant: by explicit variant id, else natural key
      -- (product_id + colour + size). Never trust client price/name/stock.
      v_variant_id := nullif(coalesce(v_item->>'variantId', v_item->>'variant_id'), '');
      if v_variant_id is not null then
        select pv.id, pv.product_id, pv.colour, pv.size
          into v_variant_resolved, v_product_id, v_colour, v_size
          from public.product_variants pv
         where pv.id = v_variant_id::uuid;
        if v_variant_resolved is null then
          raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
        end if;
      else
        v_colour := coalesce(v_item->>'colour', v_item->>'color', '');
        v_size   := (v_item->>'size')::integer;
        select pv.id
          into v_variant_resolved
          from public.product_variants pv
         where pv.product_id = v_product_id
           and pv.colour = v_colour
           and pv.size = v_size;
        if v_variant_resolved is null then
          raise exception 'ERR_VARIANT_UNAVAILABLE' using errcode = 'P0001';
        end if;
      end if;

      -- Product must exist and be active. Price/name come from the DB.
      select p.name, p.price
        into v_product_name, v_unit_price
        from public.products p
       where p.id = v_product_id
         and p.is_active = true;
      if v_product_name is null then
        raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
      end if;

      -- Atomic, race-condition-safe stock deduction.
      update public.product_variants pv
         set stock = pv.stock - v_quantity
       where pv.id = v_variant_resolved
         and pv.stock >= v_quantity;
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        raise exception 'ERR_INSUFFICIENT_STOCK' using errcode = 'P0001';
      end if;

      v_line_total := v_unit_price * v_quantity;
      v_subtotal   := v_subtotal + v_line_total;

      v_lines := v_lines || jsonb_build_object(
        'product_id',  v_product_id,
        'variant_id',  v_variant_resolved,
        'name',        v_product_name,
        'colour',      v_colour,
        'size',        v_size,
        'quantity',    v_quantity,
        'unit_price',  v_unit_price,
        'line_total',  v_line_total
      );
    exception
      when others then
        if sqlstate = 'P0001' then
          raise;
        end if;
        raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end;
  end loop;

  -- Delivery fee computed from the DB-derived subtotal (same rule as the app).
  v_delivery_fee := case
      when v_subtotal >= v_delivery_threshold then 0
      else v_default_fee
    end;
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
      (v_order_id,
       (v_line->>'product_id')::uuid,
       (v_line->>'variant_id')::uuid,
       v_line->>'name',
       v_line->>'colour',
       (v_line->>'size')::integer,
       (v_line->>'quantity')::integer,
       (v_line->>'unit_price')::integer);
  end loop;

  return jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_number,
    'status',       'pending',
    'subtotal',     v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total',        v_total,
    'customer', jsonb_build_object(
      'fullName',   v_customer_name,
      'phone',      v_phone,
      'whatsapp',   v_whatsapp,
      'email',      v_email,
      'address',    v_address,
      'city',       v_city,
      'postalCode', v_postal_code,
      'notes',      v_notes
    ),
    'items', v_lines
  );
end;
$$;

-- 4. Grants: only the app's client stack (anon + signed-in customers) may call
--    this RPC. Direct table writes are blocked by RLS (policies dropped above).
revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;