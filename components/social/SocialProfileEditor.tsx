"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { socialStorage } from "@/lib/storage/social";
import { COUNTRY_OPTIONS } from "@/lib/geo/countryFlag";
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

/** Stored English values (profile data keys) + i18n display keys */
const GOAL_KEYS = [
  { value: "Lose weight", key: "editor.goals.loseWeight" },
  { value: "Build muscle", key: "editor.goals.buildMuscle" },
  { value: "Improve endurance", key: "editor.goals.improveEndurance" },
  { value: "Increase strength", key: "editor.goals.increaseStrength" },
  { value: "Overall health", key: "editor.goals.overallHealth" },
  { value: "Run consistently", key: "editor.goals.runConsistently" },
  { value: "Athletic performance", key: "editor.goals.athleticPerformance" },
] as const;

export function SocialProfileEditor({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const { myProfile, ensureMyProfile, updateMyProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["social", "common"]);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("");
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
    setCountryCode(p.countryCode ?? "");
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
      setUsernameError(t("common:errors.usernameMin"));
      return;
    }
    if (
      myProfile &&
      socialStorage.isUsernameTaken(clean, myProfile.userId)
    ) {
      setUsernameError(t("common:errors.usernameTaken"));
      return;
    }
    setUsernameError("");
    updateMyProfile({
      username: clean,
      displayName:
        displayName.trim() ||
        myProfile?.displayName ||
        t("common:labels.athlete"),
      bio: bio.slice(0, 160),
      location: location.trim() || undefined,
      countryCode: countryCode || undefined,
      showLocation,
      instagramUsername: instagramUsername.replace(/^@/, "").trim() || undefined,
      showInstagram,
      visibility,
      fitnessGoals,
      favoriteWorkouts,
    });
    toast(t("profileSaved"), "success");
    onSaved?.();
  }

  if (!myProfile) return null;

  const form = (
    <div className="space-y-4">
      <Input
        label={t("displayName")}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <div>
        <Input
          label={t("editor.username")}
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
            {t("editor.usernameHint", { username: username || "…" })}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("editor.bio")}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent"
          placeholder={t("editor.bioPlaceholder")}
        />
        <p className="mt-1 text-xs text-muted">{bio.length}/160</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t("editor.visibility")}</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: "public" as const,
                label: t("common:labels.public"),
                hint: t("editor.publicHint"),
              },
              {
                id: "private" as const,
                label: t("common:labels.private"),
                hint: t("editor.privateHint"),
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
        <p className="mb-2 text-sm font-medium">{t("editor.fitnessGoals")}</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_KEYS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleGoal(value)}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium ${
                fitnessGoals.includes(value)
                  ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
                  : "border-border text-muted"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          {t("editor.favoriteWorkouts")}
        </p>
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
              {t(`editor.workouts.${w}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("editor.country")}
        </label>
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-base outline-none focus:border-accent"
        >
          <option value="">{t("editor.selectCountry")}</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">{t("editor.countryHint")}</p>
      </div>

      <Input
        label={t("editor.location")}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder={t("editor.locationPlaceholder")}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showLocation}
          onChange={(e) => setShowLocation(e.target.checked)}
          className="rounded border-border"
        />
        {t("editor.showLocation")}
      </label>

      <Input
        label={t("editor.instagram")}
        value={instagramUsername}
        onChange={(e) => setInstagramUsername(e.target.value)}
        placeholder={t("editor.instagramPlaceholder")}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showInstagram}
          onChange={(e) => setShowInstagram(e.target.checked)}
          className="rounded border-border"
        />
        {t("editor.showInstagram")}
      </label>

      <Button fullWidth onClick={save}>
        {t("editor.save")}
      </Button>
    </div>
  );

  if (embedded) return form;

  return (
    <Card className="mt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">
            {t("editor.title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("editor.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/social/u/${myProfile.username}`)}
        >
          {t("editor.viewPublic")}
        </Button>
      </div>
      {form}
      <div className="mt-3">
        <Link href="/feed">
          <Button variant="outline" fullWidth size="sm">
            {t("editor.openSocial")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
