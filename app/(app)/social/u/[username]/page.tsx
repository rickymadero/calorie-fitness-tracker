"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Lock,
  MapPin,
  AtSign,
  ShieldBan,
  Flag,
  UserMinus,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import {
  FollowButton,
  SocialAvatar,
} from "@/components/social/PersonCard";
import { FeedList } from "@/components/feed/FeedComponents";
import { useToast } from "@/components/providers/ToastProvider";

export default function SocialUserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { user } = useAuth();
  const {
    ready,
    getCardByUsername,
    blockUser,
    unblockUser,
    removeFollower,
    iBlocked,
  } = useSocial();
  const { tick, postsByAuthor, authorStats } = usePosts();
  const { toast } = useToast();
  const [moreOpen, setMoreOpen] = useState(false);

  const card = useMemo(() => {
    if (!ready) return null;
    return getCardByUsername(username);
  }, [ready, username, getCardByUsername]);

  const blockedByMe = useMemo(() => {
    if (!ready || !card) return false;
    return iBlocked(card.profile.userId);
  }, [ready, card, iBlocked]);

  const posts = useMemo(() => {
    void tick;
    if (!card || card.limited) return [];
    return postsByAuthor(card.profile.userId, 20);
  }, [tick, card, postsByAuthor]);

  const liveStats = useMemo(() => {
    void tick;
    if (!card || card.limited) return null;
    return authorStats(card.profile.userId);
  }, [tick, card, authorStats]);

  if (!ready) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-apex-lg bg-muted-bg" />
        <div className="h-40 animate-pulse rounded-apex-lg bg-muted-bg" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">User not found</p>
        <p className="mt-1 text-sm text-muted">
          That username doesn&apos;t exist on Evolve Social.
        </p>
        <Link href="/explore" className="mt-4 inline-block">
          <Button>Explore</Button>
        </Link>
      </div>
    );
  }

  const { profile, followersCount, followingCount, relation, limited } = card;
  const isSelf = user?.id === profile.userId;
  const isBlocked = relation === "blocked";
  const postCount = limited ? 0 : posts.length;

  if (isBlocked) {
    return (
      <div className="rounded-apex-lg border border-border bg-card px-6 py-16 text-center shadow-apex">
        <ShieldBan className="mx-auto text-muted" size={32} />
        <p className="mt-3 font-display text-lg font-semibold">Unavailable</p>
        <p className="mt-1 text-sm text-muted">
          You can&apos;t view this profile.
        </p>
        {blockedByMe && (
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              unblockUser(profile.userId);
              toast("User unblocked.", "info");
            }}
          >
            Unblock
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href="/feed"
          className="evolve-press inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ChevronLeft size={18} />
          Back
        </Link>
        {!isSelf && (
          <button
            type="button"
            className="evolve-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label="More options"
            onClick={() => setMoreOpen(true)}
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Identity: avatar + count strip */}
      <div className="flex items-center gap-4">
        <SocialAvatar name={profile.displayName} size="lg" />
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 text-center">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : postCount}
            </p>
            <p className="text-[11px] text-muted">posts</p>
          </div>
          <Link
            href={`/social/u/${profile.username}/followers`}
            className="min-w-0 hover:text-accent"
          >
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : followersCount}
            </p>
            <p className="text-[11px] text-muted">followers</p>
          </Link>
          <Link
            href={`/social/u/${profile.username}/following`}
            className="min-w-0 hover:text-accent"
          >
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : followingCount}
            </p>
            <p className="text-[11px] text-muted">following</p>
          </Link>
        </div>
      </div>

      {/* Name / bio full width — never place CTAs beside the name */}
      <div className="mt-3 min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate font-display text-base font-bold">
            {profile.displayName}
          </h1>
          {profile.visibility === "private" && (
            <Lock size={14} className="shrink-0 text-muted" />
          )}
          {isSelf && <Badge variant="accent">You</Badge>}
        </div>
        <p className="truncate text-sm text-muted">@{profile.username}</p>

        {!limited && profile.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {profile.bio}
          </p>
        ) : null}

        {!limited && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            {profile.showLocation && profile.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} />
                {profile.location}
              </span>
            ) : null}
            {profile.showInstagram && profile.instagramUsername ? (
              <a
                href={`https://instagram.com/${profile.instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent-dim dark:text-accent"
              >
                <AtSign size={14} />@{profile.instagramUsername}
              </a>
            ) : null}
          </div>
        )}

        {limited && (
          <div className="mt-3 rounded-2xl bg-muted-bg p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lock size={14} />
              Private account
            </p>
            <p className="mt-1 text-xs text-muted">
              Follow to see their workouts and full profile.
            </p>
          </div>
        )}
      </div>

      {/* Primary actions — full width row under identity */}
      <div className="mt-3">
        {isSelf ? (
          <Link href="/profile" className="block">
            <Button variant="secondary" fullWidth size="sm">
              Edit profile
            </Button>
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FollowButton card={card} fullWidth />
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={() => setMoreOpen(true)}
            >
              More
            </Button>
          </div>
        )}
      </div>

      {!limited && (
        <>
          {(profile.fitnessGoals.length > 0 ||
            profile.favoriteWorkouts.length > 0) && (
            <div className="mt-4 min-w-0 space-y-3">
              {profile.fitnessGoals.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
                    Goals
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.fitnessGoals.map((g) => (
                      <Badge key={g}>{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.favoriteWorkouts.length > 0 && (
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
                    Workouts
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.favoriteWorkouts.map((w) => (
                      <Badge key={w} variant="accent" className="capitalize">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compact 3-col stats — not stacked full cards */}
          <div className="evolve-stats-vivid mt-4 grid grid-cols-3 gap-1 rounded-2xl px-2 py-3 text-center">
            {[
              {
                label: "Month",
                value:
                  liveStats?.workoutsThisMonth ??
                  profile.stats.workoutsCompleted,
              },
              {
                label: "Distance",
                value: `${(liveStats?.totalKm ?? profile.stats.totalRunKm).toFixed(0)} km`,
              },
              {
                label: "Streak",
                value: `${liveStats?.streakDays ?? 0}d`,
              },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 px-1">
                <p className="truncate font-display text-base font-bold">
                  {stat.value}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 min-w-0">
            <h2 className="mb-3 font-display text-lg font-semibold">
              Recent workouts
            </h2>
            <FeedList
              posts={posts}
              emptyTitle="No published workouts yet"
              emptyHint="When they share sessions, they appear here."
            />
          </div>
        </>
      )}

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Options">
        <div className="grid gap-2">
          {relation === "follows_you" && (
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                removeFollower(profile.userId);
                toast("Removed from your followers.", "info");
                setMoreOpen(false);
              }}
            >
              <UserMinus size={16} />
              Remove follower
            </Button>
          )}
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              blockUser(profile.userId);
              toast("User blocked.", "info");
              setMoreOpen(false);
            }}
          >
            <ShieldBan size={16} />
            Block
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              toast("Report received. Our team will review (demo).", "success");
              setMoreOpen(false);
            }}
          >
            <Flag size={16} />
            Report
          </Button>
        </div>
      </Modal>
    </div>
  );
}
