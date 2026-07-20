"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Share2, Bookmark, ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { LikeButton, PostCard } from "@/components/feed/FeedComponents";
import { RouteMapPreview } from "@/components/feed/RouteMapPreview";
import { ShareActivitySheet } from "@/components/feed/ShareActivitySheet";
import { CommentThread } from "@/components/posts/CommentThread";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  formatDurationClock,
  formatPace,
} from "@/lib/geo/routes";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const { user } = useAuth();
  const { tick, getPost, deletePost, hasSaved, toggleSave } = usePosts();
  const { getCard } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "posts", "feed"]);
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  const post = useMemo(() => {
    void tick;
    return getPost(postId);
  }, [tick, postId, getPost]);

  if (!post) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">
          {t("notFound", { ns: "posts" })}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t("notFoundHint", { ns: "posts" })}
        </p>
        <Link href="/feed" className="mt-4 inline-block">
          <Button>{t("backToFeed", { ns: "posts" })}</Button>
        </Link>
      </div>
    );
  }

  const author = getCard(post.authorId);
  const isOwner = user?.id === post.authorId;
  const saved = hasSaved(post.id);
  const fullRoute = post.route ?? post.routePreview;
  const hasFullMap = (fullRoute?.length ?? 0) > 1;

  const detailStats: { label: string; value: string }[] = [];
  if (post.distanceKm != null) {
    detailStats.push({
      label: t("stats.distance", { ns: "feed" }),
      value: `${post.distanceKm.toFixed(2)} km`,
    });
  }
  if (post.durationMin != null) {
    detailStats.push({
      label: t("statsExtra.elapsed", { ns: "posts" }),
      value: formatDurationClock(post.durationMin),
    });
  }
  if (post.movingTimeMin != null) {
    detailStats.push({
      label: t("statsExtra.moving", { ns: "posts" }),
      value: formatDurationClock(post.movingTimeMin),
    });
  }
  const pace = formatPace(post.paceMinPerKm);
  if (pace) {
    detailStats.push({
      label: t("stats.avgPace", { ns: "feed" }),
      value: pace,
    });
  }
  const best = formatPace(post.fastestPaceMinPerKm);
  if (best) {
    detailStats.push({
      label: t("statsExtra.bestPace", { ns: "posts" }),
      value: best,
    });
  }
  if (post.avgSpeedKmh != null) {
    detailStats.push({
      label: t("stats.avgSpeed", { ns: "feed" }),
      value: `${post.avgSpeedKmh.toFixed(1)} km/h`,
    });
  }
  if (post.maxSpeedKmh != null) {
    detailStats.push({
      label: t("statsExtra.maxSpeed", { ns: "posts" }),
      value: `${post.maxSpeedKmh.toFixed(1)} km/h`,
    });
  }
  if (post.caloriesBurned != null) {
    detailStats.push({
      label: t("stats.calories", { ns: "feed" }),
      value: String(post.caloriesBurned),
    });
  }
  if (post.elevationGainM != null) {
    detailStats.push({
      label: t("stats.elevGain", { ns: "feed" }),
      value: `${post.elevationGainM} m`,
    });
  }
  if (post.avgHeartRate != null) {
    detailStats.push({
      label: t("statsExtra.avgHr", { ns: "posts" }),
      value: `${post.avgHeartRate} bpm`,
    });
  }
  if (post.maxHeartRate != null) {
    detailStats.push({
      label: t("statsExtra.maxHr", { ns: "posts" }),
      value: `${post.maxHeartRate} bpm`,
    });
  }
  if (post.cadence != null) {
    detailStats.push({
      label: t("statsExtra.cadence", { ns: "posts" }),
      value: `${post.cadence} spm`,
    });
  }
  if (post.totalVolumeKg != null) {
    detailStats.push({
      label: t("stats.volume", { ns: "feed" }),
      value: `${post.totalVolumeKg.toLocaleString()} kg`,
    });
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-full lg:max-w-2xl">
      <div className="sticky top-0 z-30 mb-4 flex items-center justify-between gap-2 border-b border-border/70 bg-background/90 pb-2 pt-1 backdrop-blur-xl">
        <Link
          href="/feed"
          className="evolve-press inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ChevronLeft size={18} />
          {t("nav.feed")}
        </Link>
        <div className="flex items-center justify-end gap-0.5">
          <Button size="sm" variant="ghost" onClick={() => setShareOpen(true)}>
            <Share2 size={14} />
            <span className="sr-only sm:not-sr-only sm:inline">
              {t("buttons.share")}
            </span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const res = toggleSave(post.id);
              toast(
                res.saved
                  ? t("saved", { ns: "posts" })
                  : t("unsavedToast", { ns: "feed" }),
                "info",
              );
            }}
          >
            <Bookmark
              size={14}
              className={saved ? "fill-accent text-accent" : ""}
            />
            <span className="sr-only sm:not-sr-only sm:inline">
              {saved ? t("saved", { ns: "posts" }) : t("save", { ns: "posts" })}
            </span>
          </Button>
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (deletePost(post.id)) {
                  toast(t("toast.deleted", { ns: "posts" }), "info");
                  router.push("/feed");
                }
              }}
            >
              <Trash2 size={14} />
              <span className="sr-only sm:not-sr-only sm:inline">
                {t("buttons.delete")}
              </span>
            </Button>
          )}
        </div>
      </div>

      <PostCard post={post} hideMap={hasFullMap} />

      {hasFullMap && (
        <Card className="mt-4 overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">
              {t("section.route", { ns: "posts" })}
            </h2>
            {post.locationName && (
              <p className="text-xs text-muted">{post.locationName}</p>
            )}
          </div>
          <div className="p-3">
            <RouteMapPreview
              points={fullRoute}
              hideStart={post.hideStart}
              hideEnd={post.hideEnd}
              routeVisible={post.routeVisible !== false}
              height={240}
              interactive={false}
            />
          </div>
        </Card>
      )}

      {detailStats.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-semibold">
            {t("section.stats", { ns: "posts" })}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {detailStats.map((s) => (
              <div key={s.label} className="evolve-stats-vivid rounded-2xl p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {s.label}
                </p>
                <p className="mt-1 font-display text-base font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {post.splits && post.splits.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-semibold">
            {t("section.splits", { ns: "posts" })}
          </h2>
          <ul className="mt-3 space-y-2">
            {post.splits.map((sp) => (
              <li
                key={sp.km}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted">
                  {t("kilometer", { ns: "posts", n: sp.km })}
                </span>
                <span className="font-medium">
                  {formatPace(sp.paceMinPerKm)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {post.exercises && post.exercises.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-semibold">
            {t("section.exercises", { ns: "posts" })}
          </h2>
          {post.muscleGroups && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.muscleGroups.map((m) => (
                <Badge key={m} variant="accent">
                  {m}
                </Badge>
              ))}
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {post.exercises.map((ex) => (
              <li
                key={ex.name}
                className="flex justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
              >
                <span className="font-medium">{ex.name}</span>
                <span className="text-muted">
                  {ex.sets}×{ex.reps ?? "—"}
                  {ex.weightKg != null ? ` @ ${ex.weightKg} kg` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {post.achievements && post.achievements.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-semibold">
            {t("section.achievements", { ns: "posts" })}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.achievements.map((a) => (
              <Badge key={a.id} variant="success">
                {a.label}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {t("section.comments", { ns: "posts" })}
          </h2>
          <LikeButton postId={post.id} likesCount={post.likesCount} />
        </div>
        {post.commentsEnabled === false ? (
          <p className="text-sm text-muted">
            {t("commentsOff", { ns: "posts" })}
          </p>
        ) : (
          <CommentThread postId={post.id} postAuthorId={post.authorId} />
        )}
      </Card>

      {author && (
        <p className="mt-4 text-center text-sm text-muted">
          {t("moreFrom", { ns: "posts" })}{" "}
          <Link
            href={`/social/u/${author.profile.username}`}
            className="font-medium text-accent-dim dark:text-accent"
          >
            @{author.profile.username}
          </Link>
        </p>
      )}

      <ShareActivitySheet
        post={post}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
