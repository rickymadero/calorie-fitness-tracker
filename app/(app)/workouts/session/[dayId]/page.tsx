"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { ExerciseDemoPlayer } from "@/components/training/ExerciseDemo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTraining } from "@/components/training/TrainingProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getExerciseById, getReplacementExercises } from "@/lib/mock/exercises";
import type { ExerciseSessionLog, SetLog } from "@/lib/types/training";
import {
  calculateSessionStats,
  estimateWorkoutCalories,
} from "@/lib/training/adjustments";

export default function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = use(params);
  const router = useRouter();
  const { user, onboarding } = useAuth();
  const { assignedPlan, ensurePersonalizedPlan, saveSession, isReady } =
    useTraining();
  const { toast } = useToast();
  const isPro = user?.plan === "pro";

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("20");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [restLeft, setRestLeft] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const [logs, setLogs] = useState<ExerciseSessionLog[]>([]);
  const [note, setNote] = useState("");
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (isReady) ensurePersonalizedPlan();
  }, [isReady, ensurePersonalizedPlan]);

  const day = assignedPlan?.days.find((d) => d.id === dayId);
  const planExercises = useMemo(
    () =>
      day?.exercises
        .slice()
        .sort((a, b) => a.order - b.order)
        .filter((e) => !day.isRestDay) || [],
    [day],
  );

  const planExercise = planExercises[exerciseIndex];
  const exerciseId = activeExerciseId || planExercise?.exerciseId;
  const exercise = exerciseId ? getExerciseById(exerciseId) : null;
  const replacements = exerciseId ? getReplacementExercises(exerciseId) : [];

  useEffect(() => {
    if (!planExercise) return;
    setActiveExerciseId(planExercise.exerciseId);
    setCurrentSet(1);
    setReps(planExercise.reps.split("-")[0]?.replace(/\D/g, "") || "10");
    setWeight(
      planExercise.recommendedWeight.match(/\d+/)?.[0] || "20",
    );
    setNote("");
  }, [planExercise]);

  useEffect(() => {
    if (restLeft <= 0 || restPaused) return;
    const t = window.setInterval(() => {
      setRestLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [restLeft, restPaused]);

  if (!isReady || !assignedPlan || !day) return <PageLoader />;

  function ensureLog(exId: string, peId: string): ExerciseSessionLog {
    const existing = logs.find((l) => l.planExerciseId === peId);
    if (existing) return existing;
    const fresh: ExerciseSessionLog = {
      exerciseId: exId,
      planExerciseId: peId,
      sets: [],
      skipped: false,
      notes: "",
      painReported: false,
    };
    setLogs((prev) => [...prev, fresh]);
    return fresh;
  }

  function completeSet() {
    if (!planExercise || !exerciseId) return;
    const setLog: SetLog = {
      setNumber: currentSet,
      reps: Number(reps) || 0,
      weight: Number(weight) || 0,
      completed: true,
      difficulty,
      notes: note || undefined,
    };

    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.planExerciseId === planExercise.id);
      if (idx < 0) {
        return [
          ...prev,
          {
            exerciseId,
            planExerciseId: planExercise.id,
            sets: [setLog],
            skipped: false,
            painReported: false,
            notes: note,
          },
        ];
      }
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        exerciseId,
        sets: [...copy[idx].sets.filter((s) => s.setNumber !== currentSet), setLog],
        notes: note,
      };
      return copy;
    });

    toast(`Set ${currentSet} logged.`, "success");

    if (currentSet < planExercise.sets) {
      setRestLeft(planExercise.restSeconds);
      setRestPaused(false);
      setCurrentSet((s) => s + 1);
    } else {
      nextExercise();
    }
  }

  function nextExercise() {
    if (exerciseIndex >= planExercises.length - 1) {
      finishWorkout();
      return;
    }
    setExerciseIndex((i) => i + 1);
    setRestLeft(0);
  }

  function skipExercise() {
    if (!planExercise || !exerciseId) return;
    setLogs((prev) => {
      const others = prev.filter((l) => l.planExerciseId !== planExercise.id);
      return [
        ...others,
        {
          exerciseId,
          planExerciseId: planExercise.id,
          sets: [],
          skipped: true,
          painReported: false,
        },
      ];
    });
    toast("Exercise skipped.", "info");
    nextExercise();
  }

  function finishWorkout() {
    if (!user || !assignedPlan || !day) return;
    const ended = new Date();
    const duration = Math.max(
      1,
      Math.round((ended.getTime() - new Date(startedAt).getTime()) / 60000),
    );
    const weightKg =
      typeof onboarding.currentWeight === "number"
        ? onboarding.measurementSystem === "imperial"
          ? onboarding.currentWeight * 0.453592
          : onboarding.currentWeight
        : 75;

    // Fill any missing exercise stubs
    const finalLogs = planExercises.map((pe) => {
      const existing = logs.find((l) => l.planExerciseId === pe.id);
      return (
        existing || {
          exerciseId: pe.exerciseId,
          planExerciseId: pe.id,
          sets: [],
          skipped: true,
          painReported: false,
        }
      );
    });

    const draft = {
      id: crypto.randomUUID(),
      userId: user.id,
      planId: assignedPlan.id,
      dayId: day.id,
      startedAt,
      completedAt: ended.toISOString(),
      durationMinutes: duration,
      exercises: finalLogs,
      energyLevel: 3,
      difficultyRating: 3,
      recoveryLevel: 3,
      sleepQuality: 3,
      muscleSoreness: 3,
      notes: "",
    };
    const stats = calculateSessionStats(draft);
    const estimatedCalories = estimateWorkoutCalories(duration, weightKg, 3);
    const session = {
      ...draft,
      estimatedCalories,
      totalVolume: stats.volume,
      personalRecords:
        stats.volume > 0 ? [`Volume ${stats.volume} kg`] : [],
    };
    saveSession(session);
    router.push(`/workouts/summary/${session.id}`);
  }

  if (!planExercise || !exercise) {
    return (
      <div className="py-10 text-center">
        <p>No exercises in this workout.</p>
        <Link href="/workouts">
          <Button className="mt-4">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">
            Exercise {exerciseIndex + 1} / {planExercises.length}
          </p>
          <h1 className="font-display text-2xl font-bold">{exercise.name}</h1>
        </div>
        <Badge>
          Set {currentSet}/{planExercise.sets}
        </Badge>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ring-track">
        <div
          className="h-full bg-accent transition-all"
          style={{
            width: `${((exerciseIndex + currentSet / planExercise.sets) / planExercises.length) * 100}%`,
          }}
        />
      </div>

      <ExerciseDemoPlayer exercise={exercise} isPro={Boolean(isPro)} compact />

      <Card className="mt-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted">Target reps</p>
            <p className="font-display text-xl font-bold">{planExercise.reps}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Suggested</p>
            <p className="font-display text-xl font-bold">
              {planExercise.recommendedWeight}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Rest</p>
            <p className="font-display text-xl font-bold">
              {planExercise.restSeconds}s
            </p>
          </div>
        </div>
        {planExercise.notes && (
          <p className="mt-3 text-sm text-muted">Coach: {planExercise.notes}</p>
        )}
        <p className="mt-2 text-xs text-muted">
          Previous: — (first tracked set) · Tempo {planExercise.tempo || "controlled"}
        </p>
      </Card>

      {restLeft > 0 ? (
        <Card elevated className="mt-4 text-center">
          <p className="text-sm text-muted">Rest timer</p>
          <p className="font-display text-5xl font-bold tabular-nums">
            {Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, "0")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setRestPaused((p) => !p)}
            >
              {restPaused ? <Play size={16} /> : <Pause size={16} />}
              {restPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" onClick={() => setRestLeft((s) => s + 30)}>
              +30s
            </Button>
            <Button onClick={() => setRestLeft(0)}>
              <SkipForward size={16} />
              Skip rest
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reps completed"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <Input
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Set difficulty</p>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDifficulty(n)}
                  className={`h-10 flex-1 rounded-xl text-sm font-medium ${
                    difficulty === n
                      ? "bg-accent text-accent-fg"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Personal notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
          <Button size="lg" fullWidth onClick={completeSet}>
            <Check size={18} />
            Complete set
          </Button>
        </Card>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={skipExercise}>
          Skip
        </Button>
        <Button variant="outline" onClick={() => setReplaceOpen(true)}>
          <RefreshCw size={16} />
          Replace
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            ensureLog(exerciseId!, planExercise.id);
            setLogs((prev) =>
              prev.map((l) =>
                l.planExerciseId === planExercise.id
                  ? { ...l, painReported: true, painNotes: "Discomfort reported" }
                  : l,
              ),
            );
            toast("Pain noted. Consider replacing the movement.", "info");
          }}
        >
          <AlertTriangle size={16} />
          Pain
        </Button>
      </div>

      <Button
        className="mt-4"
        variant="ghost"
        fullWidth
        onClick={finishWorkout}
      >
        End workout
        <ChevronRight size={16} />
      </Button>

      <Modal
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Replace exercise"
        size="lg"
      >
        <p className="mb-3 text-sm text-muted">
          Same muscle pattern
          {isPro ? " with smarter Pro recommendations." : "."}
        </p>
        <div className="space-y-2">
          {replacements.map((r) => (
            <button
              key={r.id}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-accent/40"
              onClick={() => {
                setActiveExerciseId(r.id);
                setReplaceOpen(false);
                toast(`Swapped to ${r.name}.`, "success");
              }}
            >
              <span>
                <span className="block text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted capitalize">
                  {r.equipment.join(", ")}
                </span>
              </span>
              <span className="text-xs text-accent-dim dark:text-accent">Use</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
