-- Migration: Add sale_enabled and sale_discount_percent to store_settings table
-- This allows store administrators to enable/disable promotional sale campaigns
-- and configure the dynamic discount percentage across the store.

alter table public.store_settings
add column if not exists sale_enabled boolean default true,
add column if not exists sale_discount_percent integer default 30;

-- Ensure default row has values if currently null
update public.store_settings
set 
  sale_enabled = coalesce(sale_enabled, true),
  sale_discount_percent = coalesce(sale_discount_percent, 30)
where id = 'default';
