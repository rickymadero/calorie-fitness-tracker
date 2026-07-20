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
  EyeOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { useStories } from "@/components/stories/StoriesProvider";
import {
  FollowButton,
  SocialAvatar,
} from "@/components/social/PersonCard";
import { FeedList } from "@/components/feed/FeedComponents";
import { ProfilePrList } from "@/components/social/ProfilePrs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

type ProfileTab = "workouts" | "prs";

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
  const {
    tick: storiesTick,
    hideStoryFrom,
    unhideStoryFrom,
    isStoryHiddenFrom,
  } = useStories();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "social", "profile"]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tab, setTab] = useState<ProfileTab>("workouts");

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
        <p className="font-display text-lg font-semibold">
          {t("social:userNotFound")}
        </p>
        <p className="mt-1 text-sm text-muted">{t("social:userNotFoundHint")}</p>
        <Link href="/explore" className="mt-4 inline-block">
          <Button>{t("common:buttons.explore")}</Button>
        </Link>
      </div>
    );
  }

  const { profile, followersCount, followingCount, relation, limited } = card;
  const isSelf = user?.id === profile.userId;
  const isBlocked = relation === "blocked";
  const postCount = limited ? 0 : posts.length;
  void storiesTick;
  const storyHiddenFromThem = isStoryHiddenFrom(profile.userId);

  if (isBlocked) {
    return (
      <div className="rounded-apex-lg border border-border bg-card px-6 py-16 text-center shadow-apex">
        <ShieldBan className="mx-auto text-muted" size={32} />
        <p className="mt-3 font-display text-lg font-semibold">
          {t("social:unavailable")}
        </p>
        <p className="mt-1 text-sm text-muted">{t("social:cantViewProfile")}</p>
        {blockedByMe && (
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              unblockUser(profile.userId);
              toast(t("social:unblocked"), "info");
            }}
          >
            {t("common:buttons.unblock")}
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
          {t("common:buttons.back")}
        </Link>
        {!isSelf && (
          <button
            type="button"
            className="evolve-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label={t("common:menu.moreOptions")}
            onClick={() => setMoreOpen(true)}
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Identity: avatar + count strip */}
      <div className="flex items-center gap-4">
        <SocialAvatar
          name={profile.displayName}
          size="lg"
          src={profile.avatarUrl || undefined}
        />
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 text-center">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : postCount}
            </p>
            <p className="text-[11px] text-muted">{t("common:labels.posts")}</p>
          </div>
          <Link
            href={`/social/u/${profile.username}/followers`}
            className="min-w-0 hover:text-accent"
          >
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : followersCount}
            </p>
            <p className="text-[11px] text-muted">
              {t("common:labels.followers")}
            </p>
          </Link>
          <Link
            href={`/social/u/${profile.username}/following`}
            className="min-w-0 hover:text-accent"
          >
            <p className="font-display text-lg font-bold tabular-nums leading-tight">
              {limited ? "—" : followingCount}
            </p>
            <p className="text-[11px] text-muted">
              {t("common:labels.following")}
            </p>
          </Link>
        </div>
      </div>

      {/* Name / bio full width — never place CTAs beside the name */}
      <div className="mt-3 min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate font-display text-base font-bold">
            {profile.displayName}
          </h1>
          {!limited && (
            <CountryFlag code={profile.countryCode} size="md" />
          )}
          {profile.visibility === "private" && (
            <Lock size={14} className="shrink-0 text-muted" />
          )}
          {isSelf && <Badge variant="accent">{t("common:labels.you")}</Badge>}
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
              {t("social:privateAccount")}
            </p>
            <p className="mt-1 text-xs text-muted">{t("social:privateHint")}</p>
          </div>
        )}
      </div>

      {/* Primary actions — full width row under identity */}
      <div className="mt-3">
        {isSelf ? (
          <Link href="/profile" className="block">
            <Button variant="secondary" fullWidth size="sm">
              {t("profile:edit")}
            </Button>
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FollowButton card={card} fullWidth />
            <Link href={`/messages/${profile.userId}`} className="min-w-0">
              <Button size="sm" variant="secondary" fullWidth>
                {t("social:message")}
              </Button>
            </Link>
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
                    {t("social:goals")}
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
                    {t("social:favoriteWorkouts")}
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
                label: t("profile:statMonth"),
                value:
                  liveStats?.workoutsThisMonth ??
                  profile.stats.workoutsCompleted,
              },
              {
                label: t("profile:statDistance"),
                value: `${(liveStats?.totalKm ?? profile.stats.totalRunKm).toFixed(0)} km`,
              },
              {
                label: t("profile:statStreak"),
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

          <div className="mt-5">
            <SegmentedControl
              segments={[
                {
                  id: "workouts",
                  label: `${t("profile:tabWorkouts")} · ${postCount}`,
                },
                {
                  id: "prs",
                  label: `${t("profile:tabPrs")} · ${profile.personalRecords?.length ?? 0}`,
                },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>

          <div className="mt-5 min-w-0">
            {tab === "workouts" ? (
              <>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  {t("profile:recentWorkouts")}
                </h2>
                <FeedList
                  posts={posts}
                  emptyTitle={t("social:emptyPublished")}
                  emptyHint={t("social:emptyPublishedHint")}
                />
              </>
            ) : (
              <ProfilePrList
                records={profile.personalRecords ?? []}
                canEdit={isSelf}
              />
            )}
          </div>
        </>
      )}

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t("social:options")}
      >
        <div className="grid gap-2">
          {relation === "follows_you" && (
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                removeFollower(profile.userId);
                toast(t("social:removedFollower"), "info");
                setMoreOpen(false);
              }}
            >
              <UserMinus size={16} />
              {t("social:removeFollower")}
            </Button>
          )}
          {!isSelf && (
            <Button
              fullWidth
              variant="outline"
              onClick={() => {
                if (storyHiddenFromThem) {
                  unhideStoryFrom(profile.userId);
                  toast(t("social:storyVisibleAgain"), "info");
                } else {
                  hideStoryFrom(profile.userId);
                  toast(t("social:storyHidden"), "info");
                }
                setMoreOpen(false);
              }}
            >
              {storyHiddenFromThem ? (
                <>
                  <Eye size={16} />
                  {t("social:unhideStory")}
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  {t("social:hideStory")}
                </>
              )}
            </Button>
          )}
          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              blockUser(profile.userId);
              toast(t("social:blocked"), "info");
              setMoreOpen(false);
            }}
          >
            <ShieldBan size={16} />
            {t("social:block")}
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              toast(t("social:reportReceived"), "success");
              setMoreOpen(false);
            }}
          >
            <Flag size={16} />
            {t("social:report")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
