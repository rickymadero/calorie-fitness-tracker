/** Local persistence for an in-progress or just-finished tracked workout. */

import type { TrackActivityId } from "@/lib/track/activityCatalog";
import type { WorkoutPhase } from "@/lib/track/WorkoutStateMachine";
import type { GpsSample } from "@/lib/track/gpsFilter";
import type { Split } from "@/lib/track/metrics";
import type { PaceSample } from "@/lib/track/liveMetrics";

const KEY = "evolve.track.activeWorkout";

export type TrackGoal =
  | { kind: "open" }
  | { kind: "distance"; meters: number }
  | { kind: "time"; seconds: number }
  | { kind: "calories"; kcal: number };

export type StrengthSetLog = {
  id: string;
  atMs: number;
  name: string;
  weightKg: number;
  reps: number;
};

export type ActiveWorkoutSnapshot = {
  id: string;
  userId: string;
  activityId: TrackActivityId;
  phase: WorkoutPhase;
  startedAtMs: number;
  /** Wall-clock ms accumulated while paused */
  pausedMs: number;
  /** Timestamp when current pause began, or null */
  pauseStartedAtMs: number | null;
  /** Last tick for live elapsed */
  updatedAtMs: number;
  usesGps: boolean;
  gpsDenied: boolean;
  goal: TrackGoal;
  points: GpsSample[];
  manualLaps: { atMs: number; distanceMeters: number }[];
  splits: Split[];
  /** Sparse samples for live pace/speed chart */
  paceSamples: PaceSample[];
  /** Strength session set log */
  strengthSets: StrengthSetLog[];
  /** HYROX stations completed (0–8) */
  hyroxStationsCompleted: number;
  /** Estimated cadence (spm) from last GPS window — not wearable */
  estimatedCadenceSpm: number | null;
  title: string;
  notes: string;
  privacyRouteMode: "show" | "hide_route" | "hide_start_end" | "private";
  visibility: "public" | "followers" | "private";
  /** Set when finished locally */
  endedAtMs?: number | null;
  distanceMeters: number;
  elevationGainMeters: number;
  calories: number;
  externalActivityId: string;
};

function canUse() {
  return typeof window !== "undefined";
}

export const activeWorkoutStorage = {
  load(userId: string): ActiveWorkoutSnapshot | null {
    if (!canUse() || !userId) return null;
    try {
      const raw = localStorage.getItem(`${KEY}.${userId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ActiveWorkoutSnapshot;
      if (!parsed?.id || parsed.userId !== userId) return null;
      return {
        ...parsed,
        paceSamples: parsed.paceSamples ?? [],
        strengthSets: parsed.strengthSets ?? [],
        hyroxStationsCompleted: parsed.hyroxStationsCompleted ?? 0,
        estimatedCadenceSpm: parsed.estimatedCadenceSpm ?? null,
      };
    } catch {
      return null;
    }
  },

  save(snapshot: ActiveWorkoutSnapshot) {
    if (!canUse() || !snapshot.userId) return;
    try {
      localStorage.setItem(
        `${KEY}.${snapshot.userId}`,
        JSON.stringify(snapshot),
      );
    } catch {
      /* quota */
    }
  },

  clear(userId: string) {
    if (!canUse() || !userId) return;
    try {
      localStorage.removeItem(`${KEY}.${userId}`);
    } catch {
      /* ignore */
    }
  },

  hasActive(userId: string): boolean {
    const s = this.load(userId);
    if (!s) return false;
    return (
      s.phase === "active" ||
      s.phase === "paused" ||
      s.phase === "ready" ||
      s.phase === "preparing" ||
      s.phase === "finishing"
    );
  },
};

/** Elapsed seconds excluding current open pause. */
export function computeElapsedSeconds(
  snap: ActiveWorkoutSnapshot,
  nowMs = Date.now(),
): number {
  let paused = snap.pausedMs;
  if (snap.pauseStartedAtMs != null) {
    paused += Math.max(0, nowMs - snap.pauseStartedAtMs);
  }
  const end = snap.endedAtMs ?? nowMs;
  return Math.max(0, Math.floor((end - snap.startedAtMs - paused) / 1000));
}

export function computeMovingSeconds(
  snap: ActiveWorkoutSnapshot,
  nowMs = Date.now(),
): number {
  return computeElapsedSeconds(snap, nowMs);
}
