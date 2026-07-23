import { createClient } from "@/lib/supabase/client";
import { activitiesService } from "@/lib/services/activities";
import { activityIdMapStorage } from "@/lib/activities/activityIdMap";
import {
  mapWorkoutPostToActivity,
  mapWorkoutSessionToActivity,
} from "@/lib/activities/mapLocalToSupabase";
import type { WorkoutPost } from "@/lib/types/posts";
import type { WorkoutSession } from "@/lib/types/training";

/**
 * Dual-write a local WorkoutPost into Supabase activities.
 * Idempotent via localKey map + external_activity_id.
 * Never deletes local data. Failures are soft (returns null).
 */
export async function syncLocalPostActivity(
  userId: string,
  post: WorkoutPost,
): Promise<string | null> {
  const bundle = mapWorkoutPostToActivity(userId, post);
  const existing = activityIdMapStorage.getSupabaseId(userId, bundle.localKey);
  if (existing) return existing;

  try {
    const supabase = createClient();
    if (bundle.activity.external_activity_id) {
      const { data: row } = await activitiesService.getByExternalId(
        supabase,
        userId,
        bundle.activity.source ?? "manual",
        bundle.activity.external_activity_id,
      );
      if (row?.id) {
        activityIdMapStorage.setMapping(userId, bundle.localKey, row.id);
        return row.id;
      }
    }

    const { data, error } = await activitiesService.createActivityWithMetrics(
      supabase,
      {
        activity: bundle.activity,
        metrics: bundle.metrics,
        splits: bundle.splits,
        heartRateZones: bundle.heartRateZones,
        routePoints: bundle.routePoints,
      },
    );
    if (error || !data?.activity?.id) return null;
    activityIdMapStorage.setMapping(userId, bundle.localKey, data.activity.id);
    return data.activity.id;
  } catch {
    return null;
  }
}

export async function syncLocalSessionActivity(
  userId: string,
  session: WorkoutSession,
  dayName?: string,
): Promise<string | null> {
  const bundle = mapWorkoutSessionToActivity(userId, session, dayName);
  if (!bundle) return null;

  const existing = activityIdMapStorage.getSupabaseId(userId, bundle.localKey);
  if (existing) return existing;

  try {
    const supabase = createClient();
    if (bundle.activity.external_activity_id) {
      const { data: row } = await activitiesService.getByExternalId(
        supabase,
        userId,
        bundle.activity.source ?? "manual",
        bundle.activity.external_activity_id,
      );
      if (row?.id) {
        activityIdMapStorage.setMapping(userId, bundle.localKey, row.id);
        return row.id;
      }
    }

    const { data, error } = await activitiesService.createActivityWithMetrics(
      supabase,
      {
        activity: bundle.activity,
        metrics: bundle.metrics,
        splits: bundle.splits,
        heartRateZones: bundle.heartRateZones,
        routePoints: bundle.routePoints,
      },
    );
    if (error || !data?.activity?.id) return null;
    activityIdMapStorage.setMapping(userId, bundle.localKey, data.activity.id);
    return data.activity.id;
  } catch {
    return null;
  }
}
