import type { WorkoutSession, TrainingAdjustment } from "@/lib/types/training";

export function estimateWorkoutCalories(
  durationMinutes: number,
  bodyWeightKg: number,
  intensity: number,
) {
  // Rough MET-style estimate
  const met = 4 + intensity * 1.2;
  return Math.round(((met * 3.5 * bodyWeightKg) / 200) * durationMinutes);
}

export function calculateSessionStats(session: WorkoutSession) {
  let totalSets = 0;
  let totalReps = 0;
  let volume = 0;
  let completedExercises = 0;
  let skipped = 0;

  for (const ex of session.exercises) {
    if (ex.skipped) {
      skipped += 1;
      continue;
    }
    const done = ex.sets.filter((s) => s.completed);
    if (done.length) completedExercises += 1;
    totalSets += done.length;
    for (const s of done) {
      totalReps += s.reps;
      volume += s.reps * s.weight;
    }
  }

  return {
    totalSets,
    totalReps,
    volume: Math.round(volume),
    completedExercises,
    skipped,
  };
}

export function recommendAdjustments(input: {
  userId: string;
  planId: string;
  session: WorkoutSession;
  recentSessions: WorkoutSession[];
}): TrainingAdjustment[] {
  const { userId, planId, session, recentSessions } = input;
  const now = new Date().toISOString();
  const recommendations: TrainingAdjustment[] = [];
  const stats = calculateSessionStats(session);

  const avgDifficulty =
    session.exercises
      .flatMap((e) => e.sets.map((s) => s.difficulty || 3))
      .reduce((a, b) => a + b, 0) /
      Math.max(
        1,
        session.exercises.flatMap((e) => e.sets).length,
      );

  if (avgDifficulty <= 2 && stats.skipped === 0) {
    recommendations.push({
      id: `adj-${Date.now()}-1`,
      userId,
      planId,
      createdAt: now,
      type: "increase-weight",
      title: "Increase working weights",
      reason:
        "You completed sets with low difficulty. Add 2.5–5% load next session on main lifts.",
      status: "pending",
    });
  }

  if (avgDifficulty >= 4.5) {
    recommendations.push({
      id: `adj-${Date.now()}-2`,
      userId,
      planId,
      createdAt: now,
      type: "reduce-weight",
      title: "Reduce load slightly",
      reason:
        "Sets felt very hard. Drop weight 5–10% to keep form crisp and hit target reps.",
      status: "pending",
    });
  }

  const pain = session.exercises.filter((e) => e.painReported);
  if (pain.length) {
    recommendations.push({
      id: `adj-${Date.now()}-3`,
      userId,
      planId,
      createdAt: now,
      type: "replace-exercise",
      title: "Replace painful exercises",
      reason: `${pain.length} exercise(s) caused discomfort. Swap to a joint-friendlier variation.`,
      status: "pending",
      details: pain.map((p) => p.exerciseId).join(", "),
    });
  }

  if ((session.recoveryLevel || 3) <= 2 || (session.sleepQuality || 3) <= 2) {
    recommendations.push({
      id: `adj-${Date.now()}-4`,
      userId,
      planId,
      createdAt: now,
      type: "reduce-volume",
      title: "Reduce volume this week",
      reason: "Recovery or sleep looks low. Cut 1 set from accessories and keep intensity moderate.",
      status: "pending",
    });
  }

  if ((session.muscleSoreness || 3) >= 4 && (session.energyLevel || 3) <= 2) {
    recommendations.push({
      id: `adj-${Date.now()}-5`,
      userId,
      planId,
      createdAt: now,
      type: "add-rest-day",
      title: "Add an extra rest day",
      reason: "High soreness + low energy — prioritize recovery before pushing progression.",
      status: "pending",
    });
  }

  const hardRecent = [session, ...recentSessions]
    .slice(0, 4)
    .filter((s) => (s.difficultyRating || 3) >= 4 && (s.recoveryLevel || 3) <= 2);
  if (hardRecent.length >= 3) {
    recommendations.push({
      id: `adj-${Date.now()}-6`,
      userId,
      planId,
      createdAt: now,
      type: "deload",
      title: "Consider a deload week",
      reason:
        "Several hard sessions with poor recovery. Reduce volume ~40% for 5–7 days.",
      status: "pending",
    });
  }

  if (avgDifficulty <= 2.2 && stats.completedExercises >= 3) {
    recommendations.push({
      id: `adj-${Date.now()}-7`,
      userId,
      planId,
      createdAt: now,
      type: "increase-reps",
      title: "Push rep progression first",
      reason:
        "For sustainable progress, add 1–2 reps before jumping weight — especially helpful for newer lifters.",
      status: "pending",
    });
  }

  return recommendations;
}
