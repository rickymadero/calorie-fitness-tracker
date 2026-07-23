-- Evolve production schema (v1)
-- Keeps connection_test intact. No localStorage migration.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.plan_tier as enum ('free', 'pro');
create type public.activity_type as enum (
  'running', 'cycling', 'swimming', 'hyrox', 'walking', 'hiking',
  'strength', 'functional', 'cross_training', 'rowing', 'indoor_cycling',
  'treadmill', 'other'
);
create type public.activity_source as enum (
  'manual', 'apple_health', 'apple_watch', 'garmin', 'imported_file', 'other'
);
create type public.visibility_level as enum ('public', 'followers', 'private');
create type public.metric_category as enum ('basic', 'advanced');
create type public.meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type public.follow_status as enum ('pending', 'accepted');
create type public.preferred_units as enum ('metric', 'imperial');
create type public.theme_preference as enum ('light', 'dark', 'system');
create type public.wearable_provider as enum (
  'apple_health', 'apple_watch', 'garmin', 'other'
);
create type public.wearable_status as enum (
  'disconnected', 'connected', 'error', 'pending'
);
create type public.story_media_type as enum ('image', 'video');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  full_name text,
  bio text,
  avatar_url text,
  plan public.plan_tier not null default 'free',
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    char_length(username) between 3 and 30
    and username ~ '^[a-z0-9_]+$'
  )
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));
create index profiles_plan_idx on public.profiles (plan);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Block client-side plan changes (service_role / postgres may still update)
create or replace function public.prevent_client_plan_change()
returns trigger
language plpgsql
as $$
begin
  if new.plan is distinct from old.plan then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'Plan changes are not allowed from the client';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_client_plan_change
before update on public.profiles
for each row execute function public.prevent_client_plan_change();

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  preferred_units public.preferred_units not null default 'metric',
  language text not null default 'en',
  theme public.theme_preference not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: create profile + settings on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    split_part(coalesce(new.email, new.id::text), '@', 1),
    '[^a-z0-9_]',
    '',
    'g'
  ));
  if base_username is null or char_length(base_username) < 3 then
    base_username := 'athlete';
  end if;
  if char_length(base_username) > 24 then
    base_username := left(base_username, 24);
  end if;

  candidate := base_username;
  while exists (select 1 from public.profiles p where lower(p.username) = candidate) loop
    suffix := suffix + 1;
    candidate := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, plan, is_private)
  values (
    new.id,
    candidate,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), ''),
    'free',
    false
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_type public.activity_type not null,
  title text not null,
  description text,
  source public.activity_source not null default 'manual',
  external_activity_id text,
  device_name text,
  is_wearable_imported boolean not null default false,
  started_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  distance_meters double precision check (distance_meters is null or distance_meters >= 0),
  calories integer check (calories is null or calories >= 0),
  elevation_gain_meters double precision,
  average_heart_rate integer,
  maximum_heart_rate integer,
  average_pace_seconds_per_km double precision,
  average_speed_kmh double precision,
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index activities_unique_external_import_idx
  on public.activities (user_id, source, external_activity_id)
  where external_activity_id is not null;

create index activities_user_id_created_at_idx
  on public.activities (user_id, created_at desc);
create index activities_activity_type_idx
  on public.activities (activity_type);

create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- activity_metrics
-- ---------------------------------------------------------------------------
create table public.activity_metrics (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  metric_key text not null,
  label text not null,
  numeric_value double precision,
  text_value text,
  unit text,
  category public.metric_category not null default 'basic',
  source public.activity_source not null default 'manual',
  created_at timestamptz not null default now(),
  constraint activity_metrics_value_present check (
    numeric_value is not null or (text_value is not null and length(trim(text_value)) > 0)
  ),
  constraint activity_metrics_unique_key unique (activity_id, metric_key)
);

create index activity_metrics_activity_id_idx
  on public.activity_metrics (activity_id);

-- ---------------------------------------------------------------------------
-- activity_splits
-- ---------------------------------------------------------------------------
create table public.activity_splits (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  split_index integer not null check (split_index >= 1),
  distance_meters double precision,
  duration_seconds integer,
  pace_seconds_per_km double precision,
  average_heart_rate integer,
  elevation_change_meters double precision,
  created_at timestamptz not null default now(),
  constraint activity_splits_unique_index unique (activity_id, split_index)
);

create index activity_splits_activity_id_idx
  on public.activity_splits (activity_id);

