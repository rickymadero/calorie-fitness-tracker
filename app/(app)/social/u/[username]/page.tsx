"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  MapPin,
  AtSign,
  ShieldBan,
  Flag,
  UserMinus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
        <Link href="/social/discover" className="mt-4 inline-block">
          <Button>Discover people</Button>
        </Link>
      </div>
    );
  }

  const { profile, followersCount, followingCount, relation, limited } = card;
  const isSelf = user?.id === profile.userId;
  const isBlocked = relation === "blocked";

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
    <div>
      <Card>
        <div className="flex flex-wrap gap-5">
          <SocialAvatar name={profile.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {profile.displayName}
              </h1>
              {profile.visibility === "private" && (
                <Lock size={16} className="text-muted" />
              )}
              {isSelf && <Badge variant="accent">You</Badge>}
            </div>
            <p className="text-muted">@{profile.username}</p>

            {!limited && (
              <>
                {profile.bio && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
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
                      <AtSign size={14} />
                      @{profile.instagramUsername}
                    </a>
                  ) : null}
                </div>
              </>
            )}

            {limited && (
              <div className="mt-4 rounded-2xl bg-muted-bg p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lock size={14} />
                  This account is private
                </p>
                <p className="mt-1 text-xs text-muted">
                  Follow to see their full profile, stats, and activities.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link
                href={`/social/u/${profile.username}/followers`}
                className="hover:text-accent-dim dark:hover:text-accent"
              >
                <span className="font-semibold">{limited ? "—" : followersCount}</span>{" "}
                <span className="text-muted">followers</span>
              </Link>
              <Link
                href={`/social/u/${profile.username}/following`}
                className="hover:text-accent-dim dark:hover:text-accent"
              >
                <span className="font-semibold">{limited ? "—" : followingCount}</span>{" "}
                <span className="text-muted">following</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isSelf ? (
              <Link href="/profile">
                <Button variant="secondary">Edit social profile</Button>
              </Link>
            ) : (
              <>
                <FollowButton card={card} />
                {relation === "follows_you" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removeFollower(profile.userId);
                      toast("Removed from your followers.", "info");
                    }}
                  >
                    <UserMinus size={14} />
                    Remove follower
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    blockUser(profile.userId);
                    toast("User blocked.", "info");
                  }}
                >
                  <ShieldBan size={14} />
                  Block
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    toast(
                      "Report received. Our team will review (demo).",
                      "success",
                    )
                  }
                >
                  <Flag size={14} />
                  Report
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {!limited && (
        <>
          {(profile.fitnessGoals.length > 0 ||
            profile.favoriteWorkouts.length > 0) && (
            <Card className="mt-4">
              {profile.fitnessGoals.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted">Goals</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.fitnessGoals.map((g) => (
                      <Badge key={g}>{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.favoriteWorkouts.length > 0 && (
                <div className={profile.fitnessGoals.length ? "mt-4" : ""}>
                  <h2 className="text-sm font-medium text-muted">Workouts</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.favoriteWorkouts.map((w) => (
                      <Badge key={w} variant="accent" className="capitalize">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "This month",
                value: liveStats?.workoutsThisMonth ?? profile.stats.workoutsCompleted,
              },
              {
                label: "Distance",
                value: `${(liveStats?.totalKm ?? profile.stats.totalRunKm).toFixed(0)} km`,
              },
              {
                label: "Streak",
                value: `${liveStats?.streakDays ?? 0} days`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-apex-lg border border-border bg-card p-4 shadow-apex"
              >
                <p className="text-xs text-muted">{stat.label}</p>
                <p className="mt-1 font-display text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
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
    </div>
  );
}
