"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTraining } from "@/components/training/TrainingProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { EXERCISES } from "@/lib/mock/exercises";
import type {
  EquipmentType,
  PlanExercise,
  WorkoutDay,
  WorkoutPlan,
} from "@/lib/types/training";
import type { ExperienceLevel, FitnessGoal } from "@/lib/types";
import type { TFunction } from "i18next";

function emptyPlan(t: TFunction): WorkoutPlan {
  return {
    id: `plan-${crypto.randomUUID()}`,
    name: t("editor.defaults.name"),
    description: t("editor.defaults.description"),
    mainGoal: "build-muscle",
    experienceLevel: "beginner",
    requiredEquipment: ["dumbbells", "bodyweight"],
    daysPerWeek: 3,
    durationWeeks: 8,
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    instructions: t("editor.defaults.instructions"),
    restDayGuidance: t("editor.defaults.restDayGuidance"),
    progressionStrategy: t("editor.defaults.progression"),
    nutritionNotes: t("editor.defaults.nutrition"),
    safetyNotes: t("editor.defaults.safety"),
    phases: [
      {
        id: `phase-${crypto.randomUUID()}`,
        name: t("editor.defaults.phaseName"),
        weeks: 4,
        focus: t("editor.defaults.phaseFocus"),
        order: 0,
      },
    ],
    days: [],
    assignedUserIds: [],
  };
}

function emptyDay(t: TFunction, index: number): WorkoutDay {
  return {
    id: `day-${crypto.randomUUID()}`,
    name: t("editor.defaults.dayName", { n: index + 1 }),
    dayOfWeek: index,
    isRestDay: false,
    muscleGroups: ["full-body"],
    estimatedMinutes: 45,
    difficulty: "beginner",
    warmUpNotes: t("editor.defaults.warmUpNotes"),
    cooldownNotes: t("editor.defaults.cooldownNotes"),
    trainerNotes: "",
    exercises: [],
  };
}