-- ---------------------------------------------------------------------------
-- heart_rate_zones
-- ---------------------------------------------------------------------------
create table public.heart_rate_zones (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  zone_number integer not null check (zone_number between 1 and 5),
  minimum_bpm integer,
  maximum_bpm integer,
  duration_seconds integer,
  percentage double precision,
  created_at timestamptz not null default now(),
  constraint heart_rate_zones_unique unique (activity_id, zone_number)
);

create index heart_rate_zones_activity_id_idx
  on public.heart_rate_zones (activity_id);

-- ---------------------------------------------------------------------------
-- route_points (large; sequenced)
-- ---------------------------------------------------------------------------
create table public.route_points (
  id bigint generated always as identity primary key,
  activity_id uuid not null references public.activities (id) on delete cascade,
  sequence_number integer not null check (sequence_number >= 0),
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  elevation_meters double precision,
  recorded_at timestamptz,
  constraint route_points_unique_seq unique (activity_id, sequence_number)
);

create index route_points_activity_seq_idx
  on public.route_points (activity_id, sequence_number);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_id uuid references public.activities (id) on delete set null,
  caption text,
  image_url text,
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_user_id_created_at_idx on public.posts (user_id, created_at desc);
create index posts_activity_id_idx on public.posts (activity_id);

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- Feed-selected basic metrics (max 4)
create table public.post_metric_visibility (
  post_id uuid not null references public.posts (id) on delete cascade,
  metric_key text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  primary key (post_id, metric_key)
);

create index post_metric_visibility_post_id_idx
  on public.post_metric_visibility (post_id);

create or replace function public.is_allowed_feed_metric_key(p_key text)
returns boolean
language sql
immutable
as $$
  select p_key = any (array[
    'distance', 'average_pace', 'duration', 'calories',
    'average_speed', 'elevation_gain', 'pace_per_100m', 'laps',
    'total_duration', 'average_running_pace', 'completed_stations',
    'total_volume', 'exercises', 'personal_records'
  ]);
$$;

create or replace function public.enforce_post_metric_visibility()
returns trigger
language plpgsql
as $$
declare
  selected_count integer;
  act_id uuid;
  metric_cat public.metric_category;
begin
  if not public.is_allowed_feed_metric_key(new.metric_key) then
    raise exception 'Metric key % is not allowed on feed posts', new.metric_key;
  end if;

  select p.activity_id into act_id from public.posts p where p.id = new.post_id;

  if act_id is not null then
    select am.category into metric_cat
    from public.activity_metrics am
    where am.activity_id = act_id and am.metric_key = new.metric_key;

    if metric_cat = 'advanced' then
      raise exception 'Advanced metrics cannot be selected for the public feed';
    end if;
  end if;

  select count(*) into selected_count
  from public.post_metric_visibility pmv
  where pmv.post_id = new.post_id
    and (tg_op = 'INSERT' or pmv.metric_key is distinct from old.metric_key);

  if tg_op = 'INSERT' and selected_count >= 4 then
    raise exception 'A post may select at most 4 feed metrics';
  end if;

  return new;
end;
$$;

create trigger post_metric_visibility_enforce
before insert or update on public.post_metric_visibility
for each row execute function public.enforce_post_metric_visibility();

-- ---------------------------------------------------------------------------
-- likes / comments / follows
-- ---------------------------------------------------------------------------
create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index likes_post_id_idx on public.likes (post_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id);

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  status public.follow_status not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index follows_follower_id_idx on public.follows (follower_id);
create index follows_following_id_idx on public.follows (following_id);

-- ---------------------------------------------------------------------------
-- food_logs
-- ---------------------------------------------------------------------------
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_name text not null,
  meal_type public.meal_type not null,
  calories numeric(10, 2) not null default 0,
  protein_grams numeric(10, 2) not null default 0,
  carbohydrate_grams numeric(10, 2) not null default 0,
  fat_grams numeric(10, 2) not null default 0,
  serving_size text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index food_logs_user_id_logged_at_idx
  on public.food_logs (user_id, logged_at desc);

create trigger food_logs_set_updated_at
before update on public.food_logs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- stories (simplified + extensible columns)
-- ---------------------------------------------------------------------------
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  media_url text not null,
  media_type public.story_media_type not null default 'image',
  caption text,
  -- Extensibility for dual-camera / archive (unused by app yet)
  front_media_url text,
  rear_media_url text,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index stories_user_id_created_at_idx on public.stories (user_id, created_at desc);
create index stories_expires_at_idx on public.stories (expires_at);

