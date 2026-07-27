import type { Database } from "@/lib/supabase/database.types";
import {
  mapLocalVisibility,
  type DbActivityType,
} from "@/lib/activities/mapLocalToSupabase";
import { persistableImageUrl } from "@/lib/posts/postIdMap";
import type {
  ActivityType,
  PostVisibility,
  WorkoutPost,
} from "@/lib/types/posts";

export type DbPost = Database["public"]["Tables"]["posts"]["Row"];
export type DbActivity = Database["public"]["Tables"]["activities"]["Row"];

export type ActivitySummary = Pick<
  DbActivity,
  | "id"
  | "activity_type"
  | "title"
  | "started_at"
  | "duration_seconds"
  | "distance_meters"
  | "calories"
  | "elevation_gain_meters"
  | "average_pace_seconds_per_km"
  | "average_speed_kmh"
  | "average_heart_rate"
  | "maximum_heart_rate"
>;

export type FeedPostRow = DbPost & {
  activities?: ActivitySummary | ActivitySummary[] | null;
  likes?: { count: number }[] | null;
  comments?: { count: number }[] | null;
};

/** Reverse DB activity_type → local ActivityType for feed cards. */
export function mapDbActivityTypeToLocal(
  type: DbActivityType | null | undefined,
): ActivityType {
  switch (type) {
    case "running":
    case "treadmill":
      return "running";
    case "walking":
      return "walking";
    case "cycling":
    case "indoor_cycling":
      return "cycling";
    case "swimming":
      return "swimming";
    case "hiking":
      return "hiking";
    case "strength":
      return "gym";
    case "functional":
      return "yoga";
    case "rowing":
    case "hyrox":
    case "cross_training":
    case "other":
    default:
      return "custom";
  }
}

export function mapDbVisibilityToLocal(
  visibility: Database["public"]["Enums"]["visibility_level"],
): PostVisibility {
  return visibility;
}

export function activityFromJoin(
  raw: FeedPostRow["activities"],
): ActivitySummary | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export function countFromEmbed(
  raw: { count: number }[] | null | undefined,
): number {
  if (!raw || raw.length === 0) return 0;
  return raw[0]?.count ?? 0;
}

/**
 * Map a Supabase post (+ optional activity summary) into the existing
 * WorkoutPost shape so feed/detail UI can stay unchanged.
 * Does not load route_points.
 */
export function mapRemotePostToWorkoutPost(
  row: FeedPostRow,
  opts?: {
    liked?: boolean;
    localOverlay?: Partial<WorkoutPost> | null;
  },
): WorkoutPost {
  const activity = activityFromJoin(row.activities);
  const overlay = opts?.localOverlay ?? null;
  const type =
    overlay?.type ??
    mapDbActivityTypeToLocal(activity?.activity_type) ??
    "custom";

  const distanceKm =
    overlay?.distanceKm ??
    (activity?.distance_meters != null
      ? activity.distance_meters / 1000
      : undefined);
  const durationMin =
    overlay?.durationMin ??
    (activity?.duration_seconds != null
      ? Math.round((activity.duration_seconds / 60) * 10) / 10
      : undefined);
  const paceMinPerKm =
    overlay?.paceMinPerKm ??
    (activity?.average_pace_seconds_per_km != null
      ? Math.round((activity.average_pace_seconds_per_km / 60) * 100) / 100
      : undefined);

  return {
    id: row.id,
    authorId: row.user_id,
    type,
    title: row.title || activity?.title || overlay?.title || "Workout",
    caption: row.caption ?? overlay?.caption ?? "",
    occurredAt:
      activity?.started_at ?? overlay?.occurredAt ?? row.created_at,
    createdAt: row.created_at,
    visibility: mapDbVisibilityToLocal(row.visibility),
    photoUrl:
      row.image_url ??
      overlay?.photoUrl ??
      overlay?.photos?.[0] ??
      undefined,
    photos: overlay?.photos,
    videoUrl: overlay?.videoUrl,
    distanceKm,
    durationMin,
    movingTimeMin: overlay?.movingTimeMin,
    paceMinPerKm,
    fastestPaceMinPerKm: overlay?.fastestPaceMinPerKm,
    avgSpeedKmh:
      overlay?.avgSpeedKmh ?? activity?.average_speed_kmh ?? undefined,
    maxSpeedKmh: overlay?.maxSpeedKmh,
    caloriesBurned:
      overlay?.caloriesBurned ?? activity?.calories ?? undefined,
    elevationGainM:
      overlay?.elevationGainM ??
      activity?.elevation_gain_meters ??
      undefined,
    avgHeartRate:
      overlay?.avgHeartRate ?? activity?.average_heart_rate ?? undefined,
    maxHeartRate:
      overlay?.maxHeartRate ?? activity?.maximum_heart_rate ?? undefined,
    cadence: overlay?.cadence,
    locationName: overlay?.locationName,
    route: overlay?.route,
    routePreview: overlay?.routePreview,
    routeVisible: overlay?.routeVisible,
    hideStart: overlay?.hideStart,
    hideEnd: overlay?.hideEnd,
    commentsEnabled: overlay?.commentsEnabled ?? true,
    gymSummary: overlay?.gymSummary,
    muscleGroups: overlay?.muscleGroups,
    exerciseCount: overlay?.exerciseCount,
    totalSets: overlay?.totalSets,
    totalReps: overlay?.totalReps,
    totalVolumeKg: overlay?.totalVolumeKg,
    exercises: overlay?.exercises,
    achievements: overlay?.achievements,
    splits: overlay?.splits,
    likesCount: countFromEmbed(row.likes) || overlay?.likesCount || 0,
    commentsCount:
      countFromEmbed(row.comments) || overlay?.commentsCount || 0,
  };
}

export type LocalPostInsertInput = {
  localPost: WorkoutPost;
  activityId: string | null;
};

/** Build a posts Insert row from a local WorkoutPost (no user_id — auth sets it). */
export function mapLocalPostToInsert({
  localPost,
  activityId,
}: LocalPostInsertInput): Omit<
  Database["public"]["Tables"]["posts"]["Insert"],
  "user_id"
> {
  return {
    activity_id: activityId,
    title: localPost.title.trim() || "Workout",
    caption: localPost.caption?.trim() || null,
    image_url: persistableImageUrl(
      localPost.photoUrl ?? localPost.photos?.[0],
    ),
    visibility: mapLocalVisibility(localPost.visibility),
    created_at: localPost.createdAt || new Date().toISOString(),
  };
}

/** Default feed metric keys from local activity type (before DB activity known). */
export function defaultMetricKeysForLocalType(
  type: ActivityType,
): string[] {
  switch (type) {
    case "running":
    case "walking":
      return ["distance", "average_pace", "duration", "calories"];
    case "cycling":
      return ["distance", "average_speed", "duration", "elevation_gain"];
    case "swimming":
      return ["distance", "pace_per_100m", "duration", "laps"];
    case "hiking":
      return ["distance", "elevation_gain", "duration", "calories"];
    case "gym":
    case "yoga":
      return ["duration", "total_volume", "exercises", "calories"];
    default:
      return ["duration", "calories", "distance", "average_pace"];
  }
}
