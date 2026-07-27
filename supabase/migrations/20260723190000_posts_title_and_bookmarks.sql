-- Posts migration: title column + post_bookmarks.
-- Additive only — does not reset existing posts/likes/comments rows.
-- video_url intentionally omitted: create-post only stores local data-URLs today.

-- ---------------------------------------------------------------------------
-- posts.title — required by existing WorkoutPost UI
-- ---------------------------------------------------------------------------
alter table public.posts
  add column if not exists title text not null default '';

comment on column public.posts.title is
  'Short workout title shown on feed cards and post detail';

-- ---------------------------------------------------------------------------
-- post_bookmarks — Saved page (owner-only; viewable posts only)
-- ---------------------------------------------------------------------------
create table if not exists public.post_bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists post_bookmarks_user_id_created_at_idx
  on public.post_bookmarks (user_id, created_at desc);

create index if not exists post_bookmarks_post_id_idx
  on public.post_bookmarks (post_id);

comment on table public.post_bookmarks is
  'User-saved posts; owner-only read/write; insert requires can_view_post';

alter table public.post_bookmarks enable row level security;

drop policy if exists post_bookmarks_select_own on public.post_bookmarks;
create policy post_bookmarks_select_own on public.post_bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists post_bookmarks_insert_own on public.post_bookmarks;
create policy post_bookmarks_insert_own on public.post_bookmarks
  for insert with check (
    auth.uid() = user_id
    and public.can_view_post(post_id)
  );

drop policy if exists post_bookmarks_delete_own on public.post_bookmarks;
create policy post_bookmarks_delete_own on public.post_bookmarks
  for delete using (auth.uid() = user_id);

-- Helpful for threaded comment lookups
create index if not exists comments_parent_comment_id_idx
  on public.comments (parent_comment_id);
