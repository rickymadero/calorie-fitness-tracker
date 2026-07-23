import type { Database } from "@/lib/supabase/database.types";

export type ActivityType = Database["public"]["Enums"]["activity_type"];

/** Sport-specific default feed metrics (max 4). Used when post_metric_visibility is empty. */
export const DEFAULT_FEED_METRICS: Record<ActivityType, string[]> = {
  running: ["distance", "average_pace", "duration", "calories"],
  cycling: ["distance", "average_speed", "duration", "elevation_gain"],
  swimming: ["distance", "pace_per_100m", "duration", "laps"],
  hyrox: [
    "total_duration",
    "average_running_pace",
    "completed_stations",
    "calories",
  ],
  strength: ["duration", "total_volume", "exercises", "personal_records"],
  walking: ["distance", "average_pace", "duration", "calories"],
  hiking: ["distance", "elevation_gain", "duration", "calories"],
  functional: ["duration", "total_volume", "exercises", "calories"],
  cross_training: ["duration", "calories", "exercises", "total_volume"],
  rowing: ["distance", "average_pace", "duration", "calories"],
  indoor_cycling: ["distance", "average_speed", "duration", "calories"],
  treadmill: ["distance", "average_pace", "duration", "calories"],
  other: ["duration", "calories", "distance", "average_pace"],
};

export function resolveFeedMetricKeys(
  activityType: ActivityType | null | undefined,
  selectedKeys: string[] | null | undefined,
): string[] {
  if (selectedKeys && selectedKeys.length > 0) {
    return selectedKeys.slice(0, 4);
  }
  if (activityType && DEFAULT_FEED_METRICS[activityType]) {
    return DEFAULT_FEED_METRICS[activityType];
  }
  return DEFAULT_FEED_METRICS.other;
}
