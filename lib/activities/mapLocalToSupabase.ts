import type { Database } from "@/lib/supabase/database.types";
import type {
  ActivityType,
  PostVisibility,
  WorkoutPost,
} from "@/lib/types/posts";
import type { WorkoutSession } from "@/lib/types/training";

export type DbActivityType = Database["public"]["Enums"]["activity_type"];
export type DbVisibility = Database["public"]["Enums"]["visibility_level"];
export type DbMetricCategory = Database["public"]["Enums"]["metric_category"];
export type DbActivitySource = Database["public"]["Enums"]["activity_source"];

export type ActivityMetricInput = {
  metric_key: string;
  label: string;
  numeric_value?: number | null;
  text_value?: string | null;
  unit?: string | null;
  category?: DbMetricCategory;
  source?: DbActivitySource;
};

export type ActivitySplitInput = {
  split_index: number;
  distance_meters?: number | null;
  duration_seconds?: number | null;
  pace_seconds_per_km?: number | null;
  average_heart_rate?: number | null;
  elevation_change_meters?: number | null;
};

export type RoutePointInput = {
  sequence_number: number;
  latitude: number;
  longitude: number;
  elevation_meters?: number | null;
  recorded_at?: string | null;
};

export type HeartRateZoneInput = {
  zone_number: number;
  minimum_bpm?: number | null;
  maximum_bpm?: number | null;
  duration_seconds?: number | null;
  percentage?: number | null;
};

export type ActivityInsertPayload = {
  user_id: string;
  activity_type: DbActivityType;
  title: string;
  description?: string | null;
  source?: DbActivitySource;
  external_activity_id?: string | null;
  device_name?: string | null;
  is_wearable_imported?: boolean;
  started_at?: string | null;
  duration_seconds?: number | null;
  distance_meters?: number | null;
  calories?: number | null;
  elevation_gain_meters?: number | null;
  average_heart_rate?: number | null;
  maximum_heart_rate?: number | null;
  average_pace_seconds_per_km?: number | null;
  average_speed_kmh?: number | null;
  visibility?: DbVisibility;
  created_at?: string;
};

export type MappedActivityBundle = {
  activity: ActivityInsertPayload;
  metrics: ActivityMetricInput[];
  splits: ActivitySplitInput[];
  routePoints: RoutePointInput[];
  heartRateZones: HeartRateZoneInput[];
  localKey: string;
};

/** Centralized local ActivityType → DB activity_type. */
export function mapLocalActivityType(type: ActivityType): DbActivityType {
  switch (type) {
    case "running":
      return "running";
    case "walking":
      return "walking";
    case "cycling":
      return "cycling";
    case "swimming":
      return "swimming";
    case "hiking":
      return "hiking";
    case "gym":
      return "strength";
    case "yoga":
      return "functional";
    case "sports":
    case "custom":
      return "other";
    default:
      return "other";
  }
}

/**
 * Centralized post visibility → DB visibility_level.
 * `selected` maps to private (not public) — change here if product rules shift.
 */
export function mapLocalVisibility(visibility: PostVisibility): DbVisibility {
  switch (visibility) {
    case "public":
      return "public";
    case "followers":
      return "followers";
    case "private":
    case "selected":
      return "private";
    default:
      return "private";
  }
}

export function localPostExternalId(postId: string): string {
  return `local:post:${postId}`;
}

export function localSessionExternalId(sessionId: string): string {
  return `local:session:${sessionId}`;
}

export function nonNegative(
  value: number | null | undefined,
): number | null {
  if (value == null || Number.isNaN(value)) return null;
  if (value < 0) return null;
  return value;
}

export function kmToMeters(km: number | null | undefined): number | null {
  const v = nonNegative(km);
  return v == null ? null : v * 1000;
}

export function minutesToSeconds(
  min: number | null | undefined,
): number | null {
  const v = nonNegative(min);
  return v == null ? null : Math.round(v * 60);
}

export function paceMinPerKmToSeconds(
  pace: number | null | undefined,
): number | null {
  const v = nonNegative(pace);
  return v == null ? null : v * 60;
}

