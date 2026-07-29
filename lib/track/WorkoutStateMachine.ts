/** Explicit workout lifecycle transitions. */

export type WorkoutPhase =
  | "idle"
  | "preparing"
  | "ready"
  | "active"
  | "paused"
  | "finishing"
  | "completed"
  | "syncing"
  | "sync_failed"
  | "discarded";

const ALLOWED: Record<WorkoutPhase, WorkoutPhase[]> = {
  idle: ["preparing"],
  preparing: ["ready", "idle"],
  ready: ["active", "preparing", "idle"],
  active: ["paused", "finishing"],
  paused: ["active", "finishing"],
  finishing: ["completed", "active", "discarded"],
  completed: ["syncing", "discarded"],
  syncing: ["completed", "sync_failed"],
  sync_failed: ["syncing", "completed", "discarded"],
  discarded: ["idle"],
};

export function canTransition(
  from: WorkoutPhase,
  to: WorkoutPhase,
): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function transition(
  from: WorkoutPhase,
  to: WorkoutPhase,
): WorkoutPhase {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid workout transition: ${from} → ${to}`);
  }
  return to;
}

export function canAddGpsPoints(phase: WorkoutPhase): boolean {
  return phase === "active";
}

export function canResume(phase: WorkoutPhase): boolean {
  return phase === "paused";
}

export function canFinish(phase: WorkoutPhase): boolean {
  return phase === "active" || phase === "paused";
}
