-- Add dynamic homepage fields to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS tagline text;

-- Update the view/policy if necessary (usually not needed if just adding columns for public read)
