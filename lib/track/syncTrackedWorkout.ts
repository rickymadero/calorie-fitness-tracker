/** Map tracked session → Supabase activity bundle and sync. */

import { activitiesService } from "@/lib/services/activities";
import { activityIdMapStorage } from "@/lib/activities/activityIdMap";
import type {
  ActivityInsertPayload,
  ActivitySplitInput,
  RoutePointInput,
} from "@/lib/activities/mapLocalToSupabase";
import { getAuthedClient } from "@/lib/supabase/ensureSession";
import { getTrackActivity } from "@/lib/track/activityCatalog";
import {
  type ActiveWorkoutSnapshot,
  computeElapsedSeconds,
  computeMovingSeconds,
} from "@/lib/track/activeWorkoutStorage";
import {
  paceSecondsPerKm,
  speedKmh,
  pathDistanceMeters,
} from "@/lib/track/metrics";
import { postsStorage } from "@/lib/storage/posts";
import { syncLocalPostToSupabase } from "@/lib/posts/syncLocalPost";
import type { ActivityType, WorkoutPost } from "@/lib/types/posts";
import { trimRoutePrivacy } from "@/lib/track/routePrivacy";

function mapTrackIdToLocalPostType(
  id: ActiveWorkoutSnapshot["activityId"],
): ActivityType {
  switch (id) {
    case "running":
      return "running";
    case "walking":
      return "walking";
    case "cycling":
    case "indoor_cycling":
      return "cycling";
    case "hiking":
      return "hiking";
    case "swimming":
      return "swimming";
    case "strength":
      return "gym";
    case "yoga":
      return "yoga";
    case "sports":
      return "sports";
    default:
      return "custom";
  }
}

export function snapshotToActivityPayload(
  snap: ActiveWorkoutSnapshot,
  userId: string,
): {
  activity: ActivityInsertPayload;
  splits: ActivitySplitInput[];
  routePoints: RoutePointInput[];
} {
  const def = getTrackActivity(snap.activityId);
  const elapsed = computeElapsedSeconds(snap);
  const moving = computeMovingSeconds(snap);
  const points = snap.points.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
    altitude: p.altitude,
    recordedAt: p.recordedAt,
  }));
  const distance =
    snap.distanceMeters > 0
      ? snap.distanceMeters
      : pathDistanceMeters(points);
  const avgPace = paceSecondsPerKm(distance, moving);
  const avgSpeed = speedKmh(distance, moving);
  let bestPace: number | null = null;
  for (const s of snap.splits) {
    if (s.avgPaceSecondsPerKm == null) continue;
    if (bestPace == null || s.avgPaceSecondsPerKm < bestPace) {
      bestPace = s.avgPaceSecondsPerKm;
    }
  }
  let maxSpeed: number | null = null;
  for (const s of snap.splits) {
    if (s.avgSpeedKmh == null) continue;
    if (maxSpeed == null || s.avgSpeedKmh > maxSpeed) maxSpeed = s.avgSpeedKmh;
  }

  const privacy = snap.privacyRouteMode;
  const routeForUpload =
    privacy === "hide_route" || privacy === "private"
      ? []
      : trimRoutePrivacy(snap.points, privacy);

  const activity: ActivityInsertPayload = {
    user_id: userId,
    activity_type: def.dbType,
    title: snap.title || def.id,
    description: snap.notes || null,
    source: "evolve_phone",
    external_activity_id: snap.externalActivityId,
    device_name: "phone",
    is_wearable_imported: false,
    started_at: new Date(snap.startedAtMs).toISOString(),
    ended_at: snap.endedAtMs
      ? new Date(snap.endedAtMs).toISOString()
      : new Date().toISOString(),
    duration_seconds: elapsed,
    moving_seconds: moving,
    paused_seconds: Math.round(snap.pausedMs / 1000),
    distance_meters: distance,
    calories: snap.calories || null,
    elevation_gain_meters: snap.elevationGainMeters || null,
    average_pace_seconds_per_km: avgPace,
    average_speed_kmh: avgSpeed,
    best_pace_seconds_per_km: bestPace,
    max_speed_kmh: maxSpeed,
    status: "completed",
    privacy_route_mode: privacy,
    visibility: snap.visibility,
  };

  const splits: ActivitySplitInput[] = snap.splits.map((s) => ({
    split_index: s.splitNumber,
    distance_meters: s.distanceMeters,
    duration_seconds: s.elapsedSeconds,
    pace_seconds_per_km: s.avgPaceSecondsPerKm,
    elevation_change_meters: s.elevationChangeMeters,
  }));

  const routePoints: RoutePointInput[] = routeForUpload.map((p, i) => ({
    sequence_number: i,
    latitude: Number(p.latitude.toFixed(6)),
    longitude: Number(p.longitude.toFixed(6)),
    elevation_meters: p.altitude ?? null,
    recorded_at: new Date(p.recordedAt).toISOString(),
    accuracy_meters: p.accuracyMeters,
    speed_mps: p.speedMps,
  }));

  return { activity, splits, routePoints };
}

