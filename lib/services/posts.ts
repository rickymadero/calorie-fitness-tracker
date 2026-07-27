import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";
import { resolveFeedMetricKeys } from "@/lib/services/feedMetrics";
import type { ActivityType as DbActivityType } from "@/lib/services/feedMetrics";
import {
  activityFromJoin,
  mapRemotePostToWorkoutPost,
  type FeedPostRow,
} from "@/lib/posts/mapRemoteToLocal";
import type { WorkoutPost } from "@/lib/types/posts";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

/** Public create payload — user_id is always taken from the client session. */
export type CreatePostInput = Omit<PostInsert, "user_id">;

export type PostsServiceErrorCode =
  | "not_found"
  | "unauthorized"
  | "validation"
  | "conflict"
  | "unknown";

export class PostsServiceError extends Error {
  readonly code: PostsServiceErrorCode;
  readonly cause?: unknown;
  readonly pgCode?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly status?: number;

  constructor(
    code: PostsServiceErrorCode,
    message: string,
    cause?: unknown,
    meta?: {
      pgCode?: string;
      details?: string;
      hint?: string;
      status?: number;
    },
  ) {
    super(message);
    this.name = "PostsServiceError";
    this.code = code;
    this.cause = cause;
    this.pgCode = meta?.pgCode;
    this.details = meta?.details;
    this.hint = meta?.hint;
    this.status = meta?.status;
  }
}

const FEED_SELECT = `
  *,
  activities (
    id,
    activity_type,
    title,
    started_at,
    duration_seconds,
    distance_meters,
    calories,
    elevation_gain_meters,
    average_pace_seconds_per_km,
    average_speed_kmh,
    average_heart_rate,
    maximum_heart_rate
  ),
  likes(count),
  comments(count)
`;

function toServiceError(
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
    status?: number;
  } | null,
  fallback: string,
): PostsServiceError {
  const msg = error?.message || fallback;
  const meta = {
    pgCode: error?.code,
    details: error?.details,
    hint: error?.hint,
    status: error?.status,
  };
  if (error?.code === "23505") {
    return new PostsServiceError("conflict", msg, error, meta);
  }
  if (error?.code === "42501" || /permission|policy/i.test(msg)) {
    return new PostsServiceError("unauthorized", msg, error, meta);
  }
  return new PostsServiceError("unknown", msg, error, meta);
}

/**
 * Resolve the Auth subject from the same client used for Data API writes.
 * Prefer getClaims(); fall back to getUser().
 */
async function authUserIdFromClient(
  client: EvolveClient,
): Promise<string | null> {
  const { data: claimsData } = await client.auth.getClaims();
  if (typeof claimsData?.claims?.sub === "string") {
    return claimsData.claims.sub;
  }
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Insert without Prefer: return=representation.
 *
 * posts_select uses can_view_post(id), which re-queries posts. PostgREST
 * INSERT…RETURNING applies that SELECT policy during the same statement and
 * returns 42501 even when posts_insert_own WITH CHECK already passed.
 * A plain insert + follow-up select by id succeeds for the owner.
 */
async function insertPostThenFetch(
  client: EvolveClient,
  row: PostInsert,
): Promise<{
  data: Database["public"]["Tables"]["posts"]["Row"] | null;
  error: PostsServiceError | null;
}> {
  const id = row.id ?? crypto.randomUUID();
  const { error, status } = await client.from("posts").insert({ ...row, id });
  if (error) {
    return {
      data: null,
      error: toServiceError(
        {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status,
        },
        "Failed to create post",
      ),
    };
  }

  const { data, error: fetchError, status: fetchStatus } = await client
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return {
      data: null,
      error: toServiceError(
        {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
          status: fetchStatus,
        },
        "Post inserted but failed to reload",
      ),
    };
  }
  if (!data) {
    return {
      data: null,
      error: new PostsServiceError(
        "unknown",
        "Post inserted but could not be reloaded under SELECT policy",
      ),
    };
  }
  return { data, error: null };
}