export function AdminPlanEditor({ planId }: { planId: string | null }) {
  const router = useRouter();
  const { user, isReady: authReady } = useAuth();
  const { plans, savePlan, assignPlanToUser, isReady } = useTraining();
  const { toast } = useToast();
  const { t } = useAppTranslation(["admin", "common"]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (!isReady || booted) return;
    if (planId) {
      const existing = plans.find((p) => p.id === planId);
      if (existing) setPlan(JSON.parse(JSON.stringify(existing)));
    } else {
      setPlan(emptyPlan(t));
    }
    setBooted(true);
  }, [isReady, planId, plans, booted, t]);

  const day = plan?.days[selectedDay];

  const exerciseOptions = useMemo(
    () => EXERCISES.map((e) => ({ value: e.id, label: e.name })),
    [],
  );

  if (!authReady || !isReady || !user || !plan) return <PageLoader />;

  function updatePlan(patch: Partial<WorkoutPlan>) {
    setPlan((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function updateDay(patch: Partial<WorkoutDay>) {
    if (!plan) return;
    const days = [...plan.days];
    days[selectedDay] = { ...days[selectedDay], ...patch };
    updatePlan({ days });
  }

  function addExercise() {
    if (!day) return;
    const pe: PlanExercise = {
      id: `pe-${crypto.randomUUID()}`,
      exerciseId: EXERCISES[0].id,
      sets: 3,
      reps: "8-12",
      recommendedWeight: "RPE 7",
      restSeconds: 90,
      tempo: "2-0-1",
      section: "main",
      order: day.exercises.length,
    };
    updateDay({ exercises: [...day.exercises, pe] });
  }

  function moveExercise(index: number, dir: -1 | 1) {
    if (!day) return;
    const next = index + dir;
    if (next < 0 || next >= day.exercises.length) return;
    const exercises = [...day.exercises];
    const tmp = exercises[index];
    exercises[index] = exercises[next];
    exercises[next] = tmp;
    updateDay({
      exercises: exercises.map((e, i) => ({ ...e, order: i })),
    });
  }

  function save(asTemplate?: boolean) {
    if (!plan) return;
    const next = {
      ...plan,
      isTemplate: asTemplate ?? plan.isTemplate,
      updatedAt: new Date().toISOString(),
      daysPerWeek: plan.days.filter((d) => !d.isRestDay).length || plan.daysPerWeek,
    };
    savePlan(next);
    toast(t("toast.planSaved"), "success");
    router.push("/admin");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EvolveLogo size="sm" />
            <Link href="/admin" className="text-sm text-muted hover:text-foreground">
              <ArrowLeft size={16} className="inline" /> {t("editor.back")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => save(true)}>
              {t("editor.saveTemplate")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                save(false);
                assignPlanToUser(plan.id, user.id, false);
              }}
            >
              {t("editor.saveAndAssign")}
            </Button>
            <Button onClick={() => save()}>{t("editor.save")}</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-3 md:px-8">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <h2 className="font-display font-semibold">{t("editor.planDetails")}</h2>
            <div className="mt-3 space-y-3">
              <Input
                label={t("editor.planName")}
                value={plan.name}
                onChange={(e) => updatePlan({ name: e.target.value })}
              />
              <Input
                label={t("editor.description")}
                value={plan.description}
                onChange={(e) => updatePlan({ description: e.target.value })}
              />
              <Select
                label={t("editor.mainGoal")}
                value={plan.mainGoal}
                onChange={(e) =>
                  updatePlan({ mainGoal: e.target.value as FitnessGoal })
                }
                options={[
                  { value: "lose-weight", label: t("editor.goal.loseWeight") },
                  { value: "build-muscle", label: t("editor.goal.buildMuscle") },
                  {
                    value: "increase-strength",
                    label: t("editor.goal.increaseStrength"),
                  },
                  {
                    value: "improve-endurance",
                    label: t("editor.goal.improveEndurance"),
                  },
                  {
                    value: "overall-health",
                    label: t("editor.goal.overallHealth"),
                  },
                  {
                    value: "athletic-performance",
                    label: t("editor.goal.athleticPerformance"),
                  },
                  {
                    value: "maintain-weight",
                    label: t("editor.goal.maintainWeight"),
                  },
                ]}
              />
              <Select
                label={t("editor.experience")}
                value={plan.experienceLevel}
                onChange={(e) =>
                  updatePlan({
                    experienceLevel: e.target.value as ExperienceLevel,
                  })
                }
                options={[
                  { value: "beginner", label: t("editor.level.beginner") },
                  {
                    value: "intermediate",
                    label: t("editor.level.intermediate"),
                  },
                  { value: "advanced", label: t("editor.level.advanced") },
                ]}
              />
              <Input
                label={t("editor.durationWeeks")}
                type="number"
                value={plan.durationWeeks}
                onChange={(e) =>
                  updatePlan({ durationWeeks: Number(e.target.value) || 1 })
                }
              />
              <Input
                label={t("editor.equipment")}
                value={plan.requiredEquipment.join(", ")}
                onChange={(e) =>
                  updatePlan({
                    requiredEquipment: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean) as EquipmentType[],
                  })
                }
              />
              <Input
                label={t("editor.instructions")}
                value={plan.instructions}
                onChange={(e) => updatePlan({ instructions: e.target.value })}
              />
              <Input
                label={t("editor.progressionStrategy")}
                value={plan.progressionStrategy}
                onChange={(e) =>
                  updatePlan({ progressionStrategy: e.target.value })
                }
              />
              <Input
                label={t("editor.nutritionNotes")}
                value={plan.nutritionNotes}
                onChange={(e) => updatePlan({ nutritionNotes: e.target.value })}
              />
              <Input
                label={t("editor.safetyNotes")}
                value={plan.safetyNotes}
                onChange={(e) => updatePlan({ safetyNotes: e.target.value })}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold">{t("editor.trainingDays")}</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const days = [...plan.days, emptyDay(t, plan.days.length)];
                  updatePlan({ days, daysPerWeek: days.length });
                  setSelectedDay(days.length - 1);
                }}
              >
                <Plus size={14} />
                {t("editor.addDay")}
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {plan.days.map((d, i) => (
                <li key={d.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(i)}
                    className={`flex-1 rounded-xl px-3 py-2 text-left text-sm ${
                      selectedDay === i
                        ? "bg-accent text-accent-fg"
                        : "bg-muted-bg"
                    }`}
                  >
                    {d.name}
                    {d.isRestDay ? t("editor.restSuffix") : ""}
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const days = [...plan.days];
                      days.splice(i, 0, {
                        ...JSON.parse(JSON.stringify(d)),
                        id: `day-${crypto.randomUUID()}`,
                        name: t("editor.dayCopySuffix", { name: d.name }),
                      });
                      updatePlan({ days });
                      toast(t("toast.dayDuplicated"), "success");
                    }}
                  >
                    {t("editor.copy")}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!day ? (
            <Card>
              <p className="text-sm text-muted">{t("editor.addDayPrompt")}</p>
            </Card>
          ) : (
            <Card elevated>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("editor.workoutName")}
                  value={day.name}
                  onChange={(e) => updateDay({ name: e.target.value })}
                />
                <Input
                  label={t("editor.estimatedMinutes")}
                  type="number"
                  value={day.estimatedMinutes}
                  onChange={(e) =>
                    updateDay({ estimatedMinutes: Number(e.target.value) || 0 })
                  }
                />
                <Input
                  label={t("editor.warmUp")}
                  value={day.warmUpNotes || ""}
                  onChange={(e) => updateDay({ warmUpNotes: e.target.value })}
                />
                <Input
                  label={t("editor.cardioNotes")}
                  value={day.cardioNotes || ""}
                  onChange={(e) => updateDay({ cardioNotes: e.target.value })}
                />
                <Input
                  label={t("editor.cooldown")}
                  value={day.cooldownNotes || ""}
                  onChange={(e) => updateDay({ cooldownNotes: e.target.value })}
                />
                <Input
                  label={t("editor.trainerNotes")}
                  value={day.trainerNotes || ""}
                  onChange={(e) => updateDay({ trainerNotes: e.target.value })}
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={day.isRestDay}
                  onChange={(e) => updateDay({ isRestDay: e.target.checked })}
                />
                {t("editor.markRestDay")}
              </label>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="font-display font-semibold">{t("editor.exercises")}</h3>
                <Button size="sm" onClick={addExercise}>
                  <Plus size={14} />
                  {t("editor.addExercise")}
                </Button>
              </div>

              <ul className="mt-4 space-y-3">
                {day.exercises.map((ex, index) => (
                  <li
                    key={ex.id}
                    className="rounded-2xl border border-border bg-muted-bg/40 p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select
                        label={t("editor.exercise")}
                        value={ex.exerciseId}
                        options={exerciseOptions}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = {
                            ...ex,
                            exerciseId: e.target.value,
                          };
                          updateDay({ exercises });
                        }}
                      />
                      <Select
                        label={t("editor.section")}
                        value={ex.section}
                        options={[
                          { value: "warmup", label: t("editor.sectionWarmup") },
                          {
                            value: "mobility",
                            label: t("editor.sectionMobility"),
                          },
                          { value: "main", label: t("editor.sectionMain") },
                          { value: "cardio", label: t("editor.sectionCardio") },
                          {
                            value: "cooldown",
                            label: t("editor.sectionCooldown"),
                          },
                        ]}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = {
                            ...ex,
                            section: e.target.value as PlanExercise["section"],
                          };
                          updateDay({ exercises });
                        }}
                      />
                      <Input
                        label={t("editor.sets")}
                        type="number"
                        value={ex.sets}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = {
                            ...ex,
                            sets: Number(e.target.value) || 0,
                          };
                          updateDay({ exercises });
                        }}
                      />
                      <Input
                        label={t("editor.reps")}
                        value={ex.reps}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = { ...ex, reps: e.target.value };
                          updateDay({ exercises });
                        }}
                      />
                      <Input
                        label={t("editor.weightGuidance")}
                        value={ex.recommendedWeight}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = {
                            ...ex,
                            recommendedWeight: e.target.value,
                          };
                          updateDay({ exercises });
                        }}
                      />
                      <Input
                        label={t("editor.restSec")}
                        type="number"
                        value={ex.restSeconds}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = {
                            ...ex,
                            restSeconds: Number(e.target.value) || 0,
                          };
                          updateDay({ exercises });
                        }}
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveExercise(index, -1)}
                      >
                        <ChevronUp size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveExercise(index, 1)}
                      >
                        <ChevronDown size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          updateDay({
                            exercises: day.exercises.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
