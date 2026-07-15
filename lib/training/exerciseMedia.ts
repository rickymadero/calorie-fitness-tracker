import type { MotionPattern } from "@/lib/training/motionPatterns";
import { getMotionPattern, MOTION_LABELS } from "@/lib/training/motionPatterns";

export interface AthleteDemoMedia {
  pattern: MotionPattern;
  videoSrc: string;
  posterSrc?: string;
  label: string;
  attribution: string;
}

/**
 * One Mixkit clip per exercise ID — never reuse the same file across different
 * movements (e.g. OHP ≠ lateral raise; each chest variation is unique).
 */
const EXERCISE_CLIPS: Record<string, string> = {
  // Chest — four distinct clips
  "ex-bb-bench": "/demos/exercises/ex-bb-bench.mp4", // flat DB press
  "ex-db-bench": "/demos/exercises/ex-db-bench.mp4", // incline DB press
  "ex-machine-chest": "/demos/exercises/ex-machine-chest.mp4", // DB pullover / chest accessory
  "ex-pushup": "/demos/exercises/ex-pushup.mp4", // push-up

  // Shoulders — must stay distinct
  "ex-ohp": "/demos/exercises/ex-ohp.mp4", // barbell front-rack / overhead press
  "ex-lateral-raise": "/demos/exercises/ex-lateral-raise.mp4", // standing DBs (raise-path start)

  // Legs
  "ex-squat": "/demos/exercises/ex-squat.mp4",
  "ex-goblet-squat": "/demos/exercises/ex-goblet-squat.mp4",
  "ex-bodyweight-squat": "/demos/exercises/ex-bodyweight-squat.mp4",
  "ex-leg-press": "/demos/exercises/ex-leg-press.mp4",
  "ex-rdl": "/demos/exercises/ex-rdl.mp4",
  "ex-glute-bridge": "/demos/exercises/ex-glute-bridge.mp4",
  "ex-leg-curl": "/demos/exercises/ex-leg-curl.mp4",

  // Back
  "ex-pullup": "/demos/exercises/ex-pullup.mp4",
  "ex-lat-pulldown": "/demos/exercises/ex-lat-pulldown.mp4",
  "ex-seated-row": "/demos/exercises/ex-seated-row.mp4",
  "ex-band-row": "/demos/exercises/ex-band-row.mp4",

  // Arms
  "ex-curl": "/demos/exercises/ex-curl.mp4",
  "ex-triceps-pushdown": "/demos/exercises/ex-triceps-pushdown.mp4",

  // Core
  "ex-plank": "/demos/exercises/ex-plank.mp4",
  "ex-dead-bug": "/demos/exercises/ex-dead-bug.mp4",

  // Cardio
  "ex-bike": "/demos/exercises/ex-bike.mp4",
  "ex-walk": "/demos/exercises/ex-walk.mp4",
};

export function getAthleteDemoMedia(
  exerciseId: string,
  tags: string[] = [],
): AthleteDemoMedia {
  const pattern = getMotionPattern(exerciseId, tags);
  const videoSrc = EXERCISE_CLIPS[exerciseId];

  if (!videoSrc) {
    console.warn(`[exerciseMedia] Missing demo clip for ${exerciseId}`);
  }

  return {
    pattern,
    videoSrc: videoSrc ?? "/demos/exercises/ex-squat.mp4",
    label: MOTION_LABELS[pattern],
    attribution: "Athlete form clip · Mixkit License",
  };
}

/** All exercise IDs that have a dedicated demo file */
export function getMappedExerciseDemoIds() {
  return Object.keys(EXERCISE_CLIPS);
}
