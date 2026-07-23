-- Persist onboarding completion on profiles (source of truth for post-auth routing)
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz null;

comment on column public.profiles.onboarding_completed is
  'True once the user finishes the Evolve onboarding funnel';
comment on column public.profiles.onboarding_completed_at is
  'Timestamp when onboarding was completed';
