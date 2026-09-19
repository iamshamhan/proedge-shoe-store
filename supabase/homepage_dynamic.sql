-- ==============================================================================
-- 1. Add Category Homepage Fields
-- ==============================================================================
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS tagline text;

-- ==============================================================================
-- 2. Add Homepage Settings & WhatsApp configuration
-- ==============================================================================
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS whatsapp_number text default '+94 77 123 4567',
  ADD COLUMN IF NOT EXISTS sale_section_title text default 'Special Offers',
  ADD COLUMN IF NOT EXISTS sale_section_subtitle text default 'Explore our top discounted sneakers and gear.',
  ADD COLUMN IF NOT EXISTS new_arrivals_title text default 'New Arrivals',
  ADD COLUMN IF NOT EXISTS new_arrivals_subtitle text default 'Just released designs with improved sole ergonomics and cutting-edge material tech.';

-- Update the default row if it exists
UPDATE public.store_settings
SET
  whatsapp_number = COALESCE(whatsapp_number, '+94 77 123 4567'),
  sale_section_title = COALESCE(sale_section_title, 'Special Offers'),
  sale_section_subtitle = COALESCE(sale_section_subtitle, 'Explore our top discounted sneakers and gear.'),
  new_arrivals_title = COALESCE(new_arrivals_title, 'New Arrivals'),
  new_arrivals_subtitle = COALESCE(new_arrivals_subtitle, 'Just released designs with improved sole ergonomics and cutting-edge material tech.')
WHERE id = 'default';

