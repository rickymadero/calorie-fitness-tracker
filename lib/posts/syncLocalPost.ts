import { postsService } from "@/lib/services/posts";
import { activityIdMapStorage } from "@/lib/activities/activityIdMap";
import { syncLocalPostActivity } from "@/lib/activities/syncLocalActivity";
import {
  defaultMetricKeysForLocalType,
  mapLocalPostToInsert,
} from "@/lib/posts/mapRemoteToLocal";
import { postIdMapStorage } from "@/lib/posts/postIdMap";
import {
  explainRlsWriteError,
  formatPostgrestError,
  getAuthedClient,
} from "@/lib/supabase/ensureSession";
import type { WorkoutPost } from "@/lib/types/posts";

export type SyncLocalPostResult = {
  supabasePostId: string | null;
  activityId: string | null;
  reused: boolean;
  errorMessage?: string;
  errorFields?: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
    status?: number;
  };
};

/**
 * Dual-write a local WorkoutPost to Supabase posts (+ metrics).
 * Ensures activity exists via activity ID map / sync.
 * Idempotent via postIdMap and user+activity uniqueness.
 * Soft-fails without throwing (caller keeps local fallback).
 */
export async function syncLocalPostToSupabase(
  userId: string,
  post: WorkoutPost,
  opts?: { metricKeys?: string[] },
): Promise<SyncLocalPostResult> {
  const mapped = postIdMapStorage.getSupabaseId(userId, post.id);
  if (mapped) {
    return {
      supabasePostId: mapped,
      activityId:
        activityIdMapStorage.getSupabaseId(userId, `post:${post.id}`) ?? null,
      reused: true,
    };
  }

  try {
    // Always write as the Auth subject — never a stale localStorage id.
    const { client: supabase, userId: authUserId } = await getAuthedClient();
    if (authUserId !== userId) {
      return {
        supabasePostId: null,
        activityId: null,
        reused: false,
        errorMessage:
          "Signed-in user does not match the local session. Sign out and sign in again.",
      };
    }

    const activityId = await syncLocalPostActivity(authUserId, post);
    const insert = mapLocalPostToInsert({
      localPost: post,
      activityId,
    });

    const { data, error, reused } = await postsService.createPostIdempotent(
      supabase,
      insert,
    );

    if (error || !data?.id) {
      const fields = {
        message: error?.message ?? "Failed to create post",
        code: error?.pgCode,
        details: error?.details,
        hint: error?.hint,
        status: error?.status,
      };
      return {
        supabasePostId: null,
        activityId,
        reused: false,
        errorFields: fields,
        errorMessage: explainRlsWriteError(formatPostgrestError(fields)),
      };
    }

    postIdMapStorage.setMapping(authUserId, post.id, data.id);

    if (!reused) {
      const metricKeys =
        opts?.metricKeys ?? defaultMetricKeysForLocalType(post.type);
      await postsService.setPostMetricVisibility(
        supabase,
        data.id,
        metricKeys,
      );
    }

    return {
      supabasePostId: data.id,
      activityId,
      reused,
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    return {
      supabasePostId: null,
      activityId:
        activityIdMapStorage.getSupabaseId(userId, `post:${post.id}`) ?? null,
      reused: false,
      errorMessage: explainRlsWriteError(raw),
    };
  }
}
