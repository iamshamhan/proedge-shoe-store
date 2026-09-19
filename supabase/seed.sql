insert into categories (id, slug, name, sort_order) values
  ('10000000-0000-4000-8000-000000000001',    'men',    'Men\'s Footwear',     10),
  ('10000000-0000-4000-8000-000000000002',  'women',  'Women\'s Footwear',   20),
  ('10000000-0000-4000-8000-000000000003', 'sports', 'Sports & Training',  30),
  ('10000000-0000-4000-8000-000000000004', 'casual', 'Casual Sneakers',    40)
on conflict (slug) do nothing;

insert into products (id, category_id, name, slug, brand, description, price, compare_at_price, featured, is_new_arrival, is_on_sale, is_active) values
  ('90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'PROEDGE Runner X1', 'proedge-runner-x1', 'PROEDGE', 'High-performance long-distance running shoe equipped with responsive foam cushioning and breathable engineered mesh upper for maximum speed.', 24500, 28900, true, true, true, true),
  ('90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000004', 'PROEDGE Street 02', 'proedge-street-02', 'PROEDGE', 'Minimalist street sneaker crafted with full-grain suede accents and durable rubber cupsole for effortless daily style.', 18900, null, true, false, false, true),
  ('90000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'PROEDGE Sport Flex', 'proedge-sport-flex', 'PROEDGE', 'Ultra-lightweight cross-training shoe featuring dynamic arch support and high-traction multi-surface outsole.', 21900, 26000, true, true, true, true),
  ('90000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'PROEDGE Urban Classic', 'proedge-urban-classic', 'PROEDGE', 'Timeless low-top silhouette tailored for modern urban living, featuring premium leather trims and padded collar.', 22500, null, true, false, false, true),
  ('90000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', 'PROEDGE Airwalk', 'proedge-airwalk', 'PROEDGE', 'Feather-light lifestyle trainer engineered for all-day comfort with cloud-soft memory foam insoles.', 19800, 23000, true, true, true, true),
  ('90000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', 'PROEDGE Velocity', 'proedge-velocity', 'PROEDGE', 'Sprint-inspired trainer with carbon-infused plate feedback for explosive energy return during workout sessions.', 27900, null, true, false, false, true),
  ('90000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000004', 'PROEDGE Court 01', 'proedge-court-01', 'PROEDGE', 'Retro court sneaker built with clean paneling, breathable eyelets, and non-marking traction rubber.', 17500, 21000, true, false, true, true),
  ('90000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', 'PROEDGE Trail Max', 'proedge-trail-max', 'PROEDGE', 'Rugged off-road footwear equipped with waterproof membrane technology and deep lugged soles for tough terrains.', 29500, null, true, true, false, true),
  ('90000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000002', 'PROEDGE Aero Glide', 'proedge-aero-glide', 'PROEDGE', 'Sleek slip-on performance shoe designed with knit upper structure and flexible shock-absorbing heel unit.', 20500, null, false, true, false, true),
  ('90000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000003', 'PROEDGE Apex Runner', 'proedge-apex-runner', 'PROEDGE', 'Peak performance road shoe featuring multi-density midsole and reinforced toe cap for marathon resistance.', 26000, 31000, false, false, true, true)
on conflict (slug) do nothing;

insert into product_images (product_id, url, alt_text, sort_order) values
  ('90000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Runner X1 — product image 1', 1),
  ('90000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Runner X1 — product image 2', 2),
  ('90000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Street 02 — product image 1', 1),
  ('90000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Street 02 — product image 2', 2),
  ('90000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Sport Flex — product image 1', 1),
  ('90000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Urban Classic — product image 1', 1),
  ('90000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Airwalk — product image 1', 1),
  ('90000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Velocity — product image 1', 1),
  ('90000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Court 01 — product image 1', 1),
  ('90000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Trail Max — product image 1', 1),
  ('90000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Aero Glide — product image 1', 1),
  ('90000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1460353581641-37babbab0fa2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Apex Runner — product image 1', 1)
on conflict do nothing;

insert into product_variants (product_id, colour, size, stock) values
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 40, 2),
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 41, 2),
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 42, 2),
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 43, 2),
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 44, 2),
  ('90000000-0000-4000-8000-000000000001', 'Red/Black', 45, 2),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 40, 1),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 41, 1),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 42, 1),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 43, 1),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 44, 1),
  ('90000000-0000-4000-8000-000000000001', 'Core White', 45, 1),
  ('90000000-0000-4000-8000-000000000002', 'Off White', 39, 3),
  ('90000000-0000-4000-8000-000000000002', 'Off White', 40, 3),
  ('90000000-0000-4000-8000-000000000002', 'Off White', 41, 3),
  ('90000000-0000-4000-8000-000000000002', 'Off White', 42, 3),
  ('90000000-0000-4000-8000-000000000002', 'Off White', 43, 2),
  ('90000000-0000-4000-8000-000000000002', 'Charcoal Grey', 39, 2),
  ('90000000-0000-4000-8000-000000000002', 'Charcoal Grey', 40, 2),
  ('90000000-0000-4000-8000-000000000002', 'Charcoal Grey', 41, 2),
  ('90000000-0000-4000-8000-000000000002', 'Charcoal Grey', 42, 2),
  ('90000000-0000-4000-8000-000000000002', 'Charcoal Grey', 43, 2),
  ('90000000-0000-4000-8000-000000000003', 'Lime Black', 40, 2),
  ('90000000-0000-4000-8000-000000000003', 'Lime Black', 41, 2),
  ('90000000-0000-4000-8000-000000000003', 'Lime Black', 42, 1),
  ('90000000-0000-4000-8000-000000000003', 'Lime Black', 43, 1),
  ('90000000-0000-4000-8000-000000000003', 'Lime Black', 44, 1),
  ('90000000-0000-4000-8000-000000000003', 'Electric Blue', 40, 1),
  ('90000000-0000-4000-8000-000000000003', 'Electric Blue', 41, 1),
  ('90000000-0000-4000-8000-000000000003', 'Electric Blue', 42, 1),
  ('90000000-0000-4000-8000-000000000003', 'Electric Blue', 43, 1),
  ('90000000-0000-4000-8000-000000000003', 'Electric Blue', 44, 1),
  ('90000000-0000-4000-8000-000000000004', 'All White', 40, 2),
  ('90000000-0000-4000-8000-000000000004', 'All White', 41, 2),
  ('90000000-0000-4000-8000-000000000004', 'All White', 42, 2),
  ('90000000-0000-4000-8000-000000000004', 'All White', 43, 1),
  ('90000000-0000-4000-8000-000000000004', 'All White', 44, 1),
  ('90000000-0000-4000-8000-000000000004', 'All White', 45, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 40, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 41, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 42, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 43, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 44, 1),
  ('90000000-0000-4000-8000-000000000004', 'Midnight Black', 45, 1),
  ('90000000-0000-4000-8000-000000000005', 'Dusty Rose', 36, 2),
  ('90000000-0000-4000-8000-000000000005', 'Dusty Rose', 37, 2),
  ('90000000-0000-4000-8000-000000000005', 'Dusty Rose', 38, 2),
  ('90000000-0000-4000-8000-000000000005', 'Dusty Rose', 39, 2),
  ('90000000-0000-4000-8000-000000000005', 'Dusty Rose', 40, 2),
  ('90000000-0000-4000-8000-000000000005', 'Pure White', 36, 2),
  ('90000000-0000-4000-8000-000000000005', 'Pure White', 37, 2),
  ('90000000-0000-4000-8000-000000000005', 'Pure White', 38, 2),
  ('90000000-0000-4000-8000-000000000005', 'Pure White', 39, 2),
  ('90000000-0000-4000-8000-000000000005', 'Pure White', 40, 2),
  ('90000000-0000-4000-8000-000000000006', 'Neon Crimson', 41, 1),
  ('90000000-0000-4000-8000-000000000006', 'Neon Crimson', 42, 1),
  ('90000000-0000-4000-8000-000000000006', 'Neon Crimson', 43, 1),
  ('90000000-0000-4000-8000-000000000006', 'Neon Crimson', 44, 1),
  ('90000000-0000-4000-8000-000000000006', 'Neon Crimson', 45, 1),
  ('90000000-0000-4000-8000-000000000006', 'Stealth Dark', 41, 1),
  ('90000000-0000-4000-8000-000000000006', 'Stealth Dark', 42, 1),
  ('90000000-0000-4000-8000-000000000006', 'Stealth Dark', 43, 1),
  ('90000000-0000-4000-8000-000000000006', 'Stealth Dark', 44, 0),
  ('90000000-0000-4000-8000-000000000006', 'Stealth Dark', 45, 0),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 38, 3),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 39, 3),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 40, 3),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 41, 3),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 42, 3),
  ('90000000-0000-4000-8000-000000000007', 'White Navy', 43, 3),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 38, 2),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 39, 2),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 40, 2),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 41, 2),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 42, 2),
  ('90000000-0000-4000-8000-000000000007', 'Vintage Green', 43, 2),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 40, 1),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 41, 1),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 42, 1),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 43, 1),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 44, 1),
  ('90000000-0000-4000-8000-000000000008', 'Earth Brown', 45, 1),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 40, 1),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 41, 1),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 42, 1),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 43, 1),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 44, 0),
  ('90000000-0000-4000-8000-000000000008', 'Tactical Black', 45, 0),
  ('90000000-0000-4000-8000-000000000009', 'Lilac Fog', 36, 2),
  ('90000000-0000-4000-8000-000000000009', 'Lilac Fog', 37, 2),
  ('90000000-0000-4000-8000-000000000009', 'Lilac Fog', 38, 2),
  ('90000000-0000-4000-8000-000000000009', 'Lilac Fog', 39, 2),
  ('90000000-0000-4000-8000-000000000009', 'Lilac Fog', 40, 1),
  ('90000000-0000-4000-8000-000000000009', 'Chalk White', 36, 1),
  ('90000000-0000-4000-8000-000000000009', 'Chalk White', 37, 1),
  ('90000000-0000-4000-8000-000000000009', 'Chalk White', 38, 1),
  ('90000000-0000-4000-8000-000000000009', 'Chalk White', 39, 1),
  ('90000000-0000-4000-8000-000000000009', 'Chalk White', 40, 1),
  ('90000000-0000-4000-8000-000000000010', 'Volt Orange', 40, 1),
  ('90000000-0000-4000-8000-000000000010', 'Volt Orange', 41, 1),
  ('90000000-0000-4000-8000-000000000010', 'Volt Orange', 42, 1),
  ('90000000-0000-4000-8000-000000000010', 'Volt Orange', 43, 1),
  ('90000000-0000-4000-8000-000000000010', 'Volt Orange', 44, 1),
  ('90000000-0000-4000-8000-000000000010', 'Black Smoke', 40, 1),
  ('90000000-0000-4000-8000-000000000010', 'Black Smoke', 41, 1),
  ('90000000-0000-4000-8000-000000000010', 'Black Smoke', 42, 1),
  ('90000000-0000-4000-8000-000000000010', 'Black Smoke', 43, 1),
  ('90000000-0000-4000-8000-000000000010', 'Black Smoke', 44, 0)
