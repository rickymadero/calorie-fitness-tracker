"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepProgress } from "@/components/ui/StepProgress";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { socialStorage } from "@/lib/storage/social";
import type { WorkoutInterest } from "@/lib/types/social";
import type { MeasurementSystem as AccountUnits } from "@/lib/types";

const WORKOUTS: WorkoutInterest[] = [
  "running",
  "walking",
  "cycling",
  "swimming",
  "gym",
  "yoga",
  "weightlifting",
  "hiit",
  "hiking",
  "sports",
];

const GOALS = [
  { key: "buildMuscle", value: "Build muscle" },
  { key: "endurance", value: "Improve endurance" },
  { key: "loseWeight", value: "Lose weight" },
  { key: "health", value: "Overall health" },
  { key: "strength", value: "Increase strength" },
  { key: "run", value: "Run consistently" },
] as const;

export default function OnboardingPage() {
  const { user, isReady, updateUser, updateOnboarding, completeOnboarding } =
    useAuth();
  const { ensureMyProfile, updateMyProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [units, setUnits] = useState<AccountUnits>("metric");
  const [favorites, setFavorites] = useState<WorkoutInterest[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState("");

  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.onboardingComplete) {
      router.replace("/feed");
      return;
    }
    setDisplayName(user.fullName || "");
    const base = (user.fullName || "athlete")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 18);
    setUsername(base || "athlete");
    setUnits(user.measurementSystem);
    ensureMyProfile();
  }, [isReady, user, router, ensureMyProfile]);

  if (!isReady || !user) return <PageLoader />;
  if (user.onboardingComplete) return <PageLoader />;

  function toggleFavorite(w: WorkoutInterest) {
    setFavorites((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].slice(0, 5),
    );
  }

  function toggleGoal(g: string) {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].slice(0, 3),
    );
  }

  function nextFromIdentity() {
    const clean = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    if (clean.length < 3) {
      setUsernameError(t("errors.usernameMin"));
      return;
    }
    if (socialStorage.isUsernameTaken(clean, user!.id)) {
      setUsernameError(t("errors.usernameTaken"));
      return;
    }
    setUsername(clean);
    setUsernameError("");
    setStep(1);
  }

  async function finish() {
    if (finishing) return;
    setFinishing(true);

    const fullName = displayName.trim() || user!.fullName;
    const cleanBio = bio.slice(0, 160);

    updateUser({
      fullName,
      measurementSystem: units,
    });
    updateOnboarding({
      measurementSystem: units,
      // Soft defaults so Pro tools still work later without forcing calories now
      gender: "male",
      age: 28,
      currentWeight: units === "metric" ? 75 : 165,
      height: units === "metric" ? 175 : 69,
      targetWeight: units === "metric" ? 72 : 158,
      primaryGoal: "overall-health",
      activityLevel: "moderately-active",
      exerciseDaysPerWeek: 4,
      experienceLevel: "intermediate",
      dietType: "none",
    });
    updateMyProfile({
      displayName: fullName,
      username,
      bio: cleanBio,
      favoriteWorkouts: favorites,
      fitnessGoals: goals,
      visibility: "public",
    });

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { profilesService } = await import("@/lib/services/profiles");
      const supabase = createClient();
      const { data, error } = await profilesService.completeOnboarding(
        supabase,
        user!.id,
        {
          username,
          fullName,
          bio: cleanBio || null,
          isPrivate: false,
          preferredUnits: units,
        },
      );
      if (error || !data?.onboarding_completed) {
        toast(
          error?.message || t("errors.generic"),
          "error",
        );
        setFinishing(false);
        return;
      }
    } catch {
      toast(t("errors.generic"), "error");
      setFinishing(false);
      return;
    }

    completeOnboarding();
    toast(t("onboarding.welcome", { ns: "auth" }), "success");
    router.replace("/feed");
  }

  const unitOptions = [
    {
      id: "metric" as const,
      label: t("labels.metric"),
      hint: t("onboarding.metricHint", { ns: "auth" }),
    },
    {
      id: "imperial" as const,
      label: t("labels.imperial"),
      hint: t("onboarding.imperialHint", { ns: "auth" }),
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-8">
        <EvolveLogo size="sm" />
        <div className="mt-8">
          <StepProgress current={step + 1} total={3} />
        </div>

        {step === 0 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("onboarding.profileTitle", { ns: "auth" })}
            </h1>
            <p className="text-sm text-muted">
              {t("onboarding.profileBody", { ns: "auth" })}
            </p>
            <Input
              label={t("onboarding.displayName", { ns: "auth" })}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div>
              <Input
                label={t("onboarding.username", { ns: "auth" })}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
              />
              {usernameError ? (
                <p className="mt-1 text-xs text-danger">{usernameError}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">@{username || "…"}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("onboarding.bio", { ns: "auth" })}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                rows={3}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                placeholder={t("onboarding.bioPlaceholder", { ns: "auth" })}
              />
            </div>
            <Button fullWidth size="lg" onClick={nextFromIdentity}>
              {t("buttons.continue")}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("onboarding.trainTitle", { ns: "auth" })}
            </h1>
            <p className="text-sm text-muted">
              {t("onboarding.trainBody", { ns: "auth" })}
            </p>
            <div className="flex flex-wrap gap-2">
              {WORKOUTS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleFavorite(w)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                    favorites.includes(w)
                      ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
                      : "border-border text-muted"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="text-sm font-medium">
              {t("onboarding.goals", { ns: "auth" })}
            </p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleGoal(g.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    goals.includes(g.value)
                      ? "border-accent bg-accent-soft"
                      : "border-border text-muted"
                  }`}
                >
                  {t(`goals.${g.key}`, { ns: "auth" })}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                {t("buttons.back")}
              </Button>
              <Button fullWidth onClick={() => setStep(2)}>
                {t("buttons.continue")}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("onboarding.unitsTitle", { ns: "auth" })}
            </h1>
            <p className="text-sm text-muted">
              {t("onboarding.unitsBody", { ns: "auth" })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {unitOptions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnits(u.id)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    units === u.id
                      ? "border-accent bg-accent-soft"
                      : "border-border"
                  }`}
                >
                  <p className="font-semibold">{u.label}</p>
                  <p className="text-xs text-muted">{u.hint}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t("buttons.back")}
              </Button>
              <Button fullWidth size="lg" onClick={() => void finish()} loading={finishing}>
                {t("onboarding.enter", { ns: "auth" })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
