"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Crown, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { SocialProfileEditor } from "@/components/social/SocialProfileEditor";
import { FeedList } from "@/components/feed/FeedComponents";
import type { MeasurementSystem } from "@/lib/types";

export default function ProfilePage() {
  const { user, logout, updateUser, setPlan } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { myProfile, ensureMyProfile, followersOf, followingOf, ready } =
    useSocial();
  const { tick, postsByAuthor, authorStats } = usePosts();
  const [showSettings, setShowSettings] = useState(false);
  const [showSocialEdit, setShowSocialEdit] = useState(false);

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

  if (!user) return null;

  function handleLogout() {
    logout();
    toast("Signed out.", "info");
    router.push("/");
  }

  return (
    <div className="min-w-0 w-full">
      <PageHeader
        title="Profile"
        subtitle="Your fitness identity"
        sticky
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              className="!min-w-11 !px-0"
            >
              <Settings size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Log out"
              className="!min-w-11 !px-0"
            >
              <LogOut size={18} />
            </Button>
          </>
        }
      />

      {profile && (
        <section className="mt-4 min-w-0">
          {/* Instagram-style identity row */}
          <div className="flex items-center gap-5">
            <SocialAvatar name={profile.displayName} size="lg" />
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 text-center">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold tabular-nums">
                  {postCount}
                </p>
                <p className="text-[11px] text-muted">posts</p>
              </div>
              <Link href="/network" className="min-w-0 hover:text-accent">
                <p className="font-display text-lg font-bold tabular-nums">
                  {followerCount}
                </p>
                <p className="text-[11px] text-muted">followers</p>
              </Link>
              <Link href="/network" className="min-w-0 hover:text-accent">
                <p className="font-display text-lg font-bold tabular-nums">
                  {followingCount}
                </p>
                <p className="text-[11px] text-muted">following</p>
              </Link>
            </div>
          </div>

          {/* Name + handle + bio — full width, no side buttons */}
          <div className="mt-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-base font-bold">
                {profile.displayName}
              </h2>
              <Badge variant={user.plan === "pro" ? "accent" : "default"}>
                {user.plan === "pro" ? "Pro" : "Free"}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted">@{profile.username}</p>
            {profile.bio ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Add a bio in settings so athletes know who you are.
              </p>
            )}
            {profile.showLocation && profile.location ? (
              <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted">
                <MapPin size={14} />
                {profile.location}
              </p>
            ) : null}
          </div>

          {/* Full-width CTAs under identity */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/social/u/${profile.username}`} className="min-w-0">
              <Button variant="secondary" size="sm" fullWidth>
                Public view
              </Button>
            </Link>
            <Button
              size="sm"
              fullWidth
              onClick={() => setShowSocialEdit(true)}
            >
              Edit profile
            </Button>
          </div>

          {stats && (
            <div className="evolve-stats-vivid mt-4 grid grid-cols-3 gap-1 rounded-2xl px-2 py-3 text-center">
              {[
                { label: "Month", value: stats.workoutsThisMonth },
                { label: "Distance", value: `${stats.totalKm} km` },
                { label: "Streak", value: `${stats.streakDays}d` },
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

      <div className="mt-6 min-w-0">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Recent workouts</h2>
          <Link href="/posts/new">
            <Button size="sm" variant="outline">
              New post
            </Button>
          </Link>
        </div>
        <FeedList
          posts={posts}
          emptyTitle="No posts yet"
          emptyHint="Share your first workout with the network."
          emptyAction={
            <Link href="/posts/new">
              <Button>Create post</Button>
            </Link>
          }
        />
      </div>

      <Modal
        open={showSocialEdit}
        onClose={() => setShowSocialEdit(false)}
        title="Edit social profile"
        size="lg"
      >
        <SocialProfileEditor
          embedded
          onSaved={() => setShowSocialEdit(false)}
        />
      </Modal>

      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Account
            </h3>
            <div className="mt-3 space-y-4">
              <Input
                label="Full name"
                value={user.fullName}
                onChange={(e) => updateUser({ fullName: e.target.value })}
              />
              <Input label="Email" value={user.email} disabled />
              <Button
                fullWidth
                onClick={() => toast("Profile saved.", "success")}
              >
                Save changes
              </Button>
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Preferences
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Measurement system</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["metric", "imperial"] as MeasurementSystem[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateUser({ measurementSystem: s })}
                      className={`min-h-11 rounded-2xl border text-sm font-medium capitalize ${
                        user.measurementSystem === s
                          ? "border-accent bg-accent-soft"
                          : "border-border"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Appearance</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  Toggle
                </Button>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Subscription</p>
                  <Badge variant={user.plan === "pro" ? "accent" : "default"}>
                    {user.plan === "pro" ? "Pro" : "Free"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Social feed is free. Pro unlocks food logging, plans,
                  scanners, and analytics.
                </p>
                <div className="mt-3">
                  {user.plan !== "pro" ? (
                    <Button
                      fullWidth
                      size="sm"
                      onClick={() => {
                        setPlan("pro");
                        toast("Upgraded to Pro (demo).", "success");
                      }}
                    >
                      <Crown size={14} />
                      Upgrade to Pro
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPlan("free");
                        toast("Moved to Free.", "info");
                      }}
                    >
                      Switch to Free
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}