on conflict (product_id, colour, size) do nothing;-- =============================================================================
-- PROEDGE: Basketball Catalog Batch Seed
-- =============================================================================
-- This script seeds the Basketball product catalog into the existing PROEDGE schema.
-- Includes:
--   - 2 Basketball Shoes (UK sizing 6-11, 2 colourways, independent per-variant stock, sold-out test variants)
--   - 2 Basketballs (Custom / Size 7, multiple colourways)
--   - 1 Basketball Compression Sports Socks (Custom / M (UK 6-8), L (UK 9-11))
--
-- Safe and idempotent (ON CONFLICT DO UPDATE / DO NOTHING).
-- Does NOT drop, truncate, or delete any existing data.
-- Does NOT modify Football, Rugby, or general catalog records.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Insert / Upsert Basketball Products
-- -----------------------------------------------------------------------------

insert into public.products (
  id,
  category_id,
  name,
  slug,
  brand,
  description,
  price,
  compare_at_price,
  featured,
  is_new_arrival,
  is_on_sale,
  is_active
) values
  -- 1. PROEDGE FlightZone High-Top Basketball Shoes
  (
    '93000000-0000-4000-8000-000000000001',
    '23000000-0000-4000-8000-000000000001', -- basketball-shoes
    'PROEDGE FlightZone High-Top Basketball Shoes',
    'proedge-flightzone-high-top-basketball-shoes',
    'PROEDGE',
    'High-top performance basketball shoe featuring an ankle-stabilizing padded collar, responsive dual-density cushioning, and multidirectional herringbone rubber outsole for explosive court cuts.',
    26500,
    31000,
    true,
    true,
    true,
    true
  ),
  -- 2. PROEDGE ShiftLow Court Basketball Shoes
  (
    '93000000-0000-4000-8000-000000000002',
    '23000000-0000-4000-8000-000000000001', -- basketball-shoes
    'PROEDGE ShiftLow Court Basketball Shoes',
    'proedge-shiftlow-court-basketball-shoes',
    'PROEDGE',
    'Low-profile agility basketball shoe engineered for perimeter guards. Features an ultra-light breathable knit upper, lateral outrigger support, and sticky non-slip indoor outsole.',
    24500,
    28500,
    true,
    true,
    false,
    true
  ),
  -- 3. PROEDGE GripLock Composite Basketball
  (
    '93000000-0000-4000-8000-000000000003',
    '23000000-0000-4000-8000-000000000002', -- basketballs
    'PROEDGE GripLock Composite Basketball',
    'proedge-griplock-composite-basketball',
    'PROEDGE',
    'Premium composite leather basketball with deep pebbled channels for fingertip control and moisture-wicking surface feel on hardwood and synthetic courts.',
    11500,
    13500,
    true,
    false,
    true,
    true
  ),
  -- 4. PROEDGE StreetCourt Outdoor Rubber Basketball
  (
    '93000000-0000-4000-8000-000000000004',
    '23000000-0000-4000-8000-000000000002', -- basketballs
    'PROEDGE StreetCourt Outdoor Rubber Basketball',
    'proedge-streetcourt-outdoor-rubber-basketball',
    'PROEDGE',
    'Ultra-durable vulcanized rubber basketball built to withstand asphalt, concrete, and rough outdoor court surfaces with deep groove grip channels.',
    6900,
    null,
    false,
    true,
    false,
    true
  ),
  -- 5. PROEDGE CourtCushion Compression Basketball Socks
  (
    '93000000-0000-4000-8000-000000000005',
    '26000000-0000-4000-8000-000000000001', -- sports-socks
    'PROEDGE CourtCushion Compression Basketball Socks',
    'proedge-courtcushion-compression-basketball-socks',
    'PROEDGE',
    'High-density cushioned crew socks with targeted ankle and Achilles padding, arch compression band, and ventilated knit zones for high-impact court play.',
    2600,
    null,
    false,
    true,
    false,
    true
  )
