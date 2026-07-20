"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageHeader } from "@/components/ui/PageHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { ProfilePrList } from "@/components/social/ProfilePrs";
import { FeedList } from "@/components/feed/FeedComponents";
import { ProfileOverflowMenu } from "@/components/profile/ProfileOverflowMenu";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

type ProfileTab = "workouts" | "prs";

export default function ProfilePage() {
  const { user } = useAuth();
  const { myProfile, ensureMyProfile, followersOf, followingOf, ready } =
    useSocial();
  const { tick, postsByAuthor, authorStats } = usePosts();
  const { t } = useAppTranslation(["common", "profile"]);
  const [tab, setTab] = useState<ProfileTab>("workouts");

  const profile = myProfile ?? (ready ? ensureMyProfile() : null);

  const posts = useMemo(() => {
    void tick;
    if (!user) return [];
    return postsByAuthor(user.id, 20);
  }, [tick, user, postsByAuthor]);

  const stats = useMemo(() => {
    void tick;
    if (!user) return null;
    return authorStats(user.id);
  }, [tick, user, authorStats]);

  const followerCount = profile ? followersOf(profile.userId).length : 0;
  const followingCount = profile ? followingOf(profile.userId).length : 0;
  const postCount = posts.length;
  const prCount = profile?.personalRecords?.length ?? 0;

  if (!user) return null;

  return (
    <div className="min-w-0 w-full">
      <PageHeader
        sticky
        titleContent={<EvolveLogo size="md" />}
        actions={<ProfileOverflowMenu />}
      />

      {profile && (
        <section className="mt-3 min-w-0">
          <div className="flex items-center gap-5">
            <SocialAvatar
              name={profile.displayName}
              size="lg"
              src={profile.avatarUrl || undefined}
            />
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 text-center">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold tabular-nums">
                  {postCount}
                </p>
                <p className="text-[11px] text-muted">{t("common:labels.posts")}</p>
              </div>
              <Link href="/network" className="min-w-0 hover:text-accent">
                <p className="font-display text-lg font-bold tabular-nums">
                  {followerCount}
                </p>
                <p className="text-[11px] text-muted">
                  {t("common:labels.followers")}
                </p>
              </Link>
              <Link href="/network" className="min-w-0 hover:text-accent">
                <p className="font-display text-lg font-bold tabular-nums">
                  {followingCount}
                </p>
                <p className="text-[11px] text-muted">
                  {t("common:labels.following")}
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-base font-bold">
                {profile.displayName}
              </h2>
              <CountryFlag code={profile.countryCode ?? user.country} size="md" />
              <Badge variant={user.plan === "pro" ? "accent" : "default"}>
                {user.plan === "pro"
                  ? t("common:labels.pro")
                  : t("common:labels.free")}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted">@{profile.username}</p>
            {profile.bio ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">{t("profile:addBio")}</p>
            )}
            {profile.showLocation && profile.location ? (
              <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted">
                <MapPin size={14} />
                {profile.location}
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/social/u/${profile.username}`} className="min-w-0">
              <Button variant="secondary" size="sm" fullWidth>
                {t("profile:publicView")}
              </Button>
            </Link>
            <Link href="/settings" className="min-w-0">
              <Button size="sm" fullWidth>
                {t("profile:edit")}
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="evolve-stats-vivid mt-4 grid grid-cols-3 gap-1 rounded-2xl px-2 py-3 text-center">
              {[
                { label: t("profile:statMonth"), value: stats.workoutsThisMonth },
                {
                  label: t("profile:statDistance"),
                  value: `${stats.totalKm} km`,
                },
                {
                  label: t("profile:statStreak"),
                  value: `${stats.streakDays}d`,
                },
              ].map((s) => (
                <div key={s.label} className="min-w-0 px-1">
                  <p className="truncate font-display text-base font-bold sm:text-lg">
                    {s.value}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mt-5">
        <SegmentedControl
          segments={[
            {
              id: "workouts",
              label: `${t("profile:tabWorkouts")} · ${postCount}`,
            },
            { id: "prs", label: `${t("profile:tabPrs")} · ${prCount}` },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5 min-w-0">
        {tab === "workouts" ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">
                {t("profile:recentWorkouts")}
              </h2>
              <Link href="/posts/new">
                <Button size="sm" variant="outline">
                  {t("profile:newPost")}
                </Button>
              </Link>
            </div>
            <FeedList
              posts={posts}
              emptyTitle={t("profile:emptyPosts")}
              emptyHint={t("profile:emptyPostsHint")}
              emptyAction={
                <Link href="/posts/new">
                  <Button>{t("profile:createPost")}</Button>
                </Link>
              }
            />
          </>
        ) : (
          <ProfilePrList
            records={profile?.personalRecords ?? []}
            canEdit
          />
        )}
      </div>
    </div>
  );
}
