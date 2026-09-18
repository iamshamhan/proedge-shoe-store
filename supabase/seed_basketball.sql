-- =============================================================================
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