on conflict (slug) do update set
  category_id      = excluded.category_id,
  name             = excluded.name,
  brand            = excluded.brand,
  description      = excluded.description,
  price            = excluded.price,
  compare_at_price = excluded.compare_at_price,
  featured         = excluded.featured,
  is_new_arrival   = excluded.is_new_arrival,
  is_on_sale       = excluded.is_on_sale,
  is_active        = excluded.is_active;

-- -----------------------------------------------------------------------------
-- 2. Insert Product Images
-- -----------------------------------------------------------------------------

insert into public.product_images (id, product_id, url, alt_text, sort_order)
values
  -- FlightZone High-Top Shoes
  ('73000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop', 'PROEDGE FlightZone High-Top Basketball Shoes - Primary', 1),
  ('73000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1200&q=80&auto=format&fit=crop', 'PROEDGE FlightZone High-Top Basketball Shoes - Angle', 2),

  -- ShiftLow Court Shoes
  ('73000000-0000-4000-8000-000000000003', '93000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80&auto=format&fit=crop', 'PROEDGE ShiftLow Court Basketball Shoes - Primary', 1),
  ('73000000-0000-4000-8000-000000000004', '93000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop', 'PROEDGE ShiftLow Court Basketball Shoes - Angle', 2),

  -- GripLock Composite Basketball
  ('73000000-0000-4000-8000-000000000005', '93000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80&auto=format&fit=crop', 'PROEDGE GripLock Composite Basketball - Primary', 1),
  ('73000000-0000-4000-8000-000000000006', '93000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80&auto=format&fit=crop', 'PROEDGE GripLock Composite Basketball - Texture', 2),

  -- StreetCourt Outdoor Rubber Basketball
  ('73000000-0000-4000-8000-000000000007', '93000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80&auto=format&fit=crop', 'PROEDGE StreetCourt Outdoor Rubber Basketball - Primary', 1),
  ('73000000-0000-4000-8000-000000000008', '93000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1200&q=80&auto=format&fit=crop', 'PROEDGE StreetCourt Outdoor Rubber Basketball - Angle', 2),

  -- CourtCushion Compression Basketball Socks
  ('73000000-0000-4000-8000-000000000009', '93000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1582965372486-663c762c222f?w=1200&q=80&auto=format&fit=crop', 'PROEDGE CourtCushion Compression Basketball Socks - Primary', 1),
  ('73000000-0000-4000-8000-000000000010', '93000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE CourtCushion Compression Basketball Socks - Angle', 2)