function pushMetric(
  metrics: ActivityMetricInput[],
  metric_key: string,
  label: string,
  opts: {
    numeric_value?: number | null;
    text_value?: string | null;
    unit?: string | null;
    category?: DbMetricCategory;
  },
) {
  const num = opts.numeric_value;
  const text = opts.text_value?.trim() || null;
  if (num == null && !text) return;
  if (num != null && num < 0) return;
  metrics.push({
    metric_key,
    label,
    numeric_value: num ?? null,
    text_value: text,
    unit: opts.unit ?? null,
    category: opts.category ?? "basic",
    source: "manual",
  });
}

/** Build Supabase payload from a local WorkoutPost (does not invent metrics). */
export function mapWorkoutPostToActivity(
  userId: string,
  post: WorkoutPost,
): MappedActivityBundle {
  const durationSec =
    minutesToSeconds(post.movingTimeMin) ??
    minutesToSeconds(post.durationMin);

  const metrics: ActivityMetricInput[] = [];
  pushMetric(metrics, "cadence", "Cadence", {
    numeric_value: nonNegative(post.cadence),
    unit: "spm",
  });
  pushMetric(metrics, "fastest_pace", "Fastest pace", {
    numeric_value: paceMinPerKmToSeconds(post.fastestPaceMinPerKm),
    unit: "s/km",
  });
  pushMetric(metrics, "max_speed", "Max speed", {
    numeric_value: nonNegative(post.maxSpeedKmh),
    unit: "km/h",
  });
  pushMetric(metrics, "location_name", "Location", {
    text_value: post.locationName ?? null,
  });
  pushMetric(metrics, "gym_summary", "Gym summary", {
    text_value: post.gymSummary ?? null,
  });
  if (post.muscleGroups?.length) {
    pushMetric(metrics, "muscle_groups", "Muscle groups", {
      text_value: post.muscleGroups.join(", "),
    });
  }
  pushMetric(metrics, "exercise_count", "Exercises", {
    numeric_value: nonNegative(post.exerciseCount),
  });
  pushMetric(metrics, "total_sets", "Total sets", {
    numeric_value: nonNegative(post.totalSets),
  });
  pushMetric(metrics, "total_reps", "Total reps", {
    numeric_value: nonNegative(post.totalReps),
  });
  pushMetric(metrics, "training_volume", "Training volume", {
    numeric_value: nonNegative(post.totalVolumeKg),
    unit: "kg",
  });
  if (post.exercises?.length) {
    pushMetric(metrics, "exercises", "Exercises", {
      text_value: JSON.stringify(post.exercises),
    });
  }
  if (post.achievements?.length) {
    pushMetric(metrics, "achievements", "Achievements", {
      text_value: JSON.stringify(post.achievements),
    });
  }

  const splits: ActivitySplitInput[] = (post.splits ?? [])
    .map((s, i) => ({
      split_index: i + 1,
      distance_meters: kmToMeters(s.km),
      pace_seconds_per_km: paceMinPerKmToSeconds(s.paceMinPerKm),
    }))
    .filter((s) => s.distance_meters != null || s.pace_seconds_per_km != null);

  const routeSrc = post.route?.length
    ? post.route
    : post.routePreview?.length
      ? post.routePreview
      : [];
  const startedMs = post.occurredAt
    ? Date.parse(post.occurredAt)
    : Number.NaN;
  const routePoints: RoutePointInput[] = [];
  for (let i = 0; i < routeSrc.length; i++) {
    const p = routeSrc[i];
    const lat = Number(p.lat);
    const lng = Number(p.lng);
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      continue;
    }
    const recorded_at =
      !Number.isNaN(startedMs) && typeof p.t === "number" && p.t >= 0
        ? new Date(startedMs + p.t * 1000).toISOString()
        : null;
    routePoints.push({
      sequence_number: i,
      latitude: lat,
      longitude: lng,
      elevation_meters: p.elev != null ? nonNegative(p.elev) : null,
      recorded_at,
    });
  }

  return {
    localKey: `post:${post.id}`,
    activity: {
      user_id: userId,
      activity_type: mapLocalActivityType(post.type),
      title: post.title?.trim() || "Activity",
      description: post.caption?.trim() || null,
      source: "manual",
      external_activity_id: localPostExternalId(post.id),
      is_wearable_imported: false,
      started_at: post.occurredAt || null,
      duration_seconds: durationSec,
      distance_meters: kmToMeters(post.distanceKm),
      calories:
        post.caloriesBurned != null
          ? Math.round(nonNegative(post.caloriesBurned) ?? 0) || null
          : null,
      elevation_gain_meters: nonNegative(post.elevationGainM),
      average_heart_rate:
        post.avgHeartRate != null
          ? Math.round(nonNegative(post.avgHeartRate) ?? 0) || null
          : null,
      maximum_heart_rate:
        post.maxHeartRate != null
          ? Math.round(nonNegative(post.maxHeartRate) ?? 0) || null
          : null,
      average_pace_seconds_per_km: paceMinPerKmToSeconds(post.paceMinPerKm),
      average_speed_kmh: nonNegative(post.avgSpeedKmh),
      visibility: mapLocalVisibility(post.visibility),
      created_at: post.createdAt || undefined,
    },
    metrics,
    splits,
    routePoints,
    heartRateZones: [],
  };
}

