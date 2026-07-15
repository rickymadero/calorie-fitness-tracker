"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Lock,
  Users,
  Globe,
} from "lucide-react";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar, FollowButton } from "@/components/social/PersonCard";
import { Badge } from "@/components/ui/Badge";
import { RouteMapPreview } from "@/components/feed/RouteMapPreview";
import { ShareActivitySheet } from "@/components/feed/ShareActivitySheet";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatDurationClock,
  formatPace,
} from "@/lib/geo/routes";
import type { WorkoutPost } from "@/lib/types/posts";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function VisibilityIcon({ v }: { v: WorkoutPost["visibility"] }) {
  if (v === "private") return <Lock size={12} className="text-muted" />;
  if (v === "followers") return <Users size={12} className="text-muted" />;
  return <Globe size={12} className="text-muted" />;
}

export function LikeButton({
  postId,
  likesCount,
}: {
  postId: string;
  likesCount: number;
}) {
  const { hasLiked, toggleLike } = usePosts();
  const liked = hasLiked(postId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(postId);
      }}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-sm font-medium transition ${
        liked ? "text-accent" : "text-muted hover:text-foreground"
      }`}
      aria-pressed={liked}
    >
      <Heart
        size={18}
        className={liked ? "fill-accent text-accent" : ""}
        strokeWidth={liked ? 0 : 2}
      />
      {likesCount}
    </button>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <p className="font-display text-base font-bold tracking-tight sm:text-lg">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}

function OutdoorStats({ post }: { post: WorkoutPost }) {
  const pace = formatPace(post.paceMinPerKm);
  const cells: { label: string; value: string }[] = [];
  if (post.distanceKm != null) {
    cells.push({ label: "Distance", value: `${post.distanceKm.toFixed(2)} km` });
  }
  if (post.durationMin != null) {
    cells.push({ label: "Time", value: formatDurationClock(post.durationMin) });
  }
  if (pace) cells.push({ label: "Avg pace", value: pace });
  if (post.caloriesBurned != null) {
    cells.push({ label: "Calories", value: `${post.caloriesBurned}` });
  } else if (post.elevationGainM != null) {
    cells.push({ label: "Elev gain", value: `${post.elevationGainM} m` });
  } else if (post.avgSpeedKmh != null) {
    cells.push({ label: "Avg speed", value: `${post.avgSpeedKmh.toFixed(1)} km/h` });
  }
  return (
    <div
      className={`mt-3 grid gap-2 rounded-2xl bg-muted-bg px-2 py-3 ${
        cells.length >= 4 ? "grid-cols-4" : `grid-cols-${Math.max(cells.length, 2)}`
      }`}
      style={{
        gridTemplateColumns: `repeat(${Math.min(cells.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {cells.slice(0, 4).map((c) => (
        <StatCell key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
}

function GymBody({ post }: { post: WorkoutPost }) {
  return (
    <div className="mt-3 space-y-3">
      {post.muscleGroups && post.muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.muscleGroups.map((m) => (
            <Badge key={m} variant="accent">
              {m}
            </Badge>
          ))}
        </div>
      )}
      <div
        className="grid gap-2 rounded-2xl bg-muted-bg px-2 py-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(
            [
              post.durationMin,
              post.exerciseCount,
              post.totalSets,
              post.totalVolumeKg ?? post.caloriesBurned,
            ].filter((x) => x != null).length,
            4,
          )}, minmax(0, 1fr))`,
        }}
      >
        {post.durationMin != null && (
          <StatCell label="Duration" value={`${post.durationMin} min`} />
        )}
        {post.exerciseCount != null && (
          <StatCell label="Exercises" value={String(post.exerciseCount)} />
        )}
        {post.totalSets != null && (
          <StatCell label="Sets" value={String(post.totalSets)} />
        )}
        {post.totalVolumeKg != null ? (
          <StatCell
            label="Volume"
            value={`${post.totalVolumeKg.toLocaleString()} kg`}
          />
        ) : post.caloriesBurned != null ? (
          <StatCell label="Calories" value={String(post.caloriesBurned)} />
        ) : null}
      </div>
      {post.exercises && post.exercises.length > 0 && (
        <ul className="space-y-1.5 rounded-2xl border border-border px-3 py-2.5">
          {post.exercises.slice(0, 4).map((ex) => (
            <li
              key={ex.name}
              className="flex items-baseline justify-between gap-2 text-sm"
            >
              <span className="font-medium">{ex.name}</span>
              <span className="shrink-0 text-xs text-muted">
                {ex.sets} sets
                {ex.reps != null ? ` · ${ex.reps} reps` : ""}
                {ex.weightKg != null ? ` · ${ex.weightKg} kg` : ""}
              </span>
            </li>
          ))}
          {post.exercises.length > 4 && (
            <li className="text-xs text-muted">
              +{post.exercises.length - 4} more exercises
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function CommentPreview({ postId }: { postId: string }) {
  const { commentsFor, tick } = usePosts();
  const { getCard } = useSocial();
  void tick;
  const comments = commentsFor(postId)
    .filter((c) => !c.parentId)
    .slice(-2);
  if (comments.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5 border-t border-border pt-3">
      {comments.map((c) => {
        const a = getCard(c.authorId);
        const uname = a?.profile.username ?? "athlete";
        return (
          <p key={c.id} className="line-clamp-2 text-xs leading-relaxed">
            <Link
              href={`/social/u/${uname}`}
              className="font-semibold text-foreground"
            >
              @{uname}
            </Link>{" "}
            <span className="text-muted">{c.body}</span>
          </p>
        );
      })}
    </div>
  );
}

export function PostCard({
  post,
  compact = false,
}: {
  post: WorkoutPost;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const { getCard } = useSocial();
  const { hasSaved, toggleSave } = usePosts();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const author = getCard(post.authorId);
  const name = author?.profile.displayName ?? "Athlete";
  const username = author?.profile.username ?? "athlete";
  const isSelf = user?.id === post.authorId;
  const isOutdoor = [
    "running",
    "walking",
    "cycling",
    "hiking",
    "sports",
  ].includes(post.type);
  const hasRoute =
    (post.routePreview?.length ?? 0) > 1 || (post.route?.length ?? 0) > 1;
  const mapPoints = post.routePreview ?? post.route;
  const saved = hasSaved(post.id);

  return (
    <article className="overflow-hidden rounded-apex-lg border border-border bg-card shadow-apex">
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Link href={`/social/u/${username}`} className="shrink-0">
            <SocialAvatar name={name} size="sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/social/u/${username}`}
                className="font-display text-sm font-semibold hover:text-accent-dim dark:hover:text-accent"
              >
                {name}
              </Link>
              <span className="text-xs text-muted">@{username}</span>
              <Badge className="capitalize">{post.type}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <VisibilityIcon v={post.visibility} />
              </span>
            </div>
            <p className="text-xs text-muted">{formatWhen(post.occurredAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isSelf && author && (
              <div className="hidden sm:block">
                <FollowButton card={author} />
              </div>
            )}
            <div className="relative">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
                aria-label="Options"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-border bg-card py-1 shadow-apex-lg">
                  <Link
                    href={`/posts/${post.id}`}
                    className="block px-3 py-2 text-sm hover:bg-muted-bg"
                    onClick={() => setMenuOpen(false)}
                  >
                    Open activity
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted-bg"
                    onClick={() => {
                      setMenuOpen(false);
                      setShareOpen(true);
                    }}
                  >
                    Share activity…
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Link href={`/posts/${post.id}`} className="mt-3 block">
          <h3 className="font-display text-lg font-bold tracking-tight">
            {post.title}
          </h3>
          {post.caption ? (
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {post.caption}
            </p>
          ) : null}
          {post.locationName && (
            <p className="mt-1 text-xs text-muted">{post.locationName}</p>
          )}
        </Link>
      </div>

      {isOutdoor && hasRoute && (
        <div className="mt-3 px-4">
          <RouteMapPreview
            points={mapPoints}
            hideStart={post.hideStart}
            hideEnd={post.hideEnd}
            routeVisible={post.routeVisible !== false}
            href={`/posts/${post.id}`}
            height={compact ? 140 : 188}
          />
        </div>
      )}

      <div className="px-4">
        {post.type === "gym" ? (
          <GymBody post={post} />
        ) : isOutdoor || post.distanceKm != null || post.durationMin != null ? (
          <OutdoorStats post={post} />
        ) : post.durationMin != null ? (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted-bg px-2 py-3">
            <StatCell
              label="Duration"
              value={formatDurationClock(post.durationMin)}
            />
            {post.caloriesBurned != null && (
              <StatCell label="Calories" value={String(post.caloriesBurned)} />
            )}
          </div>
        ) : null}

        {post.achievements && post.achievements.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.achievements.map((a) => (
              <Badge key={a.id} variant="success">
                {a.label}
              </Badge>
            ))}
          </div>
        )}

        {(post.photoUrl || (post.photos && post.photos[0])) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.photos?.[0] ?? post.photoUrl}
            alt=""
            className="mt-3 max-h-80 w-full rounded-2xl object-cover"
          />
        )}

        <CommentPreview postId={post.id} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border px-2 py-1">
        <div className="flex items-center gap-1">
          <LikeButton postId={post.id} likesCount={post.likesCount} />
          <Link
            href={`/posts/${post.id}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <MessageCircle size={18} />
            {post.commentsCount}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-foreground"
            aria-label="Share"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center ${
              saved ? "text-accent" : "text-muted hover:text-foreground"
            }`}
            aria-label="Save"
            aria-pressed={saved}
            onClick={() => {
              const res = toggleSave(post.id);
              toast(
                res.saved ? "Saved to your list." : "Removed from saved.",
                "info",
              );
            }}
          >
            <Bookmark
              size={18}
              className={saved ? "fill-accent text-accent" : ""}
              strokeWidth={saved ? 0 : 2}
            />
          </button>
        </div>
      </div>

      <ShareActivitySheet
        post={post}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </article>
  );
}

export function FeedList({
  posts,
  emptyTitle,
  emptyHint,
  emptyAction,
}: {
  posts: WorkoutPost[];
  emptyTitle: string;
  emptyHint: string;
  emptyAction?: React.ReactNode;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-14 text-center">
        <p className="font-display font-semibold">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted">{emptyHint}</p>
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-apex-lg bg-muted-bg"
        />
      ))}
    </div>
  );
}

export function ComposeBar() {
  return (
    <Link
      href="/posts/new"
      className="flex min-h-14 items-center gap-3 rounded-apex-lg border border-border bg-card p-4 shadow-apex transition hover:border-accent/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent-dim dark:text-accent">
        +
      </div>
      <div>
        <p className="text-sm font-medium">Share a workout</p>
        <p className="text-xs text-muted">
          Run, gym, ride — publish a visual activity summary
        </p>
      </div>
    </Link>
  );
}
