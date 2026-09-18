-- Migration: Add hero_product_slug to store_settings table
-- This allows the store administrator to choose which product is highlighted in the homepage hero banner.

alter table public.store_settings
add column if not exists hero_product_slug text default 'proedge-runner-x1';

-- Ensure existing record has default value if currently null
update public.store_settings
set hero_product_slug = 'proedge-runner-x1'
where hero_product_slug is null;
