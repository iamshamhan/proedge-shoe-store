alter table public.store_settings
  add column if not exists logo_horizontal_url text,
  add column if not exists logo_stacked_url text;
