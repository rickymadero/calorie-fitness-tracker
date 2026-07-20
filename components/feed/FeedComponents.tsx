"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Lock,
  Users,
  Globe,
  MapPin,
  Activity,
} from "lucide-react";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar, FollowButton } from "@/components/social/PersonCard";
import { Badge } from "@/components/ui/Badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { EmptyState } from "@/components/ui/EmptyState";
import { RouteMapPreview } from "@/components/feed/RouteMapPreview";
import { ShareActivitySheet } from "@/components/feed/ShareActivitySheet";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  formatDurationClock,
  formatPace,
} from "@/lib/geo/routes";
import { ACTIVITY_COLORS } from "@/lib/colors/vivid";
import { feedItem, feedStagger, tapScale } from "@/lib/motion";
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
  const reduce = useReducedMotion();
  // Spring transitions only allow 2 keyframes — never use [1, 1.x, 1] arrays.
  const [pulse, setPulse] = useState(false);

  return (
    <motion.button
      type="button"
      whileTap={reduce ? undefined : tapScale}
      animate={{ scale: pulse && !reduce ? 1.18 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      onAnimationComplete={() => setPulse(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const res = toggleLike(postId);
        if (res.liked && !reduce) setPulse(true);
      }}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
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
    </motion.button>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <p className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}

function OutdoorStats({ post }: { post: WorkoutPost }) {
  const { t } = useAppTranslation("feed");
  const pace = formatPace(post.paceMinPerKm);
  const cells: { label: string; value: string }[] = [];
  if (post.distanceKm != null && Number.isFinite(post.distanceKm)) {
    cells.push({
      label: t("stats.distance"),
      value: `${post.distanceKm.toFixed(2)} km`,
    });
  }
  if (post.durationMin != null) {
    cells.push({
      label: t("stats.time"),
      value: formatDurationClock(post.durationMin),
    });
  }
  if (pace) cells.push({ label: t("stats.avgPace"), value: pace });
  if (post.caloriesBurned != null) {
    cells.push({ label: t("stats.calories"), value: `${post.caloriesBurned}` });
  } else if (post.elevationGainM != null) {
    cells.push({
      label: t("stats.elevGain"),
      value: `${post.elevationGainM} m`,
    });
  } else if (post.avgSpeedKmh != null) {
    cells.push({
      label: t("stats.avgSpeed"),
      value: `${post.avgSpeedKmh.toFixed(1)} km/h`,
    });
  }
  return (
    <div
      className={`evolve-stats-vivid mt-3 grid gap-2 rounded-2xl px-2 py-3 ${
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
  const { t } = useAppTranslation("feed");
  return (
    <div className="mt-3 space-y-3">
      {post.muscleGroups && post.muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.muscleGroups.map((m) => (
            <Badge key={m} variant="steel">
              {m}
            </Badge>
          ))}
        </div>
      )}
      <div
        className="evolve-stats-vivid grid gap-2 rounded-2xl px-2 py-3"
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
          <StatCell
            label={t("stats.duration")}
            value={`${post.durationMin} min`}
          />
        )}
        {post.exerciseCount != null && (
          <StatCell
            label={t("stats.exercises")}
            value={String(post.exerciseCount)}
          />
        )}
        {post.totalSets != null && (
          <StatCell label={t("stats.sets")} value={String(post.totalSets)} />
        )}
        {post.totalVolumeKg != null ? (
          <StatCell
            label={t("stats.volume")}
            value={`${post.totalVolumeKg.toLocaleString()} kg`}
          />
        ) : post.caloriesBurned != null ? (
          <StatCell
            label={t("stats.calories")}
            value={String(post.caloriesBurned)}
          />
        ) : null}
      </div>
      {post.exercises && post.exercises.length > 0 && (
        <ul className="space-y-1.5 rounded-2xl border border-border px-3 py-2.5">
          {post.exercises.slice(0, 4).map((ex) => (
            <li
              key={ex.name}
              className="flex items-baseline justify-between gap-2 text-sm"
            >
              <span className="min-w-0 truncate font-medium">{ex.name}</span>
              <span className="shrink-0 text-xs text-muted">
                {t("setsLabel", { n: ex.sets })}
                {ex.reps != null ? ` · ${ex.reps} reps` : ""}
                {ex.weightKg != null ? ` · ${ex.weightKg} kg` : ""}
              </span>
            </li>
          ))}
          {post.exercises.length > 4 && (
            <li className="text-xs text-muted">
              {t("moreExercises", { n: post.exercises.length - 4 })}
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
  hideMap = false,
}: {
  post: WorkoutPost;
  compact?: boolean;
  hideMap?: boolean;
}) {
  const { user } = useAuth();
  const { getCard } = useSocial();
  const { hasSaved, toggleSave } = usePosts();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "feed", "posts"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const author = getCard(post.authorId);
  const name = author?.profile.displayName ?? t("labels.athlete");
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
    <motion.article
      layout={false}
      className="evolve-card-lift box-border w-full min-w-0 max-w-full overflow-hidden rounded-apex-lg border border-border bg-card shadow-apex"
    >
      <div className="p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/social/u/${username}`} className="shrink-0">
            <SocialAvatar name={name} size="sm" src={author?.profile.avatarUrl || undefined} />
          </Link>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center gap-1">
              <Link
                href={`/social/u/${username}`}
                className="truncate font-display text-sm font-semibold hover:text-accent-dim dark:hover:text-accent"
              >
                {name}
              </Link>
              <CountryFlag code={author?.profile.countryCode} size="sm" />
              <span className="shrink-0 text-muted">
                <VisibilityIcon v={post.visibility} />
              </span>
            </div>
            <p className="truncate text-xs text-muted">
              @{username} · {formatWhen(post.occurredAt)}
            </p>
          </div>
          {!isSelf && author ? (
            <div className="shrink-0 max-w-[40%]">
              <FollowButton card={author} compact />
            </div>
          ) : null}
          <div className="relative shrink-0">
            <button
              type="button"
              className="evolve-press inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
              aria-label={t("optionsAria", { ns: "posts" })}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-apex-lg">
                <Link
                  href={`/posts/${post.id}`}
                  className="block px-4 py-2.5 text-sm hover:bg-muted-bg"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("openActivity", { ns: "feed" })}
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-muted-bg"
                  onClick={() => {
                    setMenuOpen(false);
                    setShareOpen(true);
                  }}
                >
                  {t("shareActivity", { ns: "feed" })}
                </button>
              </div>
            )}
          </div>
        </div>

        <Link href={`/posts/${post.id}`} className="mt-3 block">
          <Badge className={`capitalize ${ACTIVITY_COLORS[post.type]?.badge ?? ""}`}>
            {post.type}
          </Badge>
          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug tracking-tight">
            {post.title}
          </h3>
          {post.caption ? (
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {post.caption}
            </p>
          ) : null}
          {post.locationName && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} />
              {post.locationName}
            </p>
          )}
        </Link>
      </div>

      {isOutdoor && hasRoute && !hideMap && (
        <div className="mt-3 w-full min-w-0 max-w-full px-3 sm:px-4">
          <RouteMapPreview
            points={mapPoints}
            hideStart={post.hideStart}
            hideEnd={post.hideEnd}
            routeVisible={post.routeVisible !== false}
            href={`/posts/${post.id}`}
            height={compact ? 140 : 168}
          />
        </div>
      )}

      <div className="min-w-0 px-3 sm:px-4">
        {post.type === "gym" ? (
          <GymBody post={post} />
        ) : isOutdoor || post.distanceKm != null || post.durationMin != null ? (
          <OutdoorStats post={post} />
        ) : post.durationMin != null ? (
          <div className="evolve-stats-vivid mt-3 grid grid-cols-2 gap-2 rounded-2xl px-2 py-3">
            <StatCell
              label={t("stats.duration", { ns: "feed" })}
              value={formatDurationClock(post.durationMin)}
            />
            {post.caloriesBurned != null && (
              <StatCell
                label={t("stats.calories", { ns: "feed" })}
                value={String(post.caloriesBurned)}
              />
            )}
          </div>
        ) : null}

        {post.achievements && post.achievements.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.achievements.map((a) => (
              <Badge key={a.id} variant="bronze">
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

        {post.videoUrl && (
          <video
            src={post.videoUrl}
            controls
            playsInline
            preload="metadata"
            className="mt-3 max-h-80 w-full rounded-2xl bg-black object-contain"
          />
        )}

        <CommentPreview postId={post.id} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border px-2 py-1">
        <div className="flex items-center gap-0.5">
          <LikeButton postId={post.id} likesCount={post.likesCount} />
          <Link
            href={`/posts/${post.id}`}
            className="evolve-press inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <MessageCircle size={18} />
            {post.commentsCount}
          </Link>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="evolve-press inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-foreground"
            aria-label={t("buttons.share")}
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center transition-transform active:scale-90 ${
              saved ? "text-accent" : "text-muted hover:text-foreground"
            }`}
            aria-label={t("save", { ns: "posts" })}
            aria-pressed={saved}
            onClick={() => {
              const res = toggleSave(post.id);
              toast(
                res.saved
                  ? t("savedToast", { ns: "feed" })
                  : t("unsavedToast", { ns: "feed" }),
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
    </motion.article>
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
  const reduce = useReducedMotion();

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Activity size={28} />}
        title={emptyTitle}
        description={emptyHint}
        action={emptyAction}
      />
    );
  }

  return (
    <motion.div
      className="grid min-w-0 max-w-full gap-4"
      variants={reduce ? undefined : feedStagger}
      initial={reduce ? false : "initial"}
      animate="animate"
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={reduce ? undefined : feedItem}
          className="min-w-0 max-w-full"
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="evolve-shimmer h-72 rounded-apex-lg bg-muted-bg"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