-- ---------------------------------------------------------------------------
-- messaging
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conversation_members_user_id_idx
  on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  media_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint messages_has_content check (
    (body is not null and length(trim(body)) > 0) or media_url is not null
  )
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- wearable_connections (metadata only — no tokens)
-- ---------------------------------------------------------------------------
create table public.wearable_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider public.wearable_provider not null,
  status public.wearable_status not null default 'disconnected',
  external_user_id text,
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wearable_connections_user_provider unique (user_id, provider)
);

create index wearable_connections_user_provider_idx
  on public.wearable_connections (user_id, provider);

create trigger wearable_connections_set_updated_at
before update on public.wearable_connections
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------
create or replace function public.is_pro(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.plan = 'pro'
  );
$$;

create or replace function public.is_accepted_follower(follower uuid, following uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.follows f
    where f.follower_id = follower
      and f.following_id = following
      and f.status = 'accepted'
  );
$$;

create or replace function public.can_view_profile(owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = owner_id
      and (
        not p.is_private
        or auth.uid() = owner_id
        or public.is_accepted_follower(auth.uid(), owner_id)
      )
  );
$$;

create or replace function public.can_view_activity(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.activities a
    where a.id = p_activity_id
      and (
        a.user_id = auth.uid()
        or a.visibility = 'public'
        or (
          a.visibility = 'followers'
          and auth.uid() is not null
          and public.is_accepted_follower(auth.uid(), a.user_id)
        )
      )
  );
$$;

create or replace function public.can_view_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.posts p
    where p.id = p_post_id
      and (
        p.user_id = auth.uid()
        or p.visibility = 'public'
        or (
          p.visibility = 'followers'
          and auth.uid() is not null
          and public.is_accepted_follower(auth.uid(), p.user_id)
        )
      )
  );
$$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.can_read_advanced_metric(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.activities a
    where a.id = p_activity_id
      and public.can_view_activity(p_activity_id)
      and (
        a.user_id = auth.uid()
        or public.is_pro(auth.uid())
      )
  );
$$;

revoke all on function public.is_pro(uuid) from public;
revoke all on function public.is_accepted_follower(uuid, uuid) from public;
revoke all on function public.can_view_profile(uuid) from public;
revoke all on function public.can_view_activity(uuid) from public;
revoke all on function public.can_view_post(uuid) from public;
revoke all on function public.is_conversation_member(uuid) from public;
revoke all on function public.can_read_advanced_metric(uuid) from public;

grant execute on function public.is_pro(uuid) to anon, authenticated;
grant execute on function public.is_accepted_follower(uuid, uuid) to anon, authenticated;
grant execute on function public.can_view_profile(uuid) to anon, authenticated;
grant execute on function public.can_view_activity(uuid) to anon, authenticated;
grant execute on function public.can_view_post(uuid) to anon, authenticated;
grant execute on function public.is_conversation_member(uuid) to anon, authenticated;
grant execute on function public.can_read_advanced_metric(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.activities enable row level security;
alter table public.activity_metrics enable row level security;
alter table public.activity_splits enable row level security;
alter table public.heart_rate_zones enable row level security;
alter table public.route_points enable row level security;
alter table public.posts enable row level security;
alter table public.post_metric_visibility enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.food_logs enable row level security;
alter table public.stories enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.wearable_connections enable row level security;

-- profiles
create policy profiles_select on public.profiles
  for select using (public.can_view_profile(id));

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- inserts come from trigger (security definer); no client insert policy

-- user_settings
create policy user_settings_select_own on public.user_settings
  for select using (auth.uid() = user_id);
create policy user_settings_update_own on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_settings_insert_own on public.user_settings
  for insert with check (auth.uid() = user_id);

-- activities
create policy activities_select on public.activities
  for select using (public.can_view_activity(id));
create policy activities_insert_own on public.activities
  for insert with check (auth.uid() = user_id);
create policy activities_update_own on public.activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy activities_delete_own on public.activities
  for delete using (auth.uid() = user_id);

-- activity_metrics (PRO gate for advanced)
create policy activity_metrics_select on public.activity_metrics
  for select using (
    public.can_view_activity(activity_id)
    and (
      category = 'basic'
      or public.can_read_advanced_metric(activity_id)
    )
  );
create policy activity_metrics_insert_own on public.activity_metrics
  for insert with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_id and a.user_id = auth.uid()
    )
  );
create policy activity_metrics_update_own on public.activity_metrics
  for update using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id and a.user_id = auth.uid()
    )
  );
create policy activity_metrics_delete_own on public.activity_metrics
  for delete using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id and a.user_id = auth.uid()
    )
  );