on conflict (id) do update set
  product_id = excluded.product_id,
  url        = excluded.url,
  alt_text   = excluded.alt_text,
  sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- 3. Insert Product Variants with Independent Inventory
-- -----------------------------------------------------------------------------

insert into public.product_variants (
  id,
  product_id,
  colour,
  size,
  size_system,
  size_value,
  stock,
  sku
) values
  -- 1. FlightZone High-Top Basketball Shoes (UK sizing 6-11, Black/Amber & Triple White)
  ('83000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 6, 'UK', '6', 3, 'PE-BKB-FLZ-BLK-06'),
  ('83000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 7, 'UK', '7', 5, 'PE-BKB-FLZ-BLK-07'),
  ('83000000-0000-4000-8000-000000000003', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 8, 'UK', '8', 4, 'PE-BKB-FLZ-BLK-08'),
  ('83000000-0000-4000-8000-000000000004', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 9, 'UK', '9', 2, 'PE-BKB-FLZ-BLK-09'),
  ('83000000-0000-4000-8000-000000000005', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 10, 'UK', '10', 1, 'PE-BKB-FLZ-BLK-10'),
  ('83000000-0000-4000-8000-000000000006', '93000000-0000-4000-8000-000000000001', 'Black/Amber', 11, 'UK', '11', 0, 'PE-BKB-FLZ-BLK-11'),

  ('83000000-0000-4000-8000-000000000007', '93000000-0000-4000-8000-000000000001', 'Triple White', 6, 'UK', '6', 2, 'PE-BKB-FLZ-WHT-06'),
  ('83000000-0000-4000-8000-000000000008', '93000000-0000-4000-8000-000000000001', 'Triple White', 7, 'UK', '7', 4, 'PE-BKB-FLZ-WHT-07'),
  ('83000000-0000-4000-8000-000000000009', '93000000-0000-4000-8000-000000000001', 'Triple White', 8, 'UK', '8', 3, 'PE-BKB-FLZ-WHT-08'),
  ('83000000-0000-4000-8000-000000000010', '93000000-0000-4000-8000-000000000001', 'Triple White', 9, 'UK', '9', 2, 'PE-BKB-FLZ-WHT-09'),
  ('83000000-0000-4000-8000-000000000011', '93000000-0000-4000-8000-000000000001', 'Triple White', 10, 'UK', '10', 2, 'PE-BKB-FLZ-WHT-10'),
  ('83000000-0000-4000-8000-000000000012', '93000000-0000-4000-8000-000000000001', 'Triple White', 11, 'UK', '11', 1, 'PE-BKB-FLZ-WHT-11'),

  -- 2. ShiftLow Court Basketball Shoes (UK sizing 6-11, Royal/Black & Solar Red)
  ('83000000-0000-4000-8000-000000000013', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 6, 'UK', '6', 2, 'PE-BKB-SLW-RYL-06'),
  ('83000000-0000-4000-8000-000000000014', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 7, 'UK', '7', 5, 'PE-BKB-SLW-RYL-07'),
  ('83000000-0000-4000-8000-000000000015', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 8, 'UK', '8', 6, 'PE-BKB-SLW-RYL-08'),
  ('83000000-0000-4000-8000-000000000016', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 9, 'UK', '9', 4, 'PE-BKB-SLW-RYL-09'),
  ('83000000-0000-4000-8000-000000000017', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 10, 'UK', '10', 3, 'PE-BKB-SLW-RYL-10'),
  ('83000000-0000-4000-8000-000000000018', '93000000-0000-4000-8000-000000000002', 'Royal/Black', 11, 'UK', '11', 1, 'PE-BKB-SLW-RYL-11'),

  ('83000000-0000-4000-8000-000000000019', '93000000-0000-4000-8000-000000000002', 'Solar Red', 6, 'UK', '6', 1, 'PE-BKB-SLW-RED-06'),
  ('83000000-0000-4000-8000-000000000020', '93000000-0000-4000-8000-000000000002', 'Solar Red', 7, 'UK', '7', 3, 'PE-BKB-SLW-RED-07'),
  ('83000000-0000-4000-8000-000000000021', '93000000-0000-4000-8000-000000000002', 'Solar Red', 8, 'UK', '8', 4, 'PE-BKB-SLW-RED-08'),
  ('83000000-0000-4000-8000-000000000022', '93000000-0000-4000-8000-000000000002', 'Solar Red', 9, 'UK', '9', 2, 'PE-BKB-SLW-RED-09'),
  ('83000000-0000-4000-8000-000000000023', '93000000-0000-4000-8000-000000000002', 'Solar Red', 10, 'UK', '10', 0, 'PE-BKB-SLW-RED-10'),
  ('83000000-0000-4000-8000-000000000024', '93000000-0000-4000-8000-000000000002', 'Solar Red', 11, 'UK', '11', 2, 'PE-BKB-SLW-RED-11'),

  -- 3. GripLock Composite Basketball (Custom / Size 7)
  ('83000000-0000-4000-8000-000000000025', '93000000-0000-4000-8000-000000000003', 'Classic Amber/Black', null, 'Custom', 'Size 7', 18, 'PE-BKB-BAL-GLC-AMB-07'),
  ('83000000-0000-4000-8000-000000000026', '93000000-0000-4000-8000-000000000003', 'Stealth Black', null, 'Custom', 'Size 7', 14, 'PE-BKB-BAL-GLC-BLK-07'),

  -- 4. StreetCourt Outdoor Rubber Basketball (Custom / Size 7)
  ('83000000-0000-4000-8000-000000000027', '93000000-0000-4000-8000-000000000004', 'Brick Red/Black', null, 'Custom', 'Size 7', 20, 'PE-BKB-BAL-SCO-RED-07'),
  ('83000000-0000-4000-8000-000000000028', '93000000-0000-4000-8000-000000000004', 'Volt/Black', null, 'Custom', 'Size 7', 15, 'PE-BKB-BAL-SCO-VLT-07'),

  -- 5. CourtCushion Compression Basketball Socks (Custom / M (UK 6-8), L (UK 9-11))
  ('83000000-0000-4000-8000-000000000029', '93000000-0000-4000-8000-000000000005', 'White/Black', null, 'Custom', 'M (UK 6-8)', 22, 'PE-BKB-SCK-CC-WHT-M'),
  ('83000000-0000-4000-8000-000000000030', '93000000-0000-4000-8000-000000000005', 'White/Black', null, 'Custom', 'L (UK 9-11)', 28, 'PE-BKB-SCK-CC-WHT-L'),
  ('83000000-0000-4000-8000-000000000031', '93000000-0000-4000-8000-000000000005', 'Triple Black', null, 'Custom', 'M (UK 6-8)', 18, 'PE-BKB-SCK-CC-BLK-M'),
  ('83000000-0000-4000-8000-000000000032', '93000000-0000-4000-8000-000000000005', 'Triple Black', null, 'Custom', 'L (UK 9-11)', 24, 'PE-BKB-SCK-CC-BLK-L')
on conflict (id) do update set
  product_id  = excluded.product_id,
  colour      = excluded.colour,
  size        = excluded.size,
  size_system = excluded.size_system,
  size_value  = excluded.size_value,
  stock       = excluded.stock,
  sku         = excluded.sku;

-- =============================================================================
-- PROEDGE: Rugby Catalog Batch Seed
-- =============================================================================
-- This script seeds the Rugby product catalog into the existing PROEDGE schema.
-- Includes:
--   - Rugby Boots (UK sizing, 2 colourways, independent per-variant stock, sold-out test variants)
--   - Rugby Balls (Custom / Size 5, multiple colourways)
--   - Rugby Kick Tees (Custom / One Size)
--   - Head Gear (Custom / S, M, L, XL sizes, multiple colourways)
--   - Mouth Guards (Custom / One Size)
--   - Sports Socks (Custom / M, L sizes)
--   - K-Tape (Custom / One Size, 3 colourways)
--   - Rejit Tape (Custom / One Size, 2 colourways)
--   - Air Pumps (Custom / One Size)
--
-- Safe and idempotent (ON CONFLICT DO UPDATE / DO NOTHING).
-- Does NOT drop, truncate, or delete any existing data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Insert / Upsert Rugby & Protective Products
-- -----------------------------------------------------------------------------

insert into public.products (
  id,
  category_id,
  name,
  slug,
  brand,
  description,
  price,
  compare_at_price,
  featured,
  is_new_arrival,
  is_on_sale,
  is_active
) values
  -- 1. ScrumForce 8-Stud Rugby Boots
  (
    '92000000-0000-4000-8000-000000000001',
    '22000000-0000-4000-8000-000000000001', -- rugby-boots
    'PROEDGE ScrumForce 8-Stud Rugby Boots',
    'proedge-scrumforce-8-stud-rugby-boots',
    'PROEDGE',
    'Engineered for forward pack dominance and scrum stability. Features an 8-stud metal configuration, reinforced heel counter, and water-resistant synthetic upper for superior traction on wet, muddy pitches.',
    26500,
    31000,
    true,
    true,
    true,
    true
  ),
  -- 2. MatchPace Backs Rugby Boots
  (
    '92000000-0000-4000-8000-000000000002',
    '22000000-0000-4000-8000-000000000001', -- rugby-boots
    'PROEDGE MatchPace Backs Rugby Boots',
    'proedge-matchpace-backs-rugby-boots',
    'PROEDGE',
    'Lightweight speed boot tailored for fly-halves, centres, and wingers. Features a streamlined 6-stud hybrid layout with textured forefoot strike zone for explosive acceleration and pinpoint kicking accuracy.',
    28000,
    32500,
    true,
    true,
    false,
    true
  ),
  -- 3. Vortex Match Rugby Ball
  (
    '92000000-0000-4000-8000-000000000003',
    '22000000-0000-4000-8000-000000000002', -- rugby-balls
    'PROEDGE Vortex Match Rugby Ball',
    'proedge-vortex-match-rugby-ball',
    'PROEDGE',
    'Durable 4-ply match-style rugby ball with high-grip dimpled rubber composite surface and balanced latex bladder for consistent flight trajectory in all weather conditions.',
    11500,
    13800,
    true,
    true,
    true,
    true
  ),
  -- 4. Elevate Adjustable Kick Tee
  (
    '92000000-0000-4000-8000-000000000004',
    '22000000-0000-4000-8000-000000000003', -- rugby-kick-tees
    'PROEDGE Elevate Adjustable Kick Tee',
    'proedge-elevate-adjustable-kick-tee',
    'PROEDGE',
    'Telescopic height-adjustable kicking tee crafted from ultra-resilient molded polymer. Delivers a zero-slip ball perch engineered for place-kickers demanding precise launch angles.',
    4800,
    null,
    false,
    true,
    false,
    true
  ),
  -- 5. Titan Armour Head Gear
  (
    '92000000-0000-4000-8000-000000000005',
    '26000000-0000-4000-8000-000000000006', -- head-gear
    'PROEDGE Titan Armour Head Gear',
    'proedge-titan-armour-head-gear',
    'PROEDGE',
    'Rugby-focused protective scrum cap with multi-density foam padding and ventilated construction.',
    14500,
    17000,
    true,
    false,
    true,
    true
  ),
  -- 6. ProDent Dual-Layer Mouth Guard
  (
    '92000000-0000-4000-8000-000000000006',
    '26000000-0000-4000-8000-000000000005', -- mouth-guards
    'PROEDGE ProDent Dual-Layer Mouth Guard',
    'proedge-prodent-dual-layer-mouth-guard',
    'PROEDGE',
    'Dual-layer boil-and-bite mouth guard designed for contact sports and training.',
    3200,
    null,
    false,
    false,
    false,
    true
  ),
  -- 7. GripTech Elite Rugby Socks
  (
    '92000000-0000-4000-8000-000000000007',
    '26000000-0000-4000-8000-000000000001', -- sports-socks
    'PROEDGE GripTech Elite Rugby Socks',
    'proedge-griptech-elite-rugby-socks',
    'PROEDGE',
    'High-performance compression crew socks featuring silicon grip pads on the footbed to lock feet securely inside boots, reinforced arch band, and moisture-wicking yarns.',
    2400,
    null,
    false,
    true,
    false,
    true
  ),
  -- 8. FlexForce K-Tape (5cm x 5m)
  (
    '92000000-0000-4000-8000-000000000008',
    '26000000-0000-4000-8000-000000000002', -- k-tape
    'PROEDGE FlexForce K-Tape (5cm x 5m)',
    'proedge-flexforce-k-tape',
    'PROEDGE',
    'Elastic kinesiology tape designed for sports support, mobility, and training use.',
    2800,
    null,
    false,
    false,
    false,
    true
  ),
  -- 9. RigidZinc Strapping Tape (3.8cm x 13.7m)
  (
    '92000000-0000-4000-8000-000000000009',
    '26000000-0000-4000-8000-000000000003', -- rejit-tape
    'PROEDGE RigidZinc Strapping Tape (3.8cm x 13.7m)',
    'proedge-rigidzinc-strapping-tape',
    'PROEDGE',
    'Heavy-duty non-elastic zinc-oxide rigid athletic tape. Features a serrated edge for easy hand-tearing, designed for secure joint and finger strapping during training and match play.',
    2200,
    null,
    false,
    false,
    false,
    true
  ),
  -- 10. Dual-Stroke Pressure Ball Pump
  (
    '92000000-0000-4000-8000-000000000010',
    '26000000-0000-4000-8000-000000000004', -- air-pumps
    'PROEDGE Dual-Stroke Pressure Ball Pump',
    'proedge-dual-stroke-pressure-ball-pump',
    'PROEDGE',
    'Rapid dual-action air pump that delivers continuous inflation on both push and pull strokes. Built-in analog PSI pressure gauge, flexible hose extension, and 3 spare stainless steel needles.',
    3900,
    null,
    false,
    true,
    false,
    true
  )
on conflict (slug) do update set
  category_id      = excluded.category_id,
  name             = excluded.name,
  brand            = excluded.brand,
  description      = excluded.description,
  price            = excluded.price,
  compare_at_price = excluded.compare_at_price,
  featured         = excluded.featured,
  is_new_arrival   = excluded.is_new_arrival,
  is_on_sale       = excluded.is_on_sale,
  is_active        = excluded.is_active;

-- -----------------------------------------------------------------------------
-- 2. Insert Product Images
-- -----------------------------------------------------------------------------

insert into public.product_images (id, product_id, url, alt_text, sort_order)
values
  -- ScrumForce 8-Stud Boots
  ('72000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80&auto=format&fit=crop', 'PROEDGE ScrumForce 8-Stud Rugby Boots - Primary', 1),
  ('72000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop', 'PROEDGE ScrumForce 8-Stud Rugby Boots - Angle', 2),

  -- MatchPace Backs Boots
  ('72000000-0000-4000-8000-000000000003', '92000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80&auto=format&fit=crop', 'PROEDGE MatchPace Backs Rugby Boots - Primary', 1),
  ('72000000-0000-4000-8000-000000000004', '92000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80&auto=format&fit=crop', 'PROEDGE MatchPace Backs Rugby Boots - Detail', 2),

  -- Vortex Match Ball
  ('72000000-0000-4000-8000-000000000005', '92000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Vortex Match Rugby Ball - Primary', 1),
  ('72000000-0000-4000-8000-000000000006', '92000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1562077772-3ab121863412?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Vortex Match Rugby Ball - Surface Texture', 2),

  -- Elevate Adjustable Kick Tee
  ('72000000-0000-4000-8000-000000000007', '92000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Elevate Adjustable Kick Tee - Primary', 1),

  -- Titan Armour Head Gear
  ('72000000-0000-4000-8000-000000000008', '92000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Titan Armour Head Gear - Primary', 1),

  -- ProDent Dual-Layer Mouth Guard
  ('72000000-0000-4000-8000-000000000009', '92000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80&auto=format&fit=crop', 'PROEDGE ProDent Dual-Layer Mouth Guard - Primary', 1),

  -- GripTech Elite Rugby Socks
  ('72000000-0000-4000-8000-000000000010', '92000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1582965372486-663c762c222f?w=1200&q=80&auto=format&fit=crop', 'PROEDGE GripTech Elite Rugby Socks - Primary', 1),

  -- FlexForce K-Tape
  ('72000000-0000-4000-8000-000000000011', '92000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format&fit=crop', 'PROEDGE FlexForce K-Tape - Primary', 1),

  -- RigidZinc Strapping Tape
  ('72000000-0000-4000-8000-000000000012', '92000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80&auto=format&fit=crop', 'PROEDGE RigidZinc Strapping Tape - Primary', 1),

  -- Dual-Stroke Pressure Ball Pump
  ('72000000-0000-4000-8000-000000000013', '92000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80&auto=format&fit=crop', 'PROEDGE Dual-Stroke Pressure Ball Pump - Primary', 1)
on conflict (id) do update set
  product_id = excluded.product_id,
  url        = excluded.url,
  alt_text   = excluded.alt_text,
  sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- 3. Insert Product Variants with Independent Inventory
-- -----------------------------------------------------------------------------

insert into public.product_variants (
  id,
  product_id,
  colour,
  size,
  size_system,
  size_value,
  stock,
  sku
) values
  -- 1. ScrumForce 8-Stud Rugby Boots (UK sizing, All Black & White/Gold)
  ('82000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'All Black', 7, 'UK', '7', 3, 'PE-RUG-SF8-BLK-07'),
  ('82000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000001', 'All Black', 8, 'UK', '8', 5, 'PE-RUG-SF8-BLK-08'),
  ('82000000-0000-4000-8000-000000000003', '92000000-0000-4000-8000-000000000001', 'All Black', 9, 'UK', '9', 4, 'PE-RUG-SF8-BLK-09'),
  ('82000000-0000-4000-8000-000000000004', '92000000-0000-4000-8000-000000000001', 'All Black', 10, 'UK', '10', 2, 'PE-RUG-SF8-BLK-10'),
  ('82000000-0000-4000-8000-000000000005', '92000000-0000-4000-8000-000000000001', 'All Black', 11, 'UK', '11', 1, 'PE-RUG-SF8-BLK-11'),

  ('82000000-0000-4000-8000-000000000006', '92000000-0000-4000-8000-000000000001', 'White/Gold', 7, 'UK', '7', 0, 'PE-RUG-SF8-WGLD-07'),
  ('82000000-0000-4000-8000-000000000007', '92000000-0000-4000-8000-000000000001', 'White/Gold', 8, 'UK', '8', 3, 'PE-RUG-SF8-WGLD-08'),
  ('82000000-0000-4000-8000-000000000008', '92000000-0000-4000-8000-000000000001', 'White/Gold', 9, 'UK', '9', 4, 'PE-RUG-SF8-WGLD-09'),
  ('82000000-0000-4000-8000-000000000009', '92000000-0000-4000-8000-000000000001', 'White/Gold', 10, 'UK', '10', 2, 'PE-RUG-SF8-WGLD-10'),
  ('82000000-0000-4000-8000-000000000010', '92000000-0000-4000-8000-000000000001', 'White/Gold', 11, 'UK', '11', 1, 'PE-RUG-SF8-WGLD-11'),

  -- 2. MatchPace Backs Rugby Boots (UK sizing, Electric Blue & Stealth Black)
  ('82000000-0000-4000-8000-000000000011', '92000000-0000-4000-8000-000000000002', 'Electric Blue', 7, 'UK', '7', 4, 'PE-RUG-MPB-BLU-07'),
  ('82000000-0000-4000-8000-000000000012', '92000000-0000-4000-8000-000000000002', 'Electric Blue', 8, 'UK', '8', 6, 'PE-RUG-MPB-BLU-08'),
  ('82000000-0000-4000-8000-000000000013', '92000000-0000-4000-8000-000000000002', 'Electric Blue', 9, 'UK', '9', 5, 'PE-RUG-MPB-BLU-09'),
  ('82000000-0000-4000-8000-000000000014', '92000000-0000-4000-8000-000000000002', 'Electric Blue', 10, 'UK', '10', 3, 'PE-RUG-MPB-BLU-10'),
  ('82000000-0000-4000-8000-000000000015', '92000000-0000-4000-8000-000000000002', 'Electric Blue', 11, 'UK', '11', 2, 'PE-RUG-MPB-BLU-11'),

  ('82000000-0000-4000-8000-000000000016', '92000000-0000-4000-8000-000000000002', 'Stealth Black', 7, 'UK', '7', 2, 'PE-RUG-MPB-BLK-07'),
  ('82000000-0000-4000-8000-000000000017', '92000000-0000-4000-8000-000000000002', 'Stealth Black', 8, 'UK', '8', 4, 'PE-RUG-MPB-BLK-08'),
  ('82000000-0000-4000-8000-000000000018', '92000000-0000-4000-8000-000000000002', 'Stealth Black', 9, 'UK', '9', 3, 'PE-RUG-MPB-BLK-09'),
  ('82000000-0000-4000-8000-000000000019', '92000000-0000-4000-8000-000000000002', 'Stealth Black', 10, 'UK', '10', 0, 'PE-RUG-MPB-BLK-10'),
  ('82000000-0000-4000-8000-000000000020', '92000000-0000-4000-8000-000000000002', 'Stealth Black', 11, 'UK', '11', 1, 'PE-RUG-MPB-BLK-11'),

  -- 3. Vortex Match Rugby Ball (Custom / Size 5)
  ('82000000-0000-4000-8000-000000000021', '92000000-0000-4000-8000-000000000003', 'Cyan/Navy', null, 'Custom', 'Size 5', 12, 'PE-RUG-BALL-VORT-CYN'),
  ('82000000-0000-4000-8000-000000000022', '92000000-0000-4000-8000-000000000003', 'White/Amber', null, 'Custom', 'Size 5', 8, 'PE-RUG-BALL-VORT-AMB'),

  -- 4. Elevate Adjustable Kick Tee (Custom / One Size)
  ('82000000-0000-4000-8000-000000000023', '92000000-0000-4000-8000-000000000004', 'Pro Amber', null, 'Custom', 'One Size', 15, 'PE-RUG-TEE-ELV-AMB'),
  ('82000000-0000-4000-8000-000000000024', '92000000-0000-4000-8000-000000000004', 'Black', null, 'Custom', 'One Size', 10, 'PE-RUG-TEE-ELV-BLK'),

  -- 5. Titan Armour Head Gear (Custom / S, M, L, XL)
  ('82000000-0000-4000-8000-000000000025', '92000000-0000-4000-8000-000000000005', 'Matte Black', null, 'Custom', 'S', 4, 'PE-RUG-HG-TIT-BLK-S'),
  ('82000000-0000-4000-8000-000000000026', '92000000-0000-4000-8000-000000000005', 'Matte Black', null, 'Custom', 'M', 7, 'PE-RUG-HG-TIT-BLK-M'),
  ('82000000-0000-4000-8000-000000000027', '92000000-0000-4000-8000-000000000005', 'Matte Black', null, 'Custom', 'L', 5, 'PE-RUG-HG-TIT-BLK-L'),
  ('82000000-0000-4000-8000-000000000028', '92000000-0000-4000-8000-000000000005', 'Matte Black', null, 'Custom', 'XL', 2, 'PE-RUG-HG-TIT-BLK-XL'),

  ('82000000-0000-4000-8000-000000000029', '92000000-0000-4000-8000-000000000005', 'Deep Royal', null, 'Custom', 'S', 2, 'PE-RUG-HG-TIT-RYL-S'),
  ('82000000-0000-4000-8000-000000000030', '92000000-0000-4000-8000-000000000005', 'Deep Royal', null, 'Custom', 'M', 4, 'PE-RUG-HG-TIT-RYL-M'),
  ('82000000-0000-4000-8000-000000000031', '92000000-0000-4000-8000-000000000005', 'Deep Royal', null, 'Custom', 'L', 3, 'PE-RUG-HG-TIT-RYL-L'),
  ('82000000-0000-4000-8000-000000000032', '92000000-0000-4000-8000-000000000005', 'Deep Royal', null, 'Custom', 'XL', 0, 'PE-RUG-HG-TIT-RYL-XL'),

  -- 6. ProDent Dual-Layer Mouth Guard (Custom / One Size)
  ('82000000-0000-4000-8000-000000000033', '92000000-0000-4000-8000-000000000006', 'Clear/Black', null, 'Custom', 'One Size', 25, 'PE-RUG-MG-PD-CLR'),
  ('82000000-0000-4000-8000-000000000034', '92000000-0000-4000-8000-000000000006', 'Amber/Black', null, 'Custom', 'One Size', 20, 'PE-RUG-MG-PD-AMB'),

  -- 7. GripTech Elite Rugby Socks (Custom / M, L)
  ('82000000-0000-4000-8000-000000000035', '92000000-0000-4000-8000-000000000007', 'Black/Amber', null, 'Custom', 'M (UK 6-8)', 18, 'PE-RUG-SCK-GT-BLK-M'),
  ('82000000-0000-4000-8000-000000000036', '92000000-0000-4000-8000-000000000007', 'Black/Amber', null, 'Custom', 'L (UK 9-11)', 22, 'PE-RUG-SCK-GT-BLK-L'),
  ('82000000-0000-4000-8000-000000000037', '92000000-0000-4000-8000-000000000007', 'White/Black', null, 'Custom', 'M (UK 6-8)', 15, 'PE-RUG-SCK-GT-WHT-M'),
  ('82000000-0000-4000-8000-000000000038', '92000000-0000-4000-8000-000000000007', 'White/Black', null, 'Custom', 'L (UK 9-11)', 14, 'PE-RUG-SCK-GT-WHT-L'),

  -- 8. FlexForce K-Tape (Custom / One Size, 3 colours)
  ('82000000-0000-4000-8000-000000000039', '92000000-0000-4000-8000-000000000008', 'Jet Black', null, 'Custom', 'One Size', 30, 'PE-ACC-KT-FF-BLK'),
  ('82000000-0000-4000-8000-000000000040', '92000000-0000-4000-8000-000000000008', 'Electric Blue', null, 'Custom', 'One Size', 20, 'PE-ACC-KT-FF-BLU'),
  ('82000000-0000-4000-8000-000000000041', '92000000-0000-4000-8000-000000000008', 'Skin Beige', null, 'Custom', 'One Size', 25, 'PE-ACC-KT-FF-BGE'),

  -- 9. RigidZinc Strapping Tape (Custom / One Size, 2 colours)
  ('82000000-0000-4000-8000-000000000042', '92000000-0000-4000-8000-000000000009', 'Classic Tan', null, 'Custom', 'One Size', 40, 'PE-ACC-RT-RZ-TAN'),
  ('82000000-0000-4000-8000-000000000043', '92000000-0000-4000-8000-000000000009', 'Pure White', null, 'Custom', 'One Size', 35, 'PE-ACC-RT-RZ-WHT'),

  -- 10. Dual-Stroke Pressure Ball Pump (Custom / One Size)
  ('82000000-0000-4000-8000-000000000044', '92000000-0000-4000-8000-000000000010', 'Matte Black', null, 'Custom', 'One Size', 16, 'PE-ACC-PUMP-DS-BLK')
on conflict (id) do update set
  product_id  = excluded.product_id,
  colour      = excluded.colour,
  size        = excluded.size,
  size_system = excluded.size_system,
  size_value  = excluded.size_value,
  stock       = excluded.stock,
  sku         = excluded.sku;

