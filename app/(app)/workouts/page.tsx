"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Play, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useTraining } from "@/components/training/TrainingProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getExerciseById } from "@/lib/mock/exercises";
import { ProGate } from "@/components/pro/ProGate";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { t } = useAppTranslation(["workouts", "common"]);
  const {
    isReady,
    assignedPlan,
    ensurePersonalizedPlan,
    adjustments,
    sessions,
  } = useTraining();

  useEffect(() => {
    if (!isReady) return;
    ensurePersonalizedPlan();
  }, [isReady, ensurePersonalizedPlan]);

  const pendingAdjustments = useMemo(
    () => adjustments.filter((a) => a.status === "pending").slice(0, 3),
    [adjustments],
  );

  if (user?.plan !== "pro") {
    return (
      <ProGate feature={t("features.trainingPlans", { ns: "common" })}>
        <div />
      </ProGate>
    );
  }

  if (!isReady || !assignedPlan) return <PageLoader />;

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const todayWorkout =
    assignedPlan.days.find((d) => d.dayOfWeek === todayIdx && !d.isRestDay) ||
    assignedPlan.days[0];

  return (
    <ProGate feature={t("features.trainingPlans", { ns: "common" })}>
    <div>
      <ExploreBackHeader title={t("title")} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/exercises">
            <Button variant="outline">
              <BookOpen size={16} />
              {t("exerciseLibrary")}
            </Button>
          </Link>
          {user?.plan === "pro" && (
            <Link href="/admin">
              <Button variant="secondary">{t("adminBuilder")}</Button>
            </Link>
          )}
        </div>
      </div>

      <Card elevated className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="accent">{assignedPlan.experienceLevel}</Badge>
            <h2 className="mt-2 font-display text-xl font-semibold">
              {assignedPlan.name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {assignedPlan.description}
            </p>
          </div>
          <div className="text-right text-sm text-muted">
            <p>{t("meta.daysPerWeek", { n: assignedPlan.daysPerWeek })}</p>
            <p>{t("meta.weeks", { n: assignedPlan.durationWeeks })}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("stat.goal"), value: assignedPlan.mainGoal.replace(/-/g, " ") },
            { label: t("stat.progression"), value: assignedPlan.progressionStrategy.slice(0, 48) + "…" },
            { label: t("stat.restGuidance"), value: assignedPlan.restDayGuidance.slice(0, 48) + "…" },
            { label: t("stat.safety"), value: assignedPlan.safetyNotes.slice(0, 48) + "…" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-muted-bg p-3">
              <p className="text-xs text-muted">{item.label}</p>
              <p className="mt-1 text-sm capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {todayWorkout && (
        <Card className="mt-6" elevated>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge>{t("labels.today", { ns: "common" })}</Badge>
              <h3 className="mt-2 font-display text-lg font-semibold">
                {todayWorkout.name}
              </h3>
              <p className="text-sm text-muted">
                {t("todayWorkoutMeta", {
                  minutes: todayWorkout.estimatedMinutes,
                  muscles: todayWorkout.muscleGroups.join(", "),
                  count: todayWorkout.exercises.length,
                })}
              </p>
            </div>
            <Link href={`/workouts/session/${todayWorkout.id}`}>
              <Button size="lg">
                <Play size={16} />
                {t("startWorkout")}
              </Button>
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {todayWorkout.exercises
              .filter((e) => e.section === "main")
              .slice(0, 5)
              .map((pe) => {
                const ex = getExerciseById(pe.exerciseId);
                return (
                  <li
                    key={pe.id}
                    className="flex items-center justify-between rounded-xl bg-muted-bg px-3 py-2 text-sm"
                  >
                    <Link
                      href={`/exercises/${pe.exerciseId}`}
                      className="font-medium hover:text-accent-dim dark:hover:text-accent"
                    >
                      {ex?.name || pe.exerciseId}
                    </Link>
                    <span className="text-muted">
                      {pe.sets}×{pe.reps}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">{t("weeklySchedule")}</h3>
          <ul className="mt-4 space-y-2">
            {assignedPlan.days.map((day) => (
              <li
                key={day.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{day.name}</p>
                  <p className="text-xs text-muted">
                    {day.isRestDay
                      ? t("restDay")
                      : t("dayMeta", {
                          minutes: day.estimatedMinutes,
                          muscles: day.muscleGroups.join(", "),
                        })}
                  </p>
                </div>
                {!day.isRestDay && (
                  <Link href={`/workouts/session/${day.id}`}>
                    <Button size="sm" variant="secondary">
                      {t("train")}
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent-dim dark:text-accent" />
              <h3 className="font-display text-lg font-semibold">
                {t("recommendedAdjustments")}
              </h3>
            </div>
            {pendingAdjustments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                {t("adjustmentsEmpty")}
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {pendingAdjustments.map((adj) => (
                  <li key={adj.id} className="rounded-2xl bg-muted-bg p-3">
                    <p className="text-sm font-medium">{adj.title}</p>
                    <p className="mt-1 text-xs text-muted">{adj.reason}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/workouts/adjustments" className="mt-3 inline-block text-sm text-accent-dim dark:text-accent">
              {t("reviewAllAdjustments")}
            </Link>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">{t("recentSessions")}</h3>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t("noWorkoutsLogged")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {sessions.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                    <span className="text-muted">
                      {t("sessionMeta", {
                        minutes: s.durationMinutes || "—",
                        kcal: s.estimatedCalories || 0,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h3 className="font-display text-lg font-semibold">{t("coachNotes")}</h3>
        <p className="mt-2 text-sm text-muted">{assignedPlan.instructions}</p>
        <p className="mt-3 text-sm text-muted">{assignedPlan.nutritionNotes}</p>
      </Card>
    </div>
    </ProGate>
  );
}