export type SyncTrackedResult = {
  activityId: string | null;
  postId: string | null;
  errorMessage?: string;
};

export async function syncTrackedWorkout(opts: {
  userId: string;
  snapshot: ActiveWorkoutSnapshot;
  publish: boolean;
}): Promise<SyncTrackedResult> {
  const localKey = `track:${opts.snapshot.id}`;
  const existing = activityIdMapStorage.getSupabaseId(opts.userId, localKey);
  if (existing && !opts.publish) {
    return { activityId: existing, postId: null };
  }

  try {
    const { client, userId: authId } = await getAuthedClient();
    if (authId !== opts.userId) {
      return {
        activityId: null,
        postId: null,
        errorMessage: "Signed-in user mismatch.",
      };
    }

    let activityId = existing;
    if (!activityId) {
      const byExt = await activitiesService.getByExternalId(
        client,
        authId,
        "evolve_phone",
        opts.snapshot.externalActivityId,
      );
      if (byExt.data?.id) {
        activityId = byExt.data.id;
        activityIdMapStorage.setMapping(authId, localKey, activityId);
      }
    }

    if (!activityId) {
      const { activity, splits, routePoints } = snapshotToActivityPayload(
        opts.snapshot,
        authId,
      );
      const created = await activitiesService.createActivityWithMetrics(
        client,
        { activity, splits, routePoints },
      );
      if (created.error || !created.data?.activity?.id) {
        return {
          activityId: null,
          postId: null,
          errorMessage:
            created.error?.message ?? "Failed to save tracked workout.",
        };
      }
      activityId = created.data.activity.id;
      activityIdMapStorage.setMapping(authId, localKey, activityId);
    }

    if (!opts.publish) {
      return { activityId, postId: null };
    }

    const elapsed = computeElapsedSeconds(opts.snapshot);
    const distanceKm = (opts.snapshot.distanceMeters || 0) / 1000;
    const localType = mapTrackIdToLocalPostType(opts.snapshot.activityId);
    const hideStartEnd = opts.snapshot.privacyRouteMode === "hide_start_end";
    const post = postsStorage.createPost(authId, {
      type: localType,
      title: opts.snapshot.title || localType,
      caption: opts.snapshot.notes || "",
      occurredAt: new Date(opts.snapshot.startedAtMs).toISOString(),
      visibility: opts.snapshot.visibility,
      distanceKm: distanceKm > 0 ? distanceKm : undefined,
      durationMin: Math.max(1, Math.round(elapsed / 60)),
      caloriesBurned: opts.snapshot.calories || undefined,
      elevationGainM: opts.snapshot.elevationGainMeters || undefined,
      routeVisible: opts.snapshot.privacyRouteMode === "show" || hideStartEnd,
      hideStart: hideStartEnd,
      hideEnd: hideStartEnd,
      route:
        opts.snapshot.privacyRouteMode === "hide_route" ||
        opts.snapshot.privacyRouteMode === "private"
          ? undefined
          : opts.snapshot.points.map((p) => ({
              lat: p.latitude,
              lng: p.longitude,
            })),
    });

    activityIdMapStorage.setMapping(authId, `post:${post.id}`, activityId);
    const sync = await syncLocalPostToSupabase(authId, post);
    return {
      activityId,
      postId: sync.supabasePostId ?? post.id,
      errorMessage: sync.errorMessage,
    };
  } catch (e) {
    return {
      activityId: null,
      postId: null,
      errorMessage: e instanceof Error ? e.message : "Sync failed.",
    };
  }
}

// Re-export for callers that create posts after track
export type { WorkoutPost };
