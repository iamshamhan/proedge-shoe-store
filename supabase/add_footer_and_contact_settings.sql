-- Migration: Add footer and contact configuration columns to store_settings
-- Allows store administrators to customize brand name, address, phone, and email.

alter table public.store_settings
add column if not exists brand_name text default 'PROEDGE',
add column if not exists contact_address text default 'Galle Road, Colombo 03, Sri Lanka',
add column if not exists contact_phone text default '+94 11 234 5678',
add column if not exists contact_email text default 'support@proedge.lk';

-- Update default record if existing
update public.store_settings
set
  brand_name = coalesce(brand_name, 'PROEDGE'),
  contact_address = coalesce(contact_address, 'Galle Road, Colombo 03, Sri Lanka'),
  contact_phone = coalesce(contact_phone, '+94 11 234 5678'),
  contact_email = coalesce(contact_email, 'support@proedge.lk')
where id = 'default';
