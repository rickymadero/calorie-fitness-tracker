"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ExerciseDemoPlayer, ProDemoGate } from "@/components/training/ExerciseDemo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getExerciseById, getReplacementExercises } from "@/lib/mock/exercises";

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.plan === "pro";
  const exercise = getExerciseById(id);
  const [showProGate, setShowProGate] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const replacements = exercise ? getReplacementExercises(exercise.id) : [];

  if (!exercise) {
    return (
      <div>
        <p>Exercise not found.</p>
        <Link href="/exercises" className="text-accent-dim dark:text-accent">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/exercises"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Exercise library
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="capitalize">{exercise.primaryMuscle}</Badge>
            <Badge className="capitalize">{exercise.difficulty}</Badge>
            {exercise.isProDemo && <Badge variant="accent">Pro demo</Badge>}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            {exercise.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Equipment: {exercise.equipment.join(", ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setReplaceOpen(true)}>
            <RefreshCw size={16} />
            Alternatives
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast("Pain report saved. Consider a safer alternative.", "info")
            }
          >
            <AlertTriangle size={16} />
            Report discomfort
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExerciseDemoPlayer exercise={exercise} isPro={Boolean(isPro)} />
          {!isPro && (
            <button
              type="button"
              className="mt-3 text-sm text-accent-dim underline dark:text-accent"
              onClick={() => setShowProGate(true)}
            >
              Why is the full demo locked?
            </button>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="font-display font-semibold">Target muscles</h2>
            <p className="mt-2 text-sm capitalize">
              Primary: {exercise.primaryMuscle}
            </p>
            {exercise.secondaryMuscles.length > 0 && (
              <p className="mt-1 text-sm capitalize text-muted">
                Secondary: {exercise.secondaryMuscles.join(", ")}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-display font-semibold">Basic instructions</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted">
              {exercise.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>

          {isPro ? (
            <>
              <Card>
                <h2 className="font-display font-semibold">Starting position</h2>
                <p className="mt-2 text-sm text-muted">{exercise.startingPosition}</p>
                <h3 className="mt-4 text-sm font-semibold">Execution</h3>
                <p className="mt-1 text-sm text-muted">{exercise.execution}</p>
                <h3 className="mt-4 text-sm font-semibold">Breathing</h3>
                <p className="mt-1 text-sm text-muted">{exercise.breathing}</p>
              </Card>
              <Card>
                <h2 className="font-display font-semibold">Posture cues</h2>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {exercise.postureCues.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h2 className="font-display font-semibold">Common mistakes</h2>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {exercise.commonMistakes.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
                <h3 className="mt-4 text-sm font-semibold">Safety</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {exercise.safetyTips.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h2 className="font-display font-semibold">Variations</h2>
                <p className="mt-2 text-sm text-muted">
                  <strong>Easier:</strong> {exercise.beginnerModification}
                </p>
                <p className="mt-2 text-sm text-muted">
                  <strong>Harder:</strong> {exercise.advancedVariation}
                </p>
              </Card>
            </>
          ) : (
            <Card className="border-accent/30">
              <ProDemoGate />
            </Card>
          )}
        </div>
      </div>

      <Modal open={showProGate} onClose={() => setShowProGate(false)} title="Pro demonstrations">
        <ProDemoGate onClose={() => setShowProGate(false)} />
      </Modal>

      <Modal open={replaceOpen} onClose={() => setReplaceOpen(false)} title="Replacement options" size="lg">
        <p className="mb-4 text-sm text-muted">
          Same muscle pattern — useful for equipment limits, comfort, or preference.
          {isPro ? " Ranked with your profile in mind." : " Upgrade to Pro for smarter swaps."}
        </p>
        <div className="space-y-2">
          {replacements.map((r) => (
            <Link
              key={r.id}
              href={`/exercises/${r.id}`}
              className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 hover:border-accent/40"
              onClick={() => setReplaceOpen(false)}
            >
              <span>
                <span className="block text-sm font-medium">{r.name}</span>
                <span className="text-xs capitalize text-muted">
                  {r.primaryMuscle} · {r.equipment.join(", ")}
                </span>
              </span>
              <span className="text-xs text-accent-dim dark:text-accent">View</span>
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
}
