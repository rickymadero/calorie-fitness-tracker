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

export default function WorkoutsPage() {
  const { user } = useAuth();
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
      <ProGate feature="Personalized training plans">
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
    <ProGate feature="Personalized training plans">
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Workouts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your personalized plan — built from onboarding and ready to train.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/exercises">
            <Button variant="outline">
              <BookOpen size={16} />
              Exercise library
            </Button>
          </Link>
          {user?.plan === "pro" && (
            <Link href="/admin">
              <Button variant="secondary">Admin builder</Button>
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
            <p>{assignedPlan.daysPerWeek} days / week</p>
            <p>{assignedPlan.durationWeeks} weeks</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Goal", value: assignedPlan.mainGoal.replace(/-/g, " ") },
            { label: "Progression", value: assignedPlan.progressionStrategy.slice(0, 48) + "…" },
            { label: "Rest guidance", value: assignedPlan.restDayGuidance.slice(0, 48) + "…" },
            { label: "Safety", value: assignedPlan.safetyNotes.slice(0, 48) + "…" },
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
              <Badge>Today</Badge>
              <h3 className="mt-2 font-display text-lg font-semibold">
                {todayWorkout.name}
              </h3>
              <p className="text-sm text-muted">
                {todayWorkout.estimatedMinutes} min ·{" "}
                {todayWorkout.muscleGroups.join(", ")} · {todayWorkout.exercises.length}{" "}
                movements
              </p>
            </div>
            <Link href={`/workouts/session/${todayWorkout.id}`}>
              <Button size="lg">
                <Play size={16} />
                Start workout
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
          <h3 className="font-display text-lg font-semibold">Weekly schedule</h3>
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
                      ? "Rest day"
                      : `${day.estimatedMinutes} min · ${day.muscleGroups.join(", ")}`}
                  </p>
                </div>
                {!day.isRestDay && (
                  <Link href={`/workouts/session/${day.id}`}>
                    <Button size="sm" variant="secondary">
                      Train
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
                Recommended adjustments
              </h3>
            </div>
            {pendingAdjustments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Complete a guided workout to unlock smart progression suggestions.
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
              Review all adjustments
            </Link>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold">Recent sessions</h3>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No workouts logged yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {sessions.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                    <span className="text-muted">
                      {s.durationMinutes || "—"} min · {s.estimatedCalories || 0} kcal
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h3 className="font-display text-lg font-semibold">Coach notes</h3>
        <p className="mt-2 text-sm text-muted">{assignedPlan.instructions}</p>
        <p className="mt-3 text-sm text-muted">{assignedPlan.nutritionNotes}</p>
      </Card>
    </div>
    </ProGate>
  );
}