export type FeedPage = {
  posts: WorkoutPost[];
  likedPostIds: string[];
  nextOffset: number;
  hasMore: boolean;
};

export const postsService = {
  /**
   * Create a post as the authenticated client user.
   * Does not accept user_id — it is always taken from the session on `client`.
   */
  async createPost(client: EvolveClient, row: CreatePostInput) {
    const userId = await authUserIdFromClient(client);
    if (!userId) {
      return {
        data: null,
        error: new PostsServiceError(
          "unauthorized",
          "Not signed in — cannot create post",
        ),
      };
    }

    if (row.activity_id) {
      const { data: activity, error: activityError } = await client
        .from("activities")
        .select("id")
        .eq("id", row.activity_id)
        .eq("user_id", userId)
        .maybeSingle();
      if (activityError) {
        return {
          data: null,
          error: toServiceError(activityError, "Failed to verify activity"),
        };
      }
      if (!activity) {
        return {
          data: null,
          error: new PostsServiceError(
            "unauthorized",
            "Linked activity not found or not owned by the signed-in user",
          ),
        };
      }
    }

    return insertPostThenFetch(client, { ...row, user_id: userId });
  },

  /**
   * Idempotent create when an activity is already linked: reuse existing
   * post for the same user+activity instead of inserting a duplicate.
   */
  async createPostIdempotent(
    client: EvolveClient,
    row: CreatePostInput,
  ): Promise<{
    data: Database["public"]["Tables"]["posts"]["Row"] | null;
    error: PostsServiceError | null;
    reused: boolean;
  }> {
    const userId = await authUserIdFromClient(client);
    if (!userId) {
      return {
        data: null,
        error: new PostsServiceError(
          "unauthorized",
          "Not signed in — cannot create post",
        ),
        reused: false,
      };
    }

    if (row.activity_id) {
      const { data: existing } = await client
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .eq("activity_id", row.activity_id)
        .maybeSingle();
      if (existing) {
        return { data: existing, error: null, reused: true };
      }
    }
    const created = await this.createPost(client, row);
    return { ...created, reused: false };
  },

  async getPostById(
    client: EvolveClient,
    id: string,
  ): Promise<{
    data: WorkoutPost | null;
    error: PostsServiceError | null;
  }> {
    const { data, error } = await client
      .from("posts")
      .select(FEED_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to load post"),
      };
    }
    if (!data) {
      return {
        data: null,
        error: new PostsServiceError("not_found", "Post not found"),
      };
    }
    return {
      data: mapRemotePostToWorkoutPost(data as FeedPostRow),
      error: null,
    };
  },

  async getFeedPosts(
    client: EvolveClient,
    opts: {
      viewerId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: FeedPage | null; error: PostsServiceError | null }> {
    const limit = opts.limit ?? 20;
    const offset = opts.offset ?? 0;

    const { data, error } = await client
      .from("posts")
      .select(FEED_SELECT)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to load feed"),
      };
    }

    const rows = (data ?? []) as FeedPostRow[];
    const postIds = rows.map((r) => r.id);

    let likedPostIds: string[] = [];
    if (postIds.length > 0) {
      const { data: likes } = await client
        .from("likes")
        .select("post_id")
        .eq("user_id", opts.viewerId)
        .in("post_id", postIds);
      likedPostIds = (likes ?? []).map((l) => l.post_id);
    }

    const posts = rows.map((row) => mapRemotePostToWorkoutPost(row));

    return {
      data: {
        posts,
        likedPostIds,
        nextOffset: offset + rows.length,
        hasMore: rows.length === limit,
      },
      error: null,
    };
  },

  async listPostsByAuthor(
    client: EvolveClient,
    authorId: string,
    opts?: { limit?: number; offset?: number },
  ) {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;
    const { data, error } = await client
      .from("posts")
      .select(FEED_SELECT)
      .eq("user_id", authorId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null as WorkoutPost[] | null,
        error: toServiceError(error, "Failed to load author posts"),
      };
    }
    return {
      data: ((data ?? []) as FeedPostRow[]).map((row) =>
        mapRemotePostToWorkoutPost(row),
      ),
      error: null,
    };
  },

  async updatePost(
    client: EvolveClient,
    id: string,
    userId: string,
    patch: PostUpdate,
  ) {
    const { data, error } = await client
      .from("posts")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to update post"),
      };
    }
    if (!data) {
      return {
        data: null,
        error: new PostsServiceError("not_found", "Post not found"),
      };
    }
    return { data, error: null };
  },

  async deletePost(client: EvolveClient, id: string, userId: string) {
    const { error } = await client
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      return { error: toServiceError(error, "Failed to delete post") };
    }
    return { error: null };
  },

  async likePost(client: EvolveClient, userId: string, postId: string) {
    const { data, error } = await client
      .from("likes")
      .upsert(
        { user_id: userId, post_id: postId },
        { onConflict: "user_id,post_id", ignoreDuplicates: true },
      )
      .select()
      .maybeSingle();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to like post"),
      };
    }
    return { data, error: null };
  },

  async unlikePost(client: EvolveClient, userId: string, postId: string) {
    const { error } = await client
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) {
      return { error: toServiceError(error, "Failed to unlike post") };
    }
    return { error: null };
  },

  async hasLiked(client: EvolveClient, userId: string, postId: string) {
    const { data, error } = await client
      .from("likes")
      .select("post_id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();
    if (error) {
      return {
        data: false,
        error: toServiceError(error, "Failed to check like"),
      };
    }
    return { data: Boolean(data), error: null };
  },

  async addComment(
    client: EvolveClient,
    input: {
      postId: string;
      userId: string;
      body: string;
      parentCommentId?: string | null;
      createdAt?: string;
    },
  ) {
    const body = input.body.trim();
    if (!body) {
      return {
        data: null,
        error: new PostsServiceError("validation", "Comment cannot be empty"),
      };
    }
    const { data, error } = await client
      .from("comments")
      .insert({
        post_id: input.postId,
        user_id: input.userId,
        body,
        parent_comment_id: input.parentCommentId ?? null,
        ...(input.createdAt ? { created_at: input.createdAt } : {}),
      })
      .select()
      .single();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to add comment"),
      };
    }
    return { data, error: null };
  },

  async updateComment(
    client: EvolveClient,
    commentId: string,
    userId: string,
    body: string,
  ) {
    const trimmed = body.trim();
    if (!trimmed) {
      return {
        data: null,
        error: new PostsServiceError("validation", "Comment cannot be empty"),
      };
    }
    const { data, error } = await client
      .from("comments")
      .update({ body: trimmed })
      .eq("id", commentId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to update comment"),
      };
    }
    if (!data) {
      return {
        data: null,
        error: new PostsServiceError("not_found", "Comment not found"),
      };
    }
    return { data, error: null };
  },

  async deleteComment(client: EvolveClient, commentId: string) {
    // RLS allows author or post owner
    const { error } = await client
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      return { error: toServiceError(error, "Failed to delete comment") };
    }
    return { error: null };
  },

  async getPostComments(client: EvolveClient, postId: string) {
    const { data, error } = await client
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to load comments"),
      };
    }
    return { data: data ?? [], error: null };
  },

  async setPostMetricVisibility(
    client: EvolveClient,
    postId: string,
    metricKeys: string[],
  ) {
    const keys = metricKeys.slice(0, 4);
    const { error: delError } = await client
      .from("post_metric_visibility")
      .delete()
      .eq("post_id", postId);
    if (delError) {
      return {
        error: toServiceError(delError, "Failed to clear feed metrics"),
      };
    }
    if (keys.length === 0) return { error: null };
    const { error } = await client.from("post_metric_visibility").insert(
      keys.map((metric_key, display_order) => ({
        post_id: postId,
        metric_key,
        display_order,
      })),
    );
    if (error) {
      return {
        error: toServiceError(error, "Failed to set feed metrics"),
      };
    }
    return { error: null };
  },

  async getPostMetricVisibility(
    client: EvolveClient,
    postId: string,
    activityType?: DbActivityType | null,
  ) {
    const { data, error } = await client
      .from("post_metric_visibility")
      .select("metric_key, display_order")
      .eq("post_id", postId)
      .order("display_order", { ascending: true });
    if (error) {
      return {
        data: resolveFeedMetricKeys(activityType, null),
        error: toServiceError(error, "Failed to load feed metrics"),
      };
    }
    const selected = (data ?? []).map((r) => r.metric_key);
    return {
      data: resolveFeedMetricKeys(activityType, selected),
      error: null,
    };
  },

  async bookmarkPost(client: EvolveClient, userId: string, postId: string) {
    const { data, error } = await client
      .from("post_bookmarks")
      .upsert(
        { user_id: userId, post_id: postId },
        { onConflict: "user_id,post_id", ignoreDuplicates: true },
      )
      .select()
      .maybeSingle();
    if (error) {
      return {
        data: null,
        error: toServiceError(error, "Failed to bookmark post"),
      };
    }
    return { data, error: null };
  },

  async unbookmarkPost(
    client: EvolveClient,
    userId: string,
    postId: string,
  ) {
    const { error } = await client
      .from("post_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) {
      return { error: toServiceError(error, "Failed to remove bookmark") };
    }
    return { error: null };
  },

  async listBookmarks(
    client: EvolveClient,
    userId: string,
    opts?: { limit?: number; offset?: number },
  ) {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;
    const { data: bookmarks, error } = await client
      .from("post_bookmarks")
      .select("post_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        data: null as WorkoutPost[] | null,
        error: toServiceError(error, "Failed to load bookmarks"),
      };
    }

    const ids = (bookmarks ?? []).map((b) => b.post_id);
    if (ids.length === 0) return { data: [], error: null };

    const { data: posts, error: postsError } = await client
      .from("posts")
      .select(FEED_SELECT)
      .in("id", ids);

    if (postsError) {
      return {
        data: null,
        error: toServiceError(postsError, "Failed to load bookmarked posts"),
      };
    }

    const byId = new Map(
      ((posts ?? []) as FeedPostRow[]).map((row) => [
        row.id,
        mapRemotePostToWorkoutPost(row),
      ]),
    );
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((p): p is WorkoutPost => Boolean(p));

    return { data: ordered, error: null };
  },

  async listViewerBookmarkedIds(
    client: EvolveClient,
    userId: string,
    postIds: string[],
  ) {
    if (postIds.length === 0) return { data: [] as string[], error: null };
    const { data, error } = await client
      .from("post_bookmarks")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds);
    if (error) {
      return {
        data: [] as string[],
        error: toServiceError(error, "Failed to load bookmark state"),
      };
    }
    return { data: (data ?? []).map((r) => r.post_id), error: null };
  },

  /** Resolve activity type for a feed post (for metric defaults). */
  activityTypeFromFeedRow(row: FeedPostRow): DbActivityType | null {
    return activityFromJoin(row.activities)?.activity_type ?? null;
  },

  // --- Back-compat thin wrappers used by older callers ---
  async create(client: EvolveClient, row: CreatePostInput) {
    return this.createPost(client, row);
  },

  async getById(client: EvolveClient, id: string) {
    return client.from("posts").select("*").eq("id", id).maybeSingle();
  },

  async listRecent(client: EvolveClient, limit = 20) {
    return client
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  async setFeedMetrics(
    client: EvolveClient,
    postId: string,
    metricKeys: string[],
  ) {
    return this.setPostMetricVisibility(client, postId, metricKeys);
  },

  async getFeedMetricKeys(
    client: EvolveClient,
    postId: string,
    activityType?: DbActivityType | null,
  ) {
    const result = await this.getPostMetricVisibility(
      client,
      postId,
      activityType,
    );
    return result.data;
  },

  async delete(client: EvolveClient, id: string) {
    return client.from("posts").delete().eq("id", id);
  },
};
