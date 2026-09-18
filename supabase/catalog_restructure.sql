-- =============================================================================
-- PROEDGE: Catalog Restructure & Flexible Variant Sizing Migration
-- =============================================================================
-- Run this in the Supabase SQL Editor to:
--   1) Restructure categories into Sport / Department -> Product Type hierarchy
--   2) Migrate existing products into the new catalog structure
--   3) Add multi-system sizing (UK, US, EU, Custom) with textual size values to variants
--   4) Update order_items and place_order RPC for textual sizing and stock safety
--
-- Safe to re-run (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extend categories table for Hierarchy
-- -----------------------------------------------------------------------------

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete set null;

alter table public.categories
  add column if not exists description text;

create index if not exists idx_categories_parent on public.categories (parent_id);

-- -----------------------------------------------------------------------------
-- 2. Seed the Sport / Department Hierarchy (Level 1)
-- -----------------------------------------------------------------------------

-- Level 1: Primary Sports & Departments (parent_id IS NULL)
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('20000000-0000-4000-8000-000000000001', 'football', 'Football', 10, null, 'Engineered football boots, balls, and matchday accessories.'),
  ('20000000-0000-4000-8000-000000000002', 'rugby', 'Rugby', 20, null, 'Durable rugby boots, balls, kick tees, and protective gear.'),
  ('20000000-0000-4000-8000-000000000003', 'basketball', 'Basketball', 30, null, 'High-traction court shoes, balls, and athletic accessories.'),
  ('20000000-0000-4000-8000-000000000004', 'running', 'Running', 40, null, 'Performance distance runners, trainers, and running accessories.'),
  ('20000000-0000-4000-8000-000000000005', 'general', 'General & Lifestyle', 50, null, 'Slides, boot bags, duffle bags, backpacks, and headwear.'),
  ('20000000-0000-4000-8000-000000000006', 'accessories', 'Accessories', 60, null, 'Universal sports socks, strapping tape, air pumps, and sports gear.')
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- -----------------------------------------------------------------------------
-- 3. Seed Subcategories / Product Types (Level 2)
-- -----------------------------------------------------------------------------

-- FOOTBALL Subcategories
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('21000000-0000-4000-8000-000000000001', 'football-boots', 'Football Boots', 11, '20000000-0000-4000-8000-000000000001', 'Firm ground and soft ground football boots.'),
  ('21000000-0000-4000-8000-000000000002', 'turf-shoes', 'Turf Shoes', 12, '20000000-0000-4000-8000-000000000001', 'Artificial grass and astro turf football footwear.'),
  ('21000000-0000-4000-8000-000000000003', 'non-marking-shoes', 'Non-Marking Shoes', 13, '20000000-0000-4000-8000-000000000001', 'Indoor court and futsal non-marking shoes.'),
  ('21000000-0000-4000-8000-000000000004', 'footballs', 'Footballs', 14, '20000000-0000-4000-8000-000000000001', 'Match, training, and futsal footballs.'),
  ('21000000-0000-4000-8000-000000000005', 'goalkeeper-gloves', 'Goalkeeper Gloves', 15, '20000000-0000-4000-8000-000000000001', 'Pro grip goalkeeper match and training gloves.'),
  ('21000000-0000-4000-8000-000000000006', 'shin-guards', 'Shin Guards', 16, '20000000-0000-4000-8000-000000000001', 'Impact-resistant protective football shin guards.'),
  ('21000000-0000-4000-8000-000000000007', 'stud-packs', 'Stud Packs', 17, '20000000-0000-4000-8000-000000000001', 'Replacement metal and TPU boot studs.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- RUGBY Subcategories
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('22000000-0000-4000-8000-000000000001', 'rugby-boots', 'Rugby Boots', 21, '20000000-0000-4000-8000-000000000002', 'High-traction forward and back rugby boots.'),
  ('22000000-0000-4000-8000-000000000002', 'rugby-balls', 'Rugby Balls', 22, '20000000-0000-4000-8000-000000000002', 'Grip-textured match and training rugby balls.'),
  ('22000000-0000-4000-8000-000000000003', 'rugby-kick-tees', 'Rugby Kick Tees', 23, '20000000-0000-4000-8000-000000000002', 'Adjustable height rugby kicking tees.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- BASKETBALL Subcategories
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('23000000-0000-4000-8000-000000000001', 'basketball-shoes', 'Basketball Shoes', 31, '20000000-0000-4000-8000-000000000003', 'Cushioned high-top and mid-top basketball shoes.'),
  ('23000000-0000-4000-8000-000000000002', 'basketballs', 'Basketballs', 32, '20000000-0000-4000-8000-000000000003', 'Indoor composite and outdoor rubber basketballs.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- RUNNING Subcategories
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('24000000-0000-4000-8000-000000000001', 'running-shoes', 'Running Shoes', 41, '20000000-0000-4000-8000-000000000004', 'Road, trail, and sprint running footwear.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- GENERAL & LIFESTYLE Subcategories
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('25000000-0000-4000-8000-000000000001', 'slides', 'Slides', 51, '20000000-0000-4000-8000-000000000005', 'Post-game recovery slides and lifestyle slip-ons.'),
  ('25000000-0000-4000-8000-000000000002', 'boot-bags', 'Boot Bags', 52, '20000000-0000-4000-8000-000000000005', 'Ventilated athletic footwear carry bags.'),
  ('25000000-0000-4000-8000-000000000003', 'duffle-bags', 'Duffle Bags', 53, '20000000-0000-4000-8000-000000000005', 'Spacious training gym and team duffle bags.'),
  ('25000000-0000-4000-8000-000000000004', 'backpacks', 'Backpacks', 54, '20000000-0000-4000-8000-000000000005', 'Multi-compartment sports and gear backpacks.'),
  ('25000000-0000-4000-8000-000000000005', 'sports-hats-caps', 'Sports Hats & Caps', 55, '20000000-0000-4000-8000-000000000005', 'Breathable athletic caps, visors, and beanies.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- ACCESSORIES Subcategories (General & Multi-sport)
insert into public.categories (id, slug, name, sort_order, parent_id, description)
values
  ('26000000-0000-4000-8000-000000000001', 'sports-socks', 'Sports Socks', 61, '20000000-0000-4000-8000-000000000006', 'Cushioned crew, ankle, and grip sports socks.'),
  ('26000000-0000-4000-8000-000000000002', 'k-tape', 'K-Tape', 62, '20000000-0000-4000-8000-000000000006', 'Elastic kinesiology therapeutic tape for muscle support.'),
  ('26000000-0000-4000-8000-000000000003', 'rejit-tape', 'Rejit Tape', 63, '20000000-0000-4000-8000-000000000006', 'Rigid zinc-oxide strapping tape for joint stabilization.'),
  ('26000000-0000-4000-8000-000000000004', 'air-pumps', 'Air Pumps', 64, '20000000-0000-4000-8000-000000000006', 'Dual-action ball pumps with pressure gauge & needles.'),
  ('26000000-0000-4000-8000-000000000005', 'mouth-guards', 'Mouth Guards', 65, '20000000-0000-4000-8000-000000000006', 'Boil-and-bite dental protection mouthguards.'),
  ('26000000-0000-4000-8000-000000000006', 'head-gear', 'Head Gear', 66, '20000000-0000-4000-8000-000000000006', 'High-density foam protective scrum caps and headgear.'),
  ('26000000-0000-4000-8000-000000000007', 'general-accessories', 'General Accessories', 67, '20000000-0000-4000-8000-000000000006', 'Water bottles, sweatbands, and miscellaneous athletic accessories.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  description = excluded.description;

-- -----------------------------------------------------------------------------
-- 4. Migrate Existing 10 Products to the New Sport / Subcategory Hierarchy
-- -----------------------------------------------------------------------------

-- Runner X1 -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-runner-x1';

-- Sport Flex -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-sport-flex';

-- Velocity -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-velocity';

-- Apex Runner -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-apex-runner';

-- Trail Max -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-trail-max';

-- Aero Glide -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-aero-glide';

-- Court 01 -> basketball-shoes
update public.products
   set category_id = '23000000-0000-4000-8000-000000000001'
 where slug = 'proedge-court-01';

-- Street 02 -> slides (General & Lifestyle)
update public.products
   set category_id = '25000000-0000-4000-8000-000000000001'
 where slug = 'proedge-street-02';

-- Urban Classic -> slides (General & Lifestyle)
update public.products
   set category_id = '25000000-0000-4000-8000-000000000001'
 where slug = 'proedge-urban-classic';

-- Airwalk -> running-shoes
update public.products
   set category_id = '24000000-0000-4000-8000-000000000001'
 where slug = 'proedge-airwalk';

-- -----------------------------------------------------------------------------
-- 5. Upgrade product_variants for Flexible Multi-System Sizing
-- -----------------------------------------------------------------------------

-- Add size_system and size_value columns
alter table public.product_variants
  add column if not exists size_system text not null default 'EU';

alter table public.product_variants
  add column if not exists size_value text;

-- Backfill size_value from existing integer size
update public.product_variants
   set size_value = size::text,
       size_system = 'EU'
 where size_value is null;

-- Make size_value not null
alter table public.product_variants
  alter column size_value set not null;

-- Check constraint preventing empty or blank size_value
alter table public.product_variants
  drop constraint if exists product_variants_size_value_check;

alter table public.product_variants
  add constraint product_variants_size_value_check
  check (length(trim(size_value)) > 0);

-- Size system validation check
alter table public.product_variants
  drop constraint if exists product_variants_size_system_check;

alter table public.product_variants
  add constraint product_variants_size_system_check
  check (size_system in ('UK', 'US', 'EU', 'Custom'));

-- Drop check constraint on old numeric size range so non-shoe sizes are supported
alter table public.product_variants
  drop constraint if exists product_variants_size_check;

-- Make old integer size column nullable for backwards compatibility
alter table public.product_variants
  alter column size drop not null;

-- Replace old unique constraint (product_id, colour, size) with (product_id, colour, size_system, size_value)
alter table public.product_variants
  drop constraint if exists product_variants_product_id_colour_size_key;

drop index if exists uniq_variant_prod_colour_system_value;
create unique index if not exists uniq_variant_prod_colour_system_value
  on public.product_variants (product_id, colour, size_system, size_value);

-- -----------------------------------------------------------------------------
-- 6. Upgrade order_items Table for Textual Sizing
-- -----------------------------------------------------------------------------

-- Alter size column from integer to text
alter table public.order_items
  alter column size type text using size::text;

alter table public.order_items
  add column if not exists size_system text not null default 'EU';

alter table public.order_items
  add column if not exists size_value text;

update public.order_items
   set size_value = size,
       size_system = coalesce(size_system, 'EU')
 where size_value is null;

alter table public.order_items
  alter column size_value set not null;

alter table public.order_items
  drop constraint if exists order_items_size_value_check;

alter table public.order_items
  add constraint order_items_size_value_check
  check (length(trim(size_value)) > 0);

alter table public.order_items
  drop constraint if exists order_items_size_system_check;

alter table public.order_items
  add constraint order_items_size_system_check
  check (size_system in ('UK', 'US', 'EU', 'Custom'));

-- -----------------------------------------------------------------------------
-- 7. Update place_order RPC Function with Exact Variant Identity & Stock Safety
-- -----------------------------------------------------------------------------

-- Ensure order number sequence exists
create sequence if not exists public.orders_seq;

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

  -- Established delivery rules (matching STORE_CONFIG)
  v_delivery_threshold constant integer := 30000;
  v_default_fee        constant integer := 500;
  v_max_items          constant integer := 30;
  v_max_qty            constant integer := 99;
begin

  -- 1. Validate customer input
  v_customer_name := trim(coalesce(p_customer->>'fullName', p_customer->>'full_name', ''));
  v_phone         := trim(coalesce(p_customer->>'phone', ''));
  v_whatsapp      := nullif(trim(coalesce(p_customer->>'whatsapp', '')), '');
  v_email         := nullif(trim(coalesce(p_customer->>'email', '')), '');
  v_address       := trim(coalesce(p_customer->>'address', ''));
  v_city          := trim(coalesce(p_customer->>'city', ''));
  v_postal_code   := nullif(trim(coalesce(p_customer->>'postalCode', p_customer->>'postal_code', '')), '');
  v_notes         := nullif(trim(coalesce(p_customer->>'notes', '')), '');

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

  -- 2. Validate items collection
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'ERR_CART_EMPTY' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_items) > v_max_items then
    raise exception 'ERR_CART_TOO_LARGE' using errcode = 'P0001';
  end if;

  -- 3. Resolve variant, verify active product, and atomically deduct stock
  for v_item in select jsonb_array_elements(p_items)
  loop
    v_requested_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id'), '')::uuid;
    v_quantity             := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > v_max_qty then
      raise exception 'ERR_INVALID_QTY' using errcode = 'P0001';
    end if;

    -- Variant resolution:
    -- Path A: Explicit variant UUID
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
      -- Path B: Complete composite natural identity (product_id, colour, size_system, size_value)
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

    -- Look up the parent product (must be active)
    select p.name, p.price
      into v_product_name, v_unit_price
      from public.products p
     where p.id = v_product_id
       and p.is_active = true;

    if v_product_name is null then
      raise exception 'ERR_PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    -- Atomic stock deduction
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
      'size',        v_size_value,
      'size_system', v_size_system,
      'size_value',  v_size_value,
      'quantity',    v_quantity,
      'unit_price',  v_unit_price,
      'line_total',  v_line_total
    );
  end loop;

  -- 4. Calculate delivery fee and total (Free over 30,000 LKR, else 500 LKR)
  if v_subtotal >= v_delivery_threshold then
    v_delivery_fee := 0;
  else
    v_delivery_fee := v_default_fee;
  end if;
  v_total := v_subtotal + v_delivery_fee;

  -- Generate order number
  v_order_number := 'PROE-'
    || to_char(now(), 'YYMMDD')
    || '-'
    || lpad(nextval('public.orders_seq')::text, 5, '0');

  -- 5. Insert order
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

  -- 6. Insert order items
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
      v_item->>'size_system',
      v_item->>'size_value',
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::integer
    );
  end loop;

  return jsonb_build_object(
    'order_id',      v_order_id,
    'order_number',  v_order_number,
    'subtotal',      v_subtotal,
    'delivery_fee',  v_delivery_fee,
    'total',         v_total,
    'status',        'pending',
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
