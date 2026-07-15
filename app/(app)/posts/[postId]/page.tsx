"use client";

import { use, useMemo } from "react";
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
import {
  formatDurationClock,
  formatPace,
} from "@/lib/geo/routes";
import { useState } from "react";

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
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  const post = useMemo(() => {
    void tick;
    return getPost(postId);
  }, [tick, postId, getPost]);

  if (!post) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">Post not found</p>
        <p className="mt-1 text-sm text-muted">
          It may be private or was deleted.
        </p>
        <Link href="/feed" className="mt-4 inline-block">
          <Button>Back to Feed</Button>
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
      label: "Distance",
      value: `${post.distanceKm.toFixed(2)} km`,
    });
  }
  if (post.durationMin != null) {
    detailStats.push({
      label: "Elapsed",
      value: formatDurationClock(post.durationMin),
    });
  }
  if (post.movingTimeMin != null) {
    detailStats.push({
      label: "Moving",
      value: formatDurationClock(post.movingTimeMin),
    });
  }
  const pace = formatPace(post.paceMinPerKm);
  if (pace) detailStats.push({ label: "Avg pace", value: pace });
  const best = formatPace(post.fastestPaceMinPerKm);
  if (best) detailStats.push({ label: "Best pace", value: best });
  if (post.avgSpeedKmh != null) {
    detailStats.push({
      label: "Avg speed",
      value: `${post.avgSpeedKmh.toFixed(1)} km/h`,
    });
  }
  if (post.maxSpeedKmh != null) {
    detailStats.push({
      label: "Max speed",
      value: `${post.maxSpeedKmh.toFixed(1)} km/h`,
    });
  }
  if (post.caloriesBurned != null) {
    detailStats.push({ label: "Calories", value: String(post.caloriesBurned) });
  }
  if (post.elevationGainM != null) {
    detailStats.push({
      label: "Elev gain",
      value: `${post.elevationGainM} m`,
    });
  }
  if (post.avgHeartRate != null) {
    detailStats.push({ label: "Avg HR", value: `${post.avgHeartRate} bpm` });
  }
  if (post.maxHeartRate != null) {
    detailStats.push({ label: "Max HR", value: `${post.maxHeartRate} bpm` });
  }
  if (post.cadence != null) {
    detailStats.push({ label: "Cadence", value: `${post.cadence} spm` });
  }
  if (post.totalVolumeKg != null) {
    detailStats.push({
      label: "Volume",
      value: `${post.totalVolumeKg.toLocaleString()} kg`,
    });
  }

  return (
    <div className="mx-auto max-w-[390px] lg:max-w-2xl">
      <div className="sticky top-0 z-30 -mx-5 mb-4 flex items-center justify-between gap-2 border-b border-border/70 bg-background/85 px-5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur-xl">
        <Link
          href="/feed"
          className="evolve-press inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ChevronLeft size={18} />
          Feed
        </Link>
        <div className="flex items-center justify-end gap-0.5">
          <Button size="sm" variant="ghost" onClick={() => setShareOpen(true)}>
            <Share2 size={14} />
            <span className="sr-only sm:not-sr-only sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const res = toggleSave(post.id);
              toast(
                res.saved ? "Saved." : "Removed from saved.",
                "info",
              );
            }}
          >
            <Bookmark
              size={14}
              className={saved ? "fill-accent text-accent" : ""}
            />
            <span className="sr-only sm:not-sr-only sm:inline">
              {saved ? "Saved" : "Save"}
            </span>
          </Button>
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (deletePost(post.id)) {
                  toast("Post deleted.", "info");
                  router.push("/feed");
                }
              }}
            >
              <Trash2 size={14} />
              <span className="sr-only sm:not-sr-only sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Full activity summary (map shown once in Route card below) */}
      <PostCard post={post} hideMap={hasFullMap} />

      {hasFullMap && (
        <Card className="mt-4 overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Route</h2>
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
          <h2 className="font-display text-lg font-semibold">Statistics</h2>
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
          <h2 className="font-display text-lg font-semibold">Splits</h2>
          <ul className="mt-3 space-y-2">
            {post.splits.map((sp) => (
              <li
                key={sp.km}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted">Kilometer {sp.km}</span>
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
          <h2 className="font-display text-lg font-semibold">Exercises</h2>
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
          <h2 className="font-display text-lg font-semibold">Achievements</h2>
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
          <h2 className="font-display text-lg font-semibold">Comments</h2>
          <LikeButton postId={post.id} likesCount={post.likesCount} />
        </div>
        {post.commentsEnabled === false ? (
          <p className="text-sm text-muted">Comments are turned off.</p>
        ) : (
          <CommentThread postId={post.id} postAuthorId={post.authorId} />
        )}
      </Card>

      {author && (
        <p className="mt-4 text-center text-sm text-muted">
          More from{" "}
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
