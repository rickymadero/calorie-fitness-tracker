-- Add pricing region persistence for Pro plan localization.
-- Language stays on user_settings.language; region controls currency only.

alter table public.user_settings
  add column if not exists pricing_region text null,
  add column if not exists pricing_region_source text null;

alter table public.user_settings
  drop constraint if exists user_settings_pricing_region_check;

alter table public.user_settings
  add constraint user_settings_pricing_region_check
  check (
    pricing_region is null
    or pricing_region in ('MX', 'US', 'CA', 'GB', 'EU', 'LATAM', 'DEFAULT')
  );

alter table public.user_settings
  drop constraint if exists user_settings_pricing_region_source_check;

alter table public.user_settings
  add constraint user_settings_pricing_region_source_check
  check (
    pricing_region_source is null
    or pricing_region_source in ('manual', 'auto')
  );

comment on column public.user_settings.pricing_region is
  'Pro pricing region (MX, US, …). Independent of UI language.';
comment on column public.user_settings.pricing_region_source is
  'manual = user selected; auto = detected (optional). Manual must not be overwritten by detection.';
