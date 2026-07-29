-- Track Workout: lifecycle fields, evolve_phone source, richer route points.
-- Extends existing activities system; does not duplicate tables.
-- Unique (user_id, source, external_activity_id) already exists.

-- ---------------------------------------------------------------------------
-- activity_source: phone-tracked workouts
-- ---------------------------------------------------------------------------
alter type public.activity_source add value if not exists 'evolve_phone';
alter type public.activity_source add value if not exists 'evolve_apple_watch';

-- ---------------------------------------------------------------------------
-- activity_status for in-progress / completed lifecycle
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.activity_status as enum (
    'active',
    'paused',
    'completed',
    'discarded'
  );
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- activities columns
-- ---------------------------------------------------------------------------
alter table public.activities
  add column if not exists status public.activity_status null,
  add column if not exists ended_at timestamptz null,
  add column if not exists moving_seconds integer null
    check (moving_seconds is null or moving_seconds >= 0),
  add column if not exists paused_seconds integer null
    check (paused_seconds is null or paused_seconds >= 0),
  add column if not exists best_pace_seconds_per_km double precision null,
  add column if not exists max_speed_kmh double precision null,
  add column if not exists privacy_route_mode text null
    check (
      privacy_route_mode is null
      or privacy_route_mode in (
        'show',
        'hide_route',
        'hide_start_end',
        'private'
      )
    );

comment on column public.activities.status is
  'Workout lifecycle: active/paused while tracking; completed/discarded when finished.';
comment on column public.activities.privacy_route_mode is
  'Route privacy preference for map rendering.';

-- Completed historical rows stay null status (treated as completed by app).
-- New phone tracks set status explicitly.

-- ---------------------------------------------------------------------------
-- route_points: accuracy + speed for GPS filtering / analytics
-- ---------------------------------------------------------------------------
alter table public.route_points
  add column if not exists accuracy_meters double precision null,
  add column if not exists speed_mps double precision null;

comment on column public.route_points.accuracy_meters is
  'Horizontal accuracy from the device GPS sample.';
comment on column public.route_points.speed_mps is
  'Instantaneous speed from the device when reliable.';

-- Yoga / HIIT aliases already map via activity_type functional/cross_training/other.
-- Strength tables deferred to specialty phase.
