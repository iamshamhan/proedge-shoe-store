/*
 * PROEDGE shoe-store - Supabase schema (Stage 3)
 * -----------------------------------------------
 * Paste this file in the Supabase SQL Editor, then paste supabase/seed.sql.
 * Fully re-runnable (idempotent): safe to run again on the same project.
 *
 * SECURITY NOTE (demo-only):
 * Policies "Public submit orders/order items" allow ANY anonymous visitor to
 * insert rows with client-supplied prices/totals. That is acceptable ONLY for
 * this demo stage and MUST be replaced by a server-only insertion path
 * (service-role / RPC) before go-live. Do not trust client totals, prices,
 * stock or quantities in production - recalculate server-side.
 */

-- 1. Row-level security helper: admin flag from the auth JWT (app_metadata.is_admin)
--    The JWT is issued and verified by Supabase Auth; users cannot edit their own
--    app_metadata through the client SDK, so this cannot be self-granted.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

-- 2. Updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Tables ------------------------------------------------------------------

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references categories (id) on delete restrict,
  name             text not null,
  slug             text not null unique,
  brand            text not null default 'PROEDGE',
  description      text,
  price            integer not null check (price > 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  featured         boolean not null default false,
  is_new_arrival   boolean not null default false,
  is_on_sale       boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url        text not null,
  alt_text   text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  colour     text not null,
  size       integer not null check (size between 33 and 50),
  stock      integer not null default 0 check (stock >= 0),
  sku        text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, colour, size)
);

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  customer_name text not null,
  phone         text not null,
  email         text,
  address       text not null,
  delivery_fee  integer not null default 0 check (delivery_fee >= 0),
  subtotal      integer not null default 0 check (subtotal >= 0),
  total         integer not null default 0 check (total >= 0),
  notes         text,
  status        text not null default 'pending'
                 check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders (id) on delete cascade,
  product_id   uuid not null references products (id) on delete restrict,
  variant_id   uuid references product_variants (id) on delete restrict,
  product_name text not null,
  colour       text not null,
  size         integer not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null check (unit_price >= 0),
  created_at   timestamptz not null default now()
);

-- 4. Indexes -----------------------------------------------------------------
create index if not exists idx_products_category     on products (category_id);
create index if not exists idx_products_slug         on products (slug);
create index if not exists idx_product_images_product on product_images (product_id);
-- Unique (product_id, url) also makes the seed's "on conflict do nothing" protect
-- against duplicate images if seed.sql is run more than once.
create unique index if not exists uniq_product_images_product_url
  on product_images (product_id, url);
create index if not exists idx_product_variants_product on product_variants (product_id);
create index if not exists idx_orders_created        on orders (created_at desc);
create index if not exists idx_orders_status         on orders (status);
create index if not exists idx_order_items_order     on order_items (order_id);

-- 5. Updated-at triggers ------------------------------------------------------
drop trigger if exists set_timestamp_categories on categories;
create trigger set_timestamp_categories
before update on categories
for each row execute function set_updated_at();

drop trigger if exists set_timestamp_products on products;
create trigger set_timestamp_products
before update on products
for each row execute function set_updated_at();

drop trigger if exists set_timestamp_product_variants on product_variants;
create trigger set_timestamp_product_variants
before update on product_variants
for each row execute function set_updated_at();

drop trigger if exists set_timestamp_orders on orders;
create trigger set_timestamp_orders
before update on orders
for each row execute function set_updated_at();

-- 6. Row level security --------------------------------------------------------

alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table product_variants enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;

-- Catalog: public read --------------------------------------------------------
drop policy if exists "Public read categories" on categories;
create policy "Public read categories"
on categories for select
using (true);

drop policy if exists "Public read active products" on products;
create policy "Public read active products"
on products for select
using (is_active = true);

drop policy if exists "Public read product images" on product_images;
create policy "Public read product images"
on product_images for select
using (true);

drop policy if exists "Public read product variants" on product_variants;
create policy "Public read product variants"
on product_variants for select
using (true);

-- Catalog: admin writes -------------------------------------------------------
drop policy if exists "Admin manage categories" on categories;
create policy "Admin manage categories"
on categories for all
to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Admins read all products" on products;
create policy "Admins read all products"
on products for select
to authenticated
using (is_admin());

drop policy if exists "Admin manage products" on products;
create policy "Admin manage products"
on products for all
to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Admin manage product images" on product_images;
create policy "Admin manage product images"
on product_images for all
to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "Admin manage product variants" on product_variants;
create policy "Admin manage product variants"
on product_variants for all
to authenticated
using (is_admin())
with check (is_admin());

-- Orders: INSERT handled securely via place_order RPC

drop policy if exists "Admin manage orders" on orders;
create policy "Admin manage orders"
on orders for all
to authenticated
using (is_admin())
with check (is_admin());



drop policy if exists "Admin manage order items" on order_items;
create policy "Admin manage order items"
on order_items for all
to authenticated
using (is_admin())
with check (is_admin());

-- 7. Storage: product-images bucket (public reads, admin writes) ---------------
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'product-images', 
    'product-images', 
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']::text[]
  )
  on conflict (id) do update set 
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product images storage" on storage.objects;
create policy "Public read product images storage"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admin insert product images storage" on storage.objects;
create policy "Admin insert product images storage"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin update product images storage" on storage.objects;
create policy "Admin update product images storage"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin delete product images storage" on storage.objects;
create policy "Admin delete product images storage"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- 8. Done. Now paste supabase/seed.sql to load the 10 PROEDGE products.
