"use client";

import { useState } from "react";
import { Flag, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDuration } from "@/lib/track/metrics";
import type { ActiveWorkoutSnapshot } from "@/lib/track/activeWorkoutStorage";

type SportExtrasProps = {
  snapshot: ActiveWorkoutSnapshot;
  elapsedSeconds: number;
  onLap: () => void;
  onLogSet: (input: {
    name: string;
    weightKg: number;
    reps: number;
  }) => void;
  onHyroxStation: () => void;
  disabled: boolean;
};

export function SportExtras({
  snapshot,
  elapsedSeconds,
  onLap,
  onLogSet,
  onHyroxStation,
  disabled,
}: SportExtrasProps) {
  const id = snapshot.activityId;

  if (id === "swimming") {
    const laps = snapshot.manualLaps;
    const lastDurations: number[] = [];
    for (let i = 0; i < laps.length; i++) {
      const start = i === 0 ? snapshot.startedAtMs : laps[i - 1]!.atMs;
      lastDurations.push(Math.max(0, (laps[i]!.atMs - start) / 1000));
    }
    const recent = lastDurations.slice(-5).reverse();

    return (
      <div className="space-y-3">
        <Button
          fullWidth
          size="lg"
          onClick={onLap}
          disabled={disabled}
          className="min-h-16 text-base"
        >
          <Flag size={20} />
          Tap lap
        </Button>
        {recent.length > 0 && (
          <div className="rounded-2xl border border-border bg-card px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Recent laps
            </p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {recent.map((sec, i) => (
                <li
                  key={`${sec}-${i}`}
                  className="rounded-lg bg-muted-bg px-2 py-1 text-sm tabular-nums"
                >
                  {formatDuration(sec)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (id === "hyrox") {
    const done = snapshot.hyroxStationsCompleted ?? 0;
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Stations
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">
            {done}
            <span className="text-lg text-muted"> / 8</span>
          </p>
        </div>
        <Button
          fullWidth
          size="lg"
          onClick={onHyroxStation}
          disabled={disabled || done >= 8}
        >
          Mark station complete
        </Button>
      </div>
    );
  }

  if (id === "strength" || id === "functional") {
    return (
      <StrengthLogger
        snapshot={snapshot}
        onLogSet={onLogSet}
        disabled={disabled}
      />
    );
  }

  void elapsedSeconds;
  return null;
}

function StrengthLogger({
  snapshot,
  onLogSet,
  disabled,
}: {
  snapshot: ActiveWorkoutSnapshot;
  onLogSet: SportExtrasProps["onLogSet"];
  disabled: boolean;
}) {
  const last = snapshot.strengthSets?.[snapshot.strengthSets.length - 1];
  const [name, setName] = useState(last?.name ?? "Squat");
  const [weight, setWeight] = useState(String(last?.weightKg ?? 60));
  const [reps, setReps] = useState(String(last?.reps ?? 8));

  const volume = (snapshot.strengthSets ?? []).reduce(
    (sum, s) => sum + s.weightKg * s.reps,
    0,
  );

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Log set
        </p>
        <p className="text-xs tabular-nums text-muted">
          {snapshot.strengthSets?.length ?? 0} sets · {Math.round(volume)} kg
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          className="col-span-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise"
          disabled={disabled}
        />
        <input
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          disabled={disabled}
          aria-label="Weight kg"
        />
        <input
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="reps"
          disabled={disabled}
          aria-label="Reps"
        />
        <Button
          disabled={disabled}
          onClick={() => {
            onLogSet({
              name,
              weightKg: Number(weight) || 0,
              reps: Number(reps) || 0,
            });
          }}
        >
          <Plus size={16} />
          Add
        </Button>
      </div>
    </div>
  );
}
