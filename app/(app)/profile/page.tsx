"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Crown, MapPin, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";
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

  if (!user) return null;

  function handleLogout() {
    logout();
    toast("Signed out.", "info");
    router.push("/");
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Your public fitness identity on Evolve."
        sticky
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </>
        }
      />

      {profile && (
        <Card className="mt-6">
          <div className="flex flex-wrap gap-5">
            <SocialAvatar name={profile.displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold">
                  {profile.displayName}
                </h2>
                <Badge variant={user.plan === "pro" ? "accent" : "default"}>
                  {user.plan === "pro" ? "Pro" : "Free"}
                </Badge>
              </div>
              <p className="text-muted">@{profile.username}</p>
              {profile.bio ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  Add a bio in social settings so athletes know who you are.
                </p>
              )}
              {profile.showLocation && profile.location ? (
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
                  <MapPin size={14} />
                  {profile.location}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link href="/network" className="hover:text-accent">
                  <span className="font-semibold">{followerCount}</span>{" "}
                  <span className="text-muted">followers</span>
                </Link>
                <Link href="/network" className="hover:text-accent">
                  <span className="font-semibold">{followingCount}</span>{" "}
                  <span className="text-muted">following</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`/social/u/${profile.username}`}>
                <Button variant="secondary" size="sm">
                  Public view
                </Button>
              </Link>
              <Link href="/posts/new">
                <Button size="sm">Share workout</Button>
              </Link>
            </div>
          </div>

          {stats && (
            <div className="evolve-stats-vivid mt-6 grid grid-cols-3 gap-2 rounded-2xl p-3 text-center">
              {[
                { label: "This month", value: stats.workoutsThisMonth },
                { label: "Distance", value: `${stats.totalKm} km` },
                { label: "Streak", value: `${stats.streakDays}d` },
              ].map((s) => (
                <div key={s.label} className="min-w-0">
                  <p className="truncate font-display text-lg font-bold">
                    {s.value}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Recent workouts
          </h2>
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

      <SocialProfileEditor />

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
