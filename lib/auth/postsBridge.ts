import type { EvolveClient } from "@/lib/services/auth";
import { postsService } from "@/lib/services/posts";
import { activityIdMapStorage } from "@/lib/activities/activityIdMap";
import {
  defaultMetricKeysForLocalType,
  mapLocalPostToInsert,
} from "@/lib/posts/mapRemoteToLocal";
import {
  isSeedAuthorId,
  isSeedPostId,
  postIdMapStorage,
} from "@/lib/posts/postIdMap";
import { postsStorage } from "@/lib/storage/posts";

export type PostsBridgeStatus =
  | "migrated"
  | "skipped"
  | "partial"
  | "failed";

export type PostsBridgeResult = {
  status: PostsBridgeStatus;
  migrated: number;
  skipped: number;
  partial: number;
  failed: number;
  likesMigrated: number;
  commentsMigrated: number;
  bookmarksMigrated: number;
  unresolvedActivityLinks: number;
};

/**
 * One-time bridge: copy the authenticated user's local posts, likes,
 * comments, and bookmarks into Supabase.
 *
 * - Does not migrate seed/demo posts or invent fake users
 * - Uses activity ID map for activity_id linking
 * - Idempotent via postIdMap + unique constraints
 * - Never deletes localStorage
 * - Does not log captions / bodies / GPS
 */
export async function runPostsBridge(
  client: EvolveClient,
  userId: string,
): Promise<PostsBridgeResult> {
  if (postIdMapStorage.hasMigrated(userId)) {
    return {
      status: "skipped",
      migrated: 0,
      skipped: 0,
      partial: 0,
      failed: 0,
      likesMigrated: 0,
      commentsMigrated: 0,
      bookmarksMigrated: 0,
      unresolvedActivityLinks: 0,
    };
  }

  let migrated = 0;
  let skipped = 0;
  let partial = 0;
  let failed = 0;
  let likesMigrated = 0;
  let commentsMigrated = 0;
  let bookmarksMigrated = 0;
  let unresolvedActivityLinks = 0;

  const store = postsStorage.getStore();
  const ownedPosts = store.posts.filter(
    (p) =>
      p.authorId === userId &&
      !isSeedAuthorId(p.authorId) &&
      !isSeedPostId(p.id),
  );

  const localToRemote = new Map<string, string>();

  try {
    for (const post of ownedPosts) {
      const existingMap = postIdMapStorage.getSupabaseId(userId, post.id);
      if (existingMap) {
        localToRemote.set(post.id, existingMap);
        skipped += 1;
        continue;
      }

      const activityId =
        activityIdMapStorage.getSupabaseId(userId, `post:${post.id}`) ?? null;
      if (!activityId) {
        unresolvedActivityLinks += 1;
      }

      const insert = mapLocalPostToInsert({
        localPost: post,
        activityId,
      });

      const { data, error, reused } = await postsService.createPostIdempotent(
        client,
        insert,
      );

      if (error || !data?.id) {
        failed += 1;
        continue;
      }

      postIdMapStorage.setMapping(userId, post.id, data.id);
      localToRemote.set(post.id, data.id);

      if (!reused) {
        await postsService.setPostMetricVisibility(
          client,
          data.id,
          defaultMetricKeysForLocalType(post.type),
        );
        if (activityId) migrated += 1;
        else partial += 1;
      } else {
        skipped += 1;
        if (!activityId) partial += 1;
      }
    }

    // Likes: only rows where liker is the authenticated user
    for (const like of store.likes) {
      if (like.userId !== userId) continue;
      if (isSeedAuthorId(like.userId)) continue;
      const remotePostId =
        localToRemote.get(like.postId) ??
        postIdMapStorage.getSupabaseId(userId, like.postId);
      if (!remotePostId) {
        skipped += 1;
        continue;
      }
      const { error } = await postsService.likePost(
        client,
        userId,
        remotePostId,
      );
      if (error) failed += 1;
      else likesMigrated += 1;
    }

    // Comments: only comments authored by the authenticated user
    // Parent replies: only when parent also maps (same user thread) or skip parent
    const commentIdMap = new Map<string, string>();
    const ownComments = store.comments
      .filter((c) => c.authorId === userId && !isSeedAuthorId(c.authorId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    // First pass: top-level
    for (const comment of ownComments.filter((c) => !c.parentId)) {
      const remotePostId =
        localToRemote.get(comment.postId) ??
        postIdMapStorage.getSupabaseId(userId, comment.postId);
      if (!remotePostId) {
        skipped += 1;
        continue;
      }
      const { data, error } = await postsService.addComment(client, {
        postId: remotePostId,
        userId,
        body: comment.body,
        createdAt: comment.createdAt,
      });
      if (error || !data?.id) {
        failed += 1;
        continue;
      }
      commentIdMap.set(comment.id, data.id);
      commentsMigrated += 1;
    }

    // Second pass: replies (only if parent mapped or parent is own)
    for (const comment of ownComments.filter((c) => c.parentId)) {
      const remotePostId =
        localToRemote.get(comment.postId) ??
        postIdMapStorage.getSupabaseId(userId, comment.postId);
      if (!remotePostId) {
        skipped += 1;
        continue;
      }
      const parentRemote = comment.parentId
        ? commentIdMap.get(comment.parentId)
        : undefined;
      const { data, error } = await postsService.addComment(client, {
        postId: remotePostId,
        userId,
        body: comment.body,
        parentCommentId: parentRemote ?? null,
        createdAt: comment.createdAt,
      });
      if (error || !data?.id) {
        failed += 1;
        continue;
      }
      commentIdMap.set(comment.id, data.id);
      commentsMigrated += 1;
    }

    // Bookmarks: only for authenticated user on posts they can map
    for (const saved of store.saved) {
      if (saved.userId !== userId) continue;
      const remotePostId =
        localToRemote.get(saved.postId) ??
        postIdMapStorage.getSupabaseId(userId, saved.postId);
      if (!remotePostId) {
        // May be a seed post — skip without failing the bridge
        skipped += 1;
        continue;
      }
      const { error } = await postsService.bookmarkPost(
        client,
        userId,
        remotePostId,
      );
      if (error) failed += 1;
      else bookmarksMigrated += 1;
    }

    postIdMapStorage.markMigrated(userId);

    const status: PostsBridgeStatus =
      failed > 0 && migrated + partial === 0
        ? "failed"
        : failed > 0 || partial > 0 || unresolvedActivityLinks > 0
          ? "partial"
          : migrated > 0 ||
              likesMigrated > 0 ||
              commentsMigrated > 0 ||
              bookmarksMigrated > 0
            ? "migrated"
            : "skipped";

    if (typeof console !== "undefined") {
      console.info("[evolve.postsBridge]", {
        status,
        migrated,
        skipped,
        partial,
        failed,
        likesMigrated,
        commentsMigrated,
        bookmarksMigrated,
        unresolvedActivityLinks,
      });
    }

    return {
      status,
      migrated,
      skipped,
      partial,
      failed,
      likesMigrated,
      commentsMigrated,
      bookmarksMigrated,
      unresolvedActivityLinks,
    };
  } catch {
    return {
      status: "failed",
      migrated,
      skipped,
      partial,
      failed: failed + 1,
      likesMigrated,
      commentsMigrated,
      bookmarksMigrated,
      unresolvedActivityLinks,
    };
  }
}
