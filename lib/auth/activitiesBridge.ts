import type { EvolveClient } from "@/lib/services/auth";
import { activitiesService } from "@/lib/services/activities";
import { activityIdMapStorage } from "@/lib/activities/activityIdMap";
import {
  mapWorkoutPostToActivity,
  mapWorkoutSessionToActivity,
  type MappedActivityBundle,
} from "@/lib/activities/mapLocalToSupabase";
import { postsStorage } from "@/lib/storage/posts";
import { trainingStorage } from "@/lib/storage/training";

export type ActivitiesBridgeStatus =
  | "migrated"
  | "skipped"
  | "partial"
  | "failed";

export type ActivitiesBridgeResult = {
  status: ActivitiesBridgeStatus;
  migrated: number;
  skipped: number;
  failed: number;
};

async function upsertMappedBundle(
  client: EvolveClient,
  userId: string,
  bundle: MappedActivityBundle,
): Promise<"migrated" | "skipped" | "failed"> {
  if (activityIdMapStorage.getSupabaseId(userId, bundle.localKey)) {
    return "skipped";
  }

  const externalId = bundle.activity.external_activity_id;
  if (externalId) {
    const { data: existing } = await activitiesService.getByExternalId(
      client,
      userId,
      bundle.activity.source ?? "manual",
      externalId,
    );
    if (existing?.id) {
      activityIdMapStorage.setMapping(userId, bundle.localKey, existing.id);
      return "skipped";
    }
  }

  const { data, error } = await activitiesService.createActivityWithMetrics(
    client,
    {
      activity: bundle.activity,
      metrics: bundle.metrics,
      splits: bundle.splits,
      heartRateZones: bundle.heartRateZones,
      routePoints: bundle.routePoints,
    },
  );

  if (error || !data?.activity?.id) {
    return "failed";
  }

  activityIdMapStorage.setMapping(userId, bundle.localKey, data.activity.id);
  return "migrated";
}

/**
 * One-time bridge: copy local post-embedded activities + gym sessions into
 * Supabase. Does not delete localStorage. Does not migrate posts.
 */
export async function runActivitiesBridge(
  client: EvolveClient,
  userId: string,
): Promise<ActivitiesBridgeResult> {
  if (activityIdMapStorage.hasMigrated(userId)) {
    return { status: "skipped", migrated: 0, skipped: 0, failed: 0 };
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const posts = postsStorage
      .getStore()
      .posts.filter((p) => p.authorId === userId);

    for (const post of posts) {
      const bundle = mapWorkoutPostToActivity(userId, post);
      const result = await upsertMappedBundle(client, userId, bundle);
      if (result === "migrated") migrated += 1;
      else if (result === "skipped") skipped += 1;
      else failed += 1;
    }

    const plans = trainingStorage.getPlans();
    const dayNameById = new Map<string, string>();
    for (const plan of plans) {
      for (const day of plan.days) {
        dayNameById.set(day.id, day.name);
      }
    }

    const sessions = trainingStorage
      .getSessions()
      .filter((s) => s.userId === userId);

    for (const session of sessions) {
      const bundle = mapWorkoutSessionToActivity(
        userId,
        session,
        dayNameById.get(session.dayId),
      );
      if (!bundle) {
        skipped += 1;
        continue;
      }
      const result = await upsertMappedBundle(client, userId, bundle);
      if (result === "migrated") migrated += 1;
      else if (result === "skipped") skipped += 1;
      else failed += 1;
    }

    // Mark complete even with some failures so we don't loop forever;
    // map entries prevent duplicate success paths on retry of partials.
    activityIdMapStorage.markMigrated(userId);

    const status: ActivitiesBridgeStatus =
      failed > 0 && migrated > 0
        ? "partial"
        : failed > 0 && migrated === 0
          ? "failed"
          : migrated > 0
            ? "migrated"
            : "skipped";

    console.info("[activitiesBridge]", {
      status,
      migrated,
      skipped,
      failed,
    });

    return { status, migrated, skipped, failed };
  } catch {
    console.info("[activitiesBridge]", { status: "failed" });
    return { status: "failed", migrated, skipped, failed };
  }
}
