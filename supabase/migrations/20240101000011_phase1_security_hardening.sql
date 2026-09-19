-- Migration: phase1_security_hardening.sql
-- Description: Applies Phase 1 security changes to an existing database safely.
-- Idempotent: Yes. Safe to run multiple times.

-- 1. Secure the Checkout Flow
-- The application relies entirely on the 'place_order' RPC for checkout,
-- which operates securely with 'security definer' privileges. 
-- These two older demo-only policies left the tables open to raw 
-- client-side INSERT attacks. We drop them if they still exist.
drop policy if exists "Public submit orders (demo only)" on public.orders;
drop policy if exists "Public submit order items (demo only)" on public.order_items;

-- 2. Harden the Product Images Storage Bucket
-- Ensure the storage bucket strictly limits uploads to 5MB and
-- standard web image formats to prevent malicious file hosting.
update storage.buckets
set 
  file_size_limit = 5242880, -- 5MB in bytes
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']::text[]
where id = 'product-images';