/** Build strength activity from a completed local gym training session. */
export function mapWorkoutSessionToActivity(
  userId: string,
  session: WorkoutSession,
  dayName?: string,
): MappedActivityBundle | null {
  if (!session.completedAt && !session.durationMinutes && !session.totalVolume) {
    // Still migrate if it has a startedAt (in-progress may be skipped)
    if (!session.startedAt) return null;
  }

  const metrics: ActivityMetricInput[] = [];
  const completedSets = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed).length,
    0,
  );
  const totalReps = session.exercises.reduce(
    (n, ex) =>
      n +
      ex.sets.filter((s) => s.completed).reduce((r, s) => r + (s.reps || 0), 0),
    0,
  );

  pushMetric(metrics, "exercise_count", "Exercises", {
    numeric_value: nonNegative(session.exercises.length),
  });
  pushMetric(metrics, "total_sets", "Total sets", {
    numeric_value: nonNegative(completedSets),
  });
  pushMetric(metrics, "total_reps", "Total reps", {
    numeric_value: nonNegative(totalReps),
  });
  pushMetric(metrics, "training_volume", "Training volume", {
    numeric_value: nonNegative(session.totalVolume),
    unit: "kg",
  });
  pushMetric(metrics, "energy_level", "Energy level", {
    numeric_value: nonNegative(session.energyLevel),
  });
  pushMetric(metrics, "difficulty_rating", "Difficulty", {
    numeric_value: nonNegative(session.difficultyRating),
  });
  if (session.personalRecords?.length) {
    pushMetric(metrics, "personal_records", "Personal records", {
      text_value: session.personalRecords.join(", "),
    });
  }
  if (session.exercises.length) {
    pushMetric(metrics, "exercises", "Exercises", {
      text_value: JSON.stringify(
        session.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          skipped: ex.skipped,
          sets: ex.sets
            .filter((s) => s.completed)
            .map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps,
              weight: s.weight,
            })),
        })),
      ),
    });
  }
  if (session.notes?.trim()) {
    pushMetric(metrics, "session_notes", "Notes", {
      text_value: session.notes.trim(),
    });
  }

  const title = dayName?.trim() || "Strength session";

  return {
    localKey: `session:${session.id}`,
    activity: {
      user_id: userId,
      activity_type: "strength",
      title,
      description: session.notes?.trim() || null,
      source: "manual",
      external_activity_id: localSessionExternalId(session.id),
      is_wearable_imported: false,
      started_at: session.startedAt || session.completedAt || null,
      duration_seconds: minutesToSeconds(session.durationMinutes),
      calories:
        session.estimatedCalories != null
          ? Math.round(nonNegative(session.estimatedCalories) ?? 0) || null
          : null,
      visibility: "private",
      created_at: session.completedAt || session.startedAt || undefined,
    },
    metrics,
    splits: [],
    routePoints: [],
    heartRateZones: [],
  };
}