-- activity_splits / hr / routes inherit activity visibility; owner writes
create policy activity_splits_select on public.activity_splits
  for select using (public.can_view_activity(activity_id));
create policy activity_splits_insert_own on public.activity_splits
  for insert with check (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy activity_splits_update_own on public.activity_splits
  for update using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy activity_splits_delete_own on public.activity_splits
  for delete using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );

create policy heart_rate_zones_select on public.heart_rate_zones
  for select using (public.can_view_activity(activity_id));
create policy heart_rate_zones_insert_own on public.heart_rate_zones
  for insert with check (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy heart_rate_zones_update_own on public.heart_rate_zones
  for update using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy heart_rate_zones_delete_own on public.heart_rate_zones
  for delete using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );

create policy route_points_select on public.route_points
  for select using (public.can_view_activity(activity_id));
create policy route_points_insert_own on public.route_points
  for insert with check (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy route_points_update_own on public.route_points
  for update using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );
create policy route_points_delete_own on public.route_points
  for delete using (
    exists (select 1 from public.activities a where a.id = activity_id and a.user_id = auth.uid())
  );

-- posts
create policy posts_select on public.posts
  for select using (public.can_view_post(id));
create policy posts_insert_own on public.posts
  for insert with check (
    auth.uid() = user_id
    and (
      activity_id is null
      or exists (
        select 1 from public.activities a
        where a.id = activity_id and a.user_id = auth.uid()
      )
    )
  );
create policy posts_update_own on public.posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy posts_delete_own on public.posts
  for delete using (auth.uid() = user_id);

-- post_metric_visibility
create policy post_metric_visibility_select on public.post_metric_visibility
  for select using (public.can_view_post(post_id));
create policy post_metric_visibility_insert_own on public.post_metric_visibility
  for insert with check (
    exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );
create policy post_metric_visibility_update_own on public.post_metric_visibility
  for update using (
    exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );
create policy post_metric_visibility_delete_own on public.post_metric_visibility
  for delete using (
    exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

-- likes
create policy likes_select on public.likes
  for select using (public.can_view_post(post_id));
create policy likes_insert_own on public.likes
  for insert with check (
    auth.uid() = user_id and public.can_view_post(post_id)
  );
create policy likes_delete_own on public.likes
  for delete using (auth.uid() = user_id);

-- comments
create policy comments_select on public.comments
  for select using (public.can_view_post(post_id));
create policy comments_insert_own on public.comments
  for insert with check (
    auth.uid() = user_id and public.can_view_post(post_id)
  );
create policy comments_update_own on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy comments_delete_own_or_post_owner on public.comments
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()
    )
  );

-- follows
create policy follows_select_involved on public.follows
  for select using (
    auth.uid() = follower_id or auth.uid() = following_id
  );
create policy follows_insert_as_follower on public.follows
  for insert with check (
    auth.uid() = follower_id and follower_id <> following_id
  );
create policy follows_update_as_following on public.follows
  for update using (auth.uid() = following_id)
  with check (auth.uid() = following_id);
create policy follows_delete_involved on public.follows
  for delete using (
    auth.uid() = follower_id or auth.uid() = following_id
  );

-- food_logs
create policy food_logs_all_own on public.food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- stories
create policy stories_select on public.stories
  for select using (
    auth.uid() = user_id
    or (
      expires_at > now()
      and archived_at is null
      and public.can_view_profile(user_id)
    )
  );
create policy stories_insert_own on public.stories
  for insert with check (auth.uid() = user_id);
create policy stories_delete_own on public.stories
  for delete using (auth.uid() = user_id);
create policy stories_update_own on public.stories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations / members / messages
create policy conversations_select_member on public.conversations
  for select using (public.is_conversation_member(id));
create policy conversations_insert_authenticated on public.conversations
  for insert with check (auth.uid() is not null);
create policy conversations_update_member on public.conversations
  for update using (public.is_conversation_member(id));

create policy conversation_members_select on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));
create policy conversation_members_insert on public.conversation_members
  for insert with check (
    auth.uid() = user_id
    or public.is_conversation_member(conversation_id)
  );
create policy conversation_members_delete_self on public.conversation_members
  for delete using (auth.uid() = user_id);

create policy messages_select_member on public.messages
  for select using (public.is_conversation_member(conversation_id));
create policy messages_insert_member on public.messages
  for insert with check (
    auth.uid() = sender_id
    and public.is_conversation_member(conversation_id)
  );
create policy messages_update_sender on public.messages
  for update using (auth.uid() = sender_id);

-- wearable_connections
create policy wearable_connections_all_own on public.wearable_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
