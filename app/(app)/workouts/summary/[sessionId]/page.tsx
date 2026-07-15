"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useTraining } from "@/components/training/TrainingProvider";
import { calculateSessionStats } from "@/lib/training/adjustments";
import { getExerciseById } from "@/lib/mock/exercises";

export default function WorkoutSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { sessions, adjustments, setAdjustmentStatus, isReady } = useTraining();
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId],
  );

  if (!isReady) return <PageLoader />;
  if (!session) {
    return (
      <div className="py-10 text-center">
        <p>Session not found.</p>
        <Link href="/workouts">
          <Button className="mt-4">Back to workouts</Button>
        </Link>
      </div>
    );
  }

  const stats = calculateSessionStats(session);
  const related = adjustments
    .filter((a) => a.planId === session.planId && a.status === "pending")
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-2xl">
      <Badge variant="success">Workout complete</Badge>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        Session summary
      </h1>
      <p className="mt-1 text-sm text-muted">
        {new Date(session.startedAt).toLocaleString()}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Duration", value: `${session.durationMinutes || 0} min` },
          { label: "Exercises", value: `${stats.completedExercises}` },
          { label: "Total sets", value: `${stats.totalSets}` },
          { label: "Total reps", value: `${stats.totalReps}` },
          { label: "Est. calories", value: `${session.estimatedCalories || 0}` },
          { label: "Volume", value: `${session.totalVolume || 0}` },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="font-display text-xl font-bold">{item.value}</p>
          </Card>
        ))}
      </div>

      {session.personalRecords && session.personalRecords.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display font-semibold">Highlights</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {session.personalRecords.map((pr) => (
              <li key={pr}>• {pr}</li>
            ))}
            {stats.skipped > 0 && <li>• Skipped exercises: {stats.skipped}</li>}
          </ul>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="font-display font-semibold">Exercises logged</h2>
        <ul className="mt-3 space-y-2">
          {session.exercises.map((ex) => {
            const def = getExerciseById(ex.exerciseId);
            return (
              <li
                key={ex.planExerciseId}
                className="flex justify-between rounded-xl bg-muted-bg px-3 py-2 text-sm"
              >
                <span>{def?.name || ex.exerciseId}</span>
                <span className="text-muted">
                  {ex.skipped
                    ? "Skipped"
                    : `${ex.sets.filter((s) => s.completed).length} sets`}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display font-semibold">How hard was it?</h2>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-10 flex-1 rounded-xl ${
                rating === n ? "bg-accent text-accent-fg" : "bg-muted-bg"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          className="mt-3 min-h-24 w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-accent"
          placeholder="Workout notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      {related.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-display font-semibold">Suggested adjustments</h2>
          <p className="mt-1 text-xs text-muted">
            Approve to apply to your plan later, or dismiss.
          </p>
          <ul className="mt-4 space-y-3">
            {related.map((adj) => (
              <li key={adj.id} className="rounded-2xl border border-border p-3">
                <p className="text-sm font-medium">{adj.title}</p>
                <p className="mt-1 text-xs text-muted">{adj.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setAdjustmentStatus(adj.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAdjustmentStatus(adj.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 flex gap-3">
        <Link href="/workouts" className="flex-1">
          <Button fullWidth variant="outline">
            Back to plan
          </Button>
        </Link>
        <Link href="/progress" className="flex-1">
          <Button fullWidth>View progress</Button>
        </Link>
      </div>
    </div>
  );
}
