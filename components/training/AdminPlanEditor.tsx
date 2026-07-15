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
import { EXERCISES } from "@/lib/mock/exercises";
import type {
  EquipmentType,
  PlanExercise,
  WorkoutDay,
  WorkoutPlan,
} from "@/lib/types/training";
import type { ExperienceLevel, FitnessGoal } from "@/lib/types";

function emptyPlan(): WorkoutPlan {
  return {
    id: `plan-${crypto.randomUUID()}`,
    name: "New workout plan",
    description: "Custom plan created in admin builder.",
    mainGoal: "build-muscle",
    experienceLevel: "beginner",
    requiredEquipment: ["dumbbells", "bodyweight"],
    daysPerWeek: 3,
    durationWeeks: 8,
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    instructions: "Train with controlled tempo and leave 1–2 reps in reserve.",
    restDayGuidance: "Walk and stretch on non-training days.",
    progressionStrategy: "Add reps, then load, when all sets are completed cleanly.",
    nutritionNotes: "Hit daily protein and stay near calorie target.",
    safetyNotes: "Stop for sharp pain. Scale range of motion as needed.",
    phases: [
      {
        id: `phase-${crypto.randomUUID()}`,
        name: "Phase 1",
        weeks: 4,
        focus: "Foundation",
        order: 0,
      },
    ],
    days: [],
    assignedUserIds: [],
  };
}

function emptyDay(index: number): WorkoutDay {
  return {
    id: `day-${crypto.randomUUID()}`,
    name: `Day ${index + 1}`,
    dayOfWeek: index,
    isRestDay: false,
    muscleGroups: ["full-body"],
    estimatedMinutes: 45,
    difficulty: "beginner",
    warmUpNotes: "Light cardio + mobility",
    cooldownNotes: "Walk + stretch",
    trainerNotes: "",
    exercises: [],
  };
}

export function AdminPlanEditor({ planId }: { planId: string | null }) {
  const router = useRouter();
  const { user, isReady: authReady } = useAuth();
  const { plans, savePlan, assignPlanToUser, isReady } = useTraining();
  const { toast } = useToast();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (!isReady || booted) return;
    if (planId) {
      const existing = plans.find((p) => p.id === planId);
      if (existing) setPlan(JSON.parse(JSON.stringify(existing)));
    } else {
      setPlan(emptyPlan());
    }
    setBooted(true);
  }, [isReady, planId, plans, booted]);

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
    toast("Plan saved.", "success");
    router.push("/admin");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EvolveLogo href="/admin" size="sm" />
            <Link href="/admin" className="text-sm text-muted hover:text-foreground">
              <ArrowLeft size={16} className="inline" /> Back
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => save(true)}>
              Save template
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                save(false);
                assignPlanToUser(plan.id, user.id, false);
              }}
            >
              Save & assign to me
            </Button>
            <Button onClick={() => save()}>Save</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-3 md:px-8">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <h2 className="font-display font-semibold">Plan details</h2>
            <div className="mt-3 space-y-3">
              <Input
                label="Plan name"
                value={plan.name}
                onChange={(e) => updatePlan({ name: e.target.value })}
              />
              <Input
                label="Description"
                value={plan.description}
                onChange={(e) => updatePlan({ description: e.target.value })}
              />
              <Select
                label="Main goal"
                value={plan.mainGoal}
                onChange={(e) =>
                  updatePlan({ mainGoal: e.target.value as FitnessGoal })
                }
                options={[
                  { value: "lose-weight", label: "Lose weight" },
                  { value: "build-muscle", label: "Build muscle" },
                  { value: "increase-strength", label: "Increase strength" },
                  { value: "improve-endurance", label: "Improve endurance" },
                  { value: "overall-health", label: "Overall health" },
                  { value: "athletic-performance", label: "Athletic performance" },
                  { value: "maintain-weight", label: "Maintain weight" },
                ]}
              />
              <Select
                label="Experience"
                value={plan.experienceLevel}
                onChange={(e) =>
                  updatePlan({
                    experienceLevel: e.target.value as ExperienceLevel,
                  })
                }
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ]}
              />
              <Input
                label="Duration (weeks)"
                type="number"
                value={plan.durationWeeks}
                onChange={(e) =>
                  updatePlan({ durationWeeks: Number(e.target.value) || 1 })
                }
              />
              <Input
                label="Equipment (comma-separated)"
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
                label="Instructions"
                value={plan.instructions}
                onChange={(e) => updatePlan({ instructions: e.target.value })}
              />
              <Input
                label="Progression strategy"
                value={plan.progressionStrategy}
                onChange={(e) =>
                  updatePlan({ progressionStrategy: e.target.value })
                }
              />
              <Input
                label="Nutrition notes"
                value={plan.nutritionNotes}
                onChange={(e) => updatePlan({ nutritionNotes: e.target.value })}
              />
              <Input
                label="Safety notes"
                value={plan.safetyNotes}
                onChange={(e) => updatePlan({ safetyNotes: e.target.value })}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold">Training days</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const days = [...plan.days, emptyDay(plan.days.length)];
                  updatePlan({ days, daysPerWeek: days.length });
                  setSelectedDay(days.length - 1);
                }}
              >
                <Plus size={14} />
                Add day
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
                    {d.isRestDay ? " (rest)" : ""}
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const days = [...plan.days];
                      days.splice(i, 0, {
                        ...JSON.parse(JSON.stringify(d)),
                        id: `day-${crypto.randomUUID()}`,
                        name: `${d.name} copy`,
                      });
                      updatePlan({ days });
                      toast("Day duplicated.", "success");
                    }}
                  >
                    Copy
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!day ? (
            <Card>
              <p className="text-sm text-muted">Add a training day to begin.</p>
            </Card>
          ) : (
            <Card elevated>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Workout name"
                  value={day.name}
                  onChange={(e) => updateDay({ name: e.target.value })}
                />
                <Input
                  label="Estimated minutes"
                  type="number"
                  value={day.estimatedMinutes}
                  onChange={(e) =>
                    updateDay({ estimatedMinutes: Number(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Warm-up"
                  value={day.warmUpNotes || ""}
                  onChange={(e) => updateDay({ warmUpNotes: e.target.value })}
                />
                <Input
                  label="Cardio notes"
                  value={day.cardioNotes || ""}
                  onChange={(e) => updateDay({ cardioNotes: e.target.value })}
                />
                <Input
                  label="Cooldown"
                  value={day.cooldownNotes || ""}
                  onChange={(e) => updateDay({ cooldownNotes: e.target.value })}
                />
                <Input
                  label="Trainer notes"
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
                Mark as rest day
              </label>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="font-display font-semibold">Exercises</h3>
                <Button size="sm" onClick={addExercise}>
                  <Plus size={14} />
                  Add exercise
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
                        label="Exercise"
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
                        label="Section"
                        value={ex.section}
                        options={[
                          { value: "warmup", label: "Warm-up" },
                          { value: "mobility", label: "Mobility" },
                          { value: "main", label: "Main" },
                          { value: "cardio", label: "Cardio" },
                          { value: "cooldown", label: "Cooldown" },
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
                        label="Sets"
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
                        label="Reps"
                        value={ex.reps}
                        onChange={(e) => {
                          const exercises = [...day.exercises];
                          exercises[index] = { ...ex, reps: e.target.value };
                          updateDay({ exercises });
                        }}
                      />
                      <Input
                        label="Weight guidance"
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
                        label="Rest (sec)"
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
