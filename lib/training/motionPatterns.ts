export type MotionPattern =
  | "bench-press"
  | "push-up"
  | "squat"
  | "hinge"
  | "pull-up"
  | "row"
  | "pulldown"
  | "overhead-press"
  | "lateral-raise"
  | "curl"
  | "triceps"
  | "plank"
  | "dead-bug"
  | "bridge"
  | "leg-curl"
  | "leg-press"
  | "walk"
  | "bike";

const BY_ID: Record<string, MotionPattern> = {
  "ex-bb-bench": "bench-press",
  "ex-db-bench": "bench-press",
  "ex-pushup": "push-up",
  "ex-machine-chest": "bench-press",
  "ex-squat": "squat",
  "ex-goblet-squat": "squat",
  "ex-bodyweight-squat": "squat",
  "ex-leg-press": "leg-press",
  "ex-rdl": "hinge",
  "ex-glute-bridge": "bridge",
  "ex-leg-curl": "leg-curl",
  "ex-pullup": "pull-up",
  "ex-lat-pulldown": "pulldown",
  "ex-seated-row": "row",
  "ex-band-row": "row",
  "ex-ohp": "overhead-press",
  "ex-lateral-raise": "lateral-raise",
  "ex-plank": "plank",
  "ex-dead-bug": "dead-bug",
  "ex-bike": "bike",
  "ex-walk": "walk",
  "ex-curl": "curl",
  "ex-triceps-pushdown": "triceps",
};

export function getMotionPattern(
  exerciseId: string,
  tags: string[] = [],
): MotionPattern {
  if (BY_ID[exerciseId]) return BY_ID[exerciseId];
  if (tags.includes("hinge") || tags.includes("posterior")) return "hinge";
  if (tags.includes("pull")) return "row";
  if (tags.includes("push")) return "bench-press";
  if (tags.includes("cardio")) return "walk";
  if (tags.includes("core")) return "plank";
  return "squat";
}

export const MOTION_LABELS: Record<MotionPattern, string> = {
  "bench-press": "Pressing pattern",
  "push-up": "Push-up pattern",
  squat: "Squat pattern",
  hinge: "Hip hinge pattern",
  "pull-up": "Pull-up pattern",
  row: "Row pattern",
  pulldown: "Pulldown pattern",
  "overhead-press": "Overhead press",
  "lateral-raise": "Raise pattern",
  curl: "Curl pattern",
  triceps: "Extension pattern",
  plank: "Isometric hold",
  "dead-bug": "Core control",
  bridge: "Bridge pattern",
  "leg-curl": "Leg curl",
  "leg-press": "Leg press",
  walk: "Gait pattern",
  bike: "Pedal pattern",
};
