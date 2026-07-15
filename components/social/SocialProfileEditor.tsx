"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { socialStorage } from "@/lib/storage/social";
import type { ProfileVisibility, WorkoutInterest } from "@/lib/types/social";

const WORKOUT_OPTIONS: WorkoutInterest[] = [
  "running",
  "walking",
  "cycling",
  "gym",
  "weightlifting",
  "hiit",
  "yoga",
  "swimming",
  "hiking",
  "sports",
];

const GOAL_OPTIONS = [
  "Lose weight",
  "Build muscle",
  "Improve endurance",
  "Increase strength",
  "Overall health",
  "Run consistently",
  "Athletic performance",
];

export function SocialProfileEditor({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const { myProfile, ensureMyProfile, updateMyProfile } = useSocial();
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [showInstagram, setShowInstagram] = useState(false);
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<WorkoutInterest[]>([]);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    const p = ensureMyProfile();
    if (!p) return;
    setUsername(p.username);
    setDisplayName(p.displayName);
    setBio(p.bio);
    setLocation(p.location ?? "");
    setShowLocation(p.showLocation);
    setInstagramUsername(p.instagramUsername ?? "");
    setShowInstagram(p.showInstagram);
    setVisibility(p.visibility);
    setFitnessGoals(p.fitnessGoals);
    setFavoriteWorkouts(p.favoriteWorkouts);
  }, [ensureMyProfile, myProfile?.userId]);

  function toggleGoal(goal: string) {
    setFitnessGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal].slice(0, 4),
    );
  }

  function toggleWorkout(w: WorkoutInterest) {
    setFavoriteWorkouts((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].slice(0, 5),
    );
  }

  function save() {
    const clean = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    if (clean.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    }
    if (
      myProfile &&
      socialStorage.isUsernameTaken(clean, myProfile.userId)
    ) {
      setUsernameError("That username is taken.");
      return;
    }
    setUsernameError("");
    updateMyProfile({
      username: clean,
      displayName: displayName.trim() || myProfile?.displayName || "Athlete",
      bio: bio.slice(0, 160),
      location: location.trim() || undefined,
      showLocation,
      instagramUsername: instagramUsername.replace(/^@/, "").trim() || undefined,
      showInstagram,
      visibility,
      fitnessGoals,
      favoriteWorkouts,
    });
    toast("Social profile saved.", "success");
    onSaved?.();
  }

  if (!myProfile) return null;

  const form = (
    <div className="space-y-4">
      <Input
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <div>
        <Input
          label="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError("");
          }}
        />
        {usernameError ? (
          <p className="mt-1 text-xs text-red-500">{usernameError}</p>
        ) : (
          <p className="mt-1 text-xs text-muted">
            Letters, numbers, underscore. Shown as @{username || "…"}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent"
          placeholder="Short intro for other athletes…"
        />
        <p className="mt-1 text-xs text-muted">{bio.length}/160</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Profile visibility</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "public", label: "Public", hint: "Anyone can follow" },
              {
                id: "private",
                label: "Private",
                hint: "Approve requests",
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setVisibility(opt.id)}
              className={`min-h-11 rounded-2xl border px-3 py-2.5 text-left ${
                visibility === opt.id
                  ? "border-accent bg-accent-soft"
                  : "border-border"
              }`}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Fitness goals</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGoal(g)}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium ${
                fitnessGoals.includes(g)
                  ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
                  : "border-border text-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Favorite workouts</p>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => toggleWorkout(w)}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                favoriteWorkouts.includes(w)
                  ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
                  : "border-border text-muted"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="City, region"
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showLocation}
          onChange={(e) => setShowLocation(e.target.checked)}
          className="rounded border-border"
        />
        Show location publicly
      </label>

      <Input
        label="Instagram (optional)"
        value={instagramUsername}
        onChange={(e) => setInstagramUsername(e.target.value)}
        placeholder="username"
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showInstagram}
          onChange={(e) => setShowInstagram(e.target.checked)}
          className="rounded border-border"
        />
        Show Instagram publicly
      </label>

      <Button fullWidth onClick={save}>
        Save profile
      </Button>
    </div>
  );

  if (embedded) return form;

  return (
    <Card className="mt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">Social profile</h2>
          <p className="mt-1 text-sm text-muted">
            Visible to the Evolve network.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/social/u/${myProfile.username}`)}
        >
          View public
        </Button>
      </div>
      {form}
      <div className="mt-3">
        <Link href="/feed">
          <Button variant="outline" fullWidth size="sm">
            Open Social
          </Button>
        </Link>
      </div>
    </Card>
  );
}
