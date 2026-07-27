"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { postsService } from "@/lib/services/posts";
import { postsStorage } from "@/lib/storage/posts";
import { syncLocalPostToSupabase } from "@/lib/posts/syncLocalPost";
import { pruneStalePostIdMappings } from "@/lib/posts/pruneStalePostIdMap";
import {
  nextCommentPreview,
  removeFromCommentPreview,
} from "@/lib/posts/mapRemoteToLocal";
import {
  isSeedAuthorId,
  isSeedPostId,
  isSupabasePostId,
  postIdMapStorage,
} from "@/lib/posts/postIdMap";
import type {
  CreatePostInput,
  PostComment,
  PostCommentPreview,
  WorkoutPost,
} from "@/lib/types/posts";
import { SEED_POSTS } from "@/lib/mock/seedPosts";

export type FeedLoadState = "idle" | "loading" | "ready" | "error";

interface PostsContextValue {
  tick: number;
  refresh: () => void;
  feedStatus: FeedLoadState;
  feedError: string | null;
  feedHasMore: boolean;
  loadMoreFeed: () => Promise<void>;
  followingFeed: () => WorkoutPost[];
  homeFeed: () => WorkoutPost[];
  publicFeed: () => WorkoutPost[];
  postsByAuthor: (authorId: string, limit?: number) => WorkoutPost[];
  getPost: (postId: string) => WorkoutPost | null;
  ensurePost: (postId: string) => Promise<WorkoutPost | null>;
  createPost: (input: CreatePostInput) => WorkoutPost | null;
  /** Dual-write local + Supabase; returns local post (id may stay local until sync). */
  createPostAsync: (input: CreatePostInput) => Promise<{
    post: WorkoutPost | null;
    supabasePostId: string | null;
    error?: string;
  }>;
  deletePost: (postId: string) => boolean;
  deletePostAsync: (postId: string) => Promise<boolean>;
  hasLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => { liked: boolean; likesCount: number };
  hasSaved: (postId: string) => boolean;
  toggleSave: (postId: string) => { saved: boolean };
  listSavedPosts: () => WorkoutPost[];
  commentsFor: (postId: string) => PostComment[];
  addComment: (
    postId: string,
    body: string,
    parentId?: string,
  ) => PostComment | null;
  deleteComment: (commentId: string) => boolean;
  authorStats: (authorId: string) => ReturnType<typeof postsStorage.authorStats>;
  weekStats: (authorId: string) => ReturnType<typeof postsStorage.weekStats>;
}

const PostsContext = createContext<PostsContextValue | null>(null);

const FEED_PAGE = 20;

function localOverlayFor(
  userId: string | undefined,
  supabasePostId: string,
): Partial<WorkoutPost> | null {
  if (!userId) return null;
  const localId = postIdMapStorage.getLocalId(userId, supabasePostId);
  if (!localId) return null;
  const local = postsStorage.getPost(localId, userId);
  if (!local) return null;
  return {
    videoUrl: local.videoUrl,
    photos: local.photos,
    photoUrl: local.photoUrl,
    route: local.route,
    routePreview: local.routePreview,
    routeVisible: local.routeVisible,
    hideStart: local.hideStart,
    hideEnd: local.hideEnd,
    gymSummary: local.gymSummary,
    exercises: local.exercises,
    muscleGroups: local.muscleGroups,
    achievements: local.achievements,
    splits: local.splits,
    locationName: local.locationName,
    type: local.type,
  };
}

function enrichWithLocal(
  userId: string | undefined,
  posts: WorkoutPost[],
): WorkoutPost[] {
  return posts.map((p) => {
    const overlay = localOverlayFor(userId, p.id);
    if (!overlay) return p;
    return { ...p, ...overlay, id: p.id, authorId: p.authorId };
  });
}

function demoSeedFeed(): WorkoutPost[] {
  return [...SEED_POSTS].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const [remotePosts, setRemotePosts] = useState<WorkoutPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, PostComment[]>
  >({});
  const [feedStatus, setFeedStatus] = useState<FeedLoadState>("idle");
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedOffset, setFeedOffset] = useState(0);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const loadingRef = useRef(false);
  /** Blocks ensurePost / feed reload from resurrecting a just-deleted post. */
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const prunedMapForUserRef = useRef<string | null>(null);
  const userId = user?.id;

  const markDeletedIds = useCallback((...ids: (string | undefined | null)[]) => {
    for (const id of ids) {
      if (id) deletedIdsRef.current.add(id);
    }
  }, []);

  const mergeRemotePage = useCallback(
    (
      posts: WorkoutPost[],
      liked: string[],
      saved: string[],
      mode: "replace" | "append",
    ) => {
      const enriched = enrichWithLocal(userId, posts).filter(
        (p) => !deletedIdsRef.current.has(p.id),
      );
      setRemotePosts((prev) => {
        if (mode === "replace") return enriched;
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        for (const p of enriched) {
          if (!seen.has(p.id)) next.push(p);
        }
        return next;
      });
      setLikedIds((prev) => {
        const next = mode === "replace" ? new Set<string>() : new Set(prev);
        for (const id of liked) next.add(id);
        return next;
      });
      setSavedIds((prev) => {
        const next = mode === "replace" ? new Set<string>() : new Set(prev);
        for (const id of saved) next.add(id);
        return next;
      });
    },
    [userId],
  );

  const loadFeed = useCallback(
    async (mode: "replace" | "append") => {
      if (!userId) {
        setRemotePosts([]);
        setLikedIds(new Set());
        setSavedIds(new Set());
        setCommentsByPost({});
        setFeedStatus("ready");
        setFeedError(null);
        setFeedHasMore(false);
        return;
      }
      if (loadingRef.current) return;
      loadingRef.current = true;
      if (mode === "replace") {
        setFeedStatus("loading");
        setFeedError(null);
      }
      try {
        const supabase = createClient();
        const offset = mode === "replace" ? 0 : feedOffset;
        const { data, error } = await postsService.getFeedPosts(supabase, {
          viewerId: userId,
          limit: FEED_PAGE,
          offset,
        });
        if (error || !data) {
          setFeedStatus("error");
          setFeedError(error?.message ?? "Failed to load feed");
          return;
        }
        const { data: bookmarked } =
          await postsService.listViewerBookmarkedIds(
            supabase,
            userId,
            data.posts.map((p) => p.id),
          );
        mergeRemotePage(
          data.posts,
          data.likedPostIds,
          bookmarked ?? [],
          mode,
        );

        // Once per signed-in user: drop map entries for posts gone from Supabase.
        if (
          mode === "replace" &&
          prunedMapForUserRef.current !== userId
        ) {
          prunedMapForUserRef.current = userId;
          void pruneStalePostIdMappings(supabase, userId).then((result) => {
            if (result.removed > 0) refresh();
          });
        }

        if (mode === "replace") {
          const { data: savedPosts } = await postsService.listBookmarks(
            supabase,
            userId,
            { limit: 50, offset: 0 },
          );
          if (savedPosts && savedPosts.length > 0) {
            const enrichedSaved = enrichWithLocal(userId, savedPosts).filter(
              (p) => !deletedIdsRef.current.has(p.id),
            );
            setRemotePosts((prev) => {
              const seen = new Set(prev.map((p) => p.id));
              const next = [...prev];
              for (const p of enrichedSaved) {
                if (!seen.has(p.id)) next.push(p);
              }
              return next;
            });
            setSavedIds(new Set(enrichedSaved.map((p) => p.id)));
          }
        }

        setFeedOffset(data.nextOffset);
        setFeedHasMore(data.hasMore);
        setFeedStatus("ready");
        setFeedError(null);
      } catch (err) {
        setFeedStatus("error");
        setFeedError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        loadingRef.current = false;
        refresh();
      }
    },
    [userId, feedOffset, mergeRemotePage, refresh],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Yield so feed status updates are not sync setState inside the effect body.
      await Promise.resolve();
      if (cancelled) return;
      await loadFeed("replace");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when auth user changes
  }, [userId]);

  const loadMoreFeed = useCallback(async () => {
    if (!feedHasMore || feedStatus === "loading") return;
    await loadFeed("append");
  }, [feedHasMore, feedStatus, loadFeed]);

  const resolveRemoteId = useCallback(
    (postId: string): string => {
      if (!userId) return postId;
      if (isSupabasePostId(postId)) return postId;
      return postIdMapStorage.getSupabaseId(userId, postId) ?? postId;
    },
    [userId],
  );

  const homeFeedPosts = useCallback((): WorkoutPost[] => {
    void tick;
    if (!userId) {
      // Logged-out preview: demo seed only
      return demoSeedFeed();
    }

    // Own local posts that have not been mirrored into the remote feed yet
    // (e.g. RLS write failed). Once mapped to Supabase, only show via remotePosts
    // so a remote delete cannot resurrect a local ghost copy.
    const pendingLocal = postsStorage
      .getStore()
      .posts.filter((p) => {
        if (p.authorId !== userId) return false;
        if (isSeedAuthorId(p.authorId) || isSeedPostId(p.id)) return false;
        if (postIdMapStorage.getSupabaseId(userId, p.id)) return false;
        if (remotePosts.some((r) => r.id === p.id)) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const remoteVisible = remotePosts.filter(
      (p) => !deletedIdsRef.current.has(p.id),
    );
    if (remoteVisible.length > 0) {
      return [...pendingLocal, ...remoteVisible];
    }
    if (pendingLocal.length > 0) {
      return pendingLocal;
    }
    // Empty real feed → demo only (clearly separate from production data)
    if (feedStatus === "ready" || feedStatus === "error") {
      return demoSeedFeed();
    }
    return [];
  }, [tick, userId, remotePosts, feedStatus]);

  const value = useMemo<PostsContextValue>(() => {
    void tick;
    const viewerId = user?.id ?? null;

    return {
      tick,
      refresh,
      feedStatus,
      feedError,
      feedHasMore,
      loadMoreFeed,
      followingFeed: () => homeFeedPosts(),
      homeFeed: () => homeFeedPosts(),
      publicFeed: () => {
        const remote = remotePosts.filter((p) => p.visibility === "public");
        if (remote.length > 0) return remote;
        if (!viewerId) return demoSeedFeed();
        return demoSeedFeed();
      },
      postsByAuthor: (authorId, limit = 20) => {
        const fromRemote = remotePosts
          .filter(
            (p) =>
              p.authorId === authorId && !deletedIdsRef.current.has(p.id),
          )
          .slice(0, limit);
        if (fromRemote.length > 0) return fromRemote;
        if (isSeedAuthorId(authorId)) {
          return postsStorage.listPostsByAuthor(authorId, viewerId, limit);
        }
        return postsStorage
          .listPostsByAuthor(authorId, viewerId, limit)
          .filter((p) => !deletedIdsRef.current.has(p.id));
      },
      getPost: (postId) => {
        if (deletedIdsRef.current.has(postId)) return null;
        const remote = remotePosts.find((p) => p.id === postId);
        if (remote) return remote;
        const mapped =
          viewerId && !isSupabasePostId(postId)
            ? postIdMapStorage.getSupabaseId(viewerId, postId)
            : undefined;
        if (mapped) {
          if (deletedIdsRef.current.has(mapped)) return null;
          const found = remotePosts.find((p) => p.id === mapped);
          if (found) return found;
        }
        return postsStorage.getPost(postId, viewerId);
      },
      ensurePost: async (postId) => {
        if (deletedIdsRef.current.has(postId)) return null;
        const existing = remotePosts.find((p) => p.id === postId);
        if (existing) return existing;
        const mappedLocal =
          viewerId && !isSupabasePostId(postId)
            ? postIdMapStorage.getSupabaseId(viewerId, postId)
            : undefined;
        const remoteId = mappedLocal ?? postId;
        if (
          deletedIdsRef.current.has(remoteId) ||
          (mappedLocal && deletedIdsRef.current.has(mappedLocal))
        ) {
          return null;
        }
        if (!isSupabasePostId(remoteId)) {
          return postsStorage.getPost(postId, viewerId);
        }
        try {
          const supabase = createClient();
          const { data, error } = await postsService.getPostById(
            supabase,
            remoteId,
          );
          if (error || !data) {
            return postsStorage.getPost(postId, viewerId);
          }
          if (deletedIdsRef.current.has(data.id)) return null;
          const enriched = enrichWithLocal(viewerId ?? undefined, [data])[0]!;
          setRemotePosts((prev) => {
            if (deletedIdsRef.current.has(enriched.id)) return prev;
            if (prev.some((p) => p.id === enriched.id)) return prev;
            return [...prev, enriched];
          });
          if (viewerId) {
            const { data: liked } = await postsService.hasLiked(
              supabase,
              viewerId,
              remoteId,
            );
            if (liked) {
              setLikedIds((prev) => new Set(prev).add(remoteId));
            }
          }
          refresh();
          return enriched;
        } catch {
          return postsStorage.getPost(postId, viewerId);
        }
      },
      createPost: (input) => {
        if (!user) return null;
        const post = postsStorage.createPost(user.id, input);
        refresh();
        return post;
      },
      createPostAsync: async (input) => {
        if (!user) {
          return {
            post: null,
            supabasePostId: null,
            error: "Not signed in",
          };
        }
        const post = postsStorage.createPost(user.id, input);
        refresh();
        const sync = await syncLocalPostToSupabase(user.id, post);
        if (sync.supabasePostId) {
          const overlay = localOverlayFor(user.id, sync.supabasePostId);
          const remoteShape: WorkoutPost = {
            ...post,
            id: sync.supabasePostId,
            ...(overlay ?? {}),
            commentsCount: post.commentsCount ?? 0,
            commentPreview: [],
          };
          setRemotePosts((prev) => {
            if (prev.some((p) => p.id === sync.supabasePostId)) return prev;
            return [remoteShape, ...prev];
          });
          refresh();
        }
        return {
          post,
          supabasePostId: sync.supabasePostId,
          error: sync.errorMessage,
        };
      },
      deletePost: (postId) => {
        if (!user) return false;
        const remoteId = resolveRemoteId(postId);
        const localId =
          postIdMapStorage.getLocalId(user.id, remoteId) ??
          (!isSupabasePostId(postId) ? postId : undefined);

        // Tombstone first so ensurePost cannot re-fetch + re-add mid-delete.
        markDeletedIds(postId, remoteId, localId);

        // Detail pages use the Supabase UUID after sync; localStorage still
        // stores the original local id — delete both sides.
        let removedLocal = false;
        if (localId) {
          removedLocal = postsStorage.deletePost(localId, user.id);
        }
        if (!removedLocal && postId !== localId) {
          removedLocal = postsStorage.deletePost(postId, user.id);
        }

        postIdMapStorage.removeMapping(user.id, {
          localPostId: localId,
          supabasePostId: isSupabasePostId(remoteId) ? remoteId : undefined,
        });

        let removedRemote = false;
        if (isSupabasePostId(remoteId) || remotePosts.some((p) => p.id === postId)) {
          setRemotePosts((prev) =>
            prev.filter(
              (p) =>
                p.id !== remoteId &&
                p.id !== postId &&
                p.id !== localId,
            ),
          );
          removedRemote = true;
        }
        if (isSupabasePostId(remoteId)) {
          void (async () => {
            try {
              const supabase = createClient();
              await postsService.deletePost(supabase, remoteId, user.id);
            } catch {
              /* local already removed */
            }
          })();
        }

        const ok = removedLocal || removedRemote;
        if (ok) refresh();
        return ok;
      },
      deletePostAsync: async (postId) => {
        if (!user) return false;
        const remoteId = resolveRemoteId(postId);
        const localId =
          postIdMapStorage.getLocalId(user.id, remoteId) ??
          (!isSupabasePostId(postId) ? postId : undefined);

        markDeletedIds(postId, remoteId, localId);

        if (localId) postsStorage.deletePost(localId, user.id);
        if (postId !== localId) postsStorage.deletePost(postId, user.id);

        postIdMapStorage.removeMapping(user.id, {
          localPostId: localId,
          supabasePostId: isSupabasePostId(remoteId) ? remoteId : undefined,
        });

        setRemotePosts((prev) =>
          prev.filter(
            (p) =>
              p.id !== remoteId &&
              p.id !== postId &&
              p.id !== localId,
          ),
        );
        refresh();

        if (isSupabasePostId(remoteId)) {
          try {
            const supabase = createClient();
            const { error } = await postsService.deletePost(
              supabase,
              remoteId,
              user.id,
            );
            if (error) return false;
          } catch {
            return false;
          }
        }
        return true;
      },
      hasLiked: (postId) => {
        const remoteId = resolveRemoteId(postId);
        if (isSupabasePostId(remoteId)) return likedIds.has(remoteId);
        return user ? postsStorage.hasLiked(postId, user.id) : false;
      },
      toggleLike: (postId) => {
        if (!user) return { liked: false, likesCount: 0 };
        const remoteId = resolveRemoteId(postId);
        if (!isSupabasePostId(remoteId)) {
          const res = postsStorage.toggleLike(postId, user.id);
          refresh();
          return res;
        }

        const wasLiked = likedIds.has(remoteId);
        const post = remotePosts.find((p) => p.id === remoteId);
        const prevCount = post?.likesCount ?? 0;
        const nextLiked = !wasLiked;
        const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

        setLikedIds((prev) => {
          const next = new Set(prev);
          if (nextLiked) next.add(remoteId);
          else next.delete(remoteId);
          return next;
        });
        setRemotePosts((prev) =>
          prev.map((p) =>
            p.id === remoteId ? { ...p, likesCount: nextCount } : p,
          ),
        );
        refresh();

        void (async () => {
          try {
            const supabase = createClient();
            const result = nextLiked
              ? await postsService.likePost(supabase, user.id, remoteId)
              : await postsService.unlikePost(supabase, user.id, remoteId);
            if (result.error) {
              setLikedIds((prev) => {
                const next = new Set(prev);
                if (wasLiked) next.add(remoteId);
                else next.delete(remoteId);
                return next;
              });
              setRemotePosts((prev) =>
                prev.map((p) =>
                  p.id === remoteId ? { ...p, likesCount: prevCount } : p,
                ),
              );
              refresh();
            }
          } catch {
            setLikedIds((prev) => {
              const next = new Set(prev);
              if (wasLiked) next.add(remoteId);
              else next.delete(remoteId);
              return next;
            });
            setRemotePosts((prev) =>
              prev.map((p) =>
                p.id === remoteId ? { ...p, likesCount: prevCount } : p,
              ),
            );
            refresh();
          }
        })();

        return { liked: nextLiked, likesCount: nextCount };
      },
      hasSaved: (postId) => {
        const remoteId = resolveRemoteId(postId);
        if (isSupabasePostId(remoteId)) return savedIds.has(remoteId);
        return user ? postsStorage.hasSaved(postId, user.id) : false;
      },
      toggleSave: (postId) => {
        if (!user) return { saved: false };
        const remoteId = resolveRemoteId(postId);
        if (!isSupabasePostId(remoteId)) {
          const res = postsStorage.toggleSave(postId, user.id);
          refresh();
          return res;
        }
        const wasSaved = savedIds.has(remoteId);
        const nextSaved = !wasSaved;
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (nextSaved) next.add(remoteId);
          else next.delete(remoteId);
          return next;
        });
        refresh();
        void (async () => {
          try {
            const supabase = createClient();
            const result = nextSaved
              ? await postsService.bookmarkPost(supabase, user.id, remoteId)
              : await postsService.unbookmarkPost(supabase, user.id, remoteId);
            if (result.error) {
              setSavedIds((prev) => {
                const next = new Set(prev);
                if (wasSaved) next.add(remoteId);
                else next.delete(remoteId);
                return next;
              });
              refresh();
            }
          } catch {
            setSavedIds((prev) => {
              const next = new Set(prev);
              if (wasSaved) next.add(remoteId);
              else next.delete(remoteId);
              return next;
            });
            refresh();
          }
        })();
        return { saved: nextSaved };
      },
      listSavedPosts: () => {
        if (!user) return [];
        const fromRemote = remotePosts.filter((p) => savedIds.has(p.id));
        if (fromRemote.length > 0 || savedIds.size > 0) return fromRemote;
        return postsStorage.listSaved(user.id);
      },
      commentsFor: (postId) => {
        const remoteId = resolveRemoteId(postId);
        if (isSupabasePostId(remoteId) && commentsByPost[remoteId]) {
          return commentsByPost[remoteId]!;
        }
        if (isSupabasePostId(remoteId)) {
          // Lazy load once
          void (async () => {
            try {
              const supabase = createClient();
              const { data } = await postsService.getPostComments(
                supabase,
                remoteId,
              );
              if (!data) return;
              const mapped: PostComment[] = data.map((c) => ({
                id: c.id,
                postId: c.post_id,
                authorId: c.user_id,
                parentId: c.parent_comment_id ?? undefined,
                body: c.body,
                createdAt: c.created_at,
              }));
              setCommentsByPost((prev) => ({ ...prev, [remoteId]: mapped }));
              refresh();
            } catch {
              /* keep local */
            }
          })();
        }
        return postsStorage.listComments(postId);
      },
      addComment: (postId, body, parentId) => {
        if (!user) return null;
        const remoteId = resolveRemoteId(postId);
        if (!isSupabasePostId(remoteId)) {
          const c = postsStorage.addComment(postId, user.id, body, parentId);
          if (c) refresh();
          return c;
        }

        const optimistic: PostComment = {
          id: `tmp_${Math.random().toString(36).slice(2, 10)}`,
          postId: remoteId,
          authorId: user.id,
          parentId,
          body: body.trim(),
          createdAt: new Date().toISOString(),
        };
        const previewRow: PostCommentPreview | null = parentId
          ? null
          : {
              id: optimistic.id,
              postId: remoteId,
              authorId: user.id,
              body: optimistic.body,
              createdAt: optimistic.createdAt,
              username: profile?.username ?? null,
              displayName: profile?.full_name ?? user.fullName ?? null,
              avatarUrl: profile?.avatar_url ?? null,
            };
        setCommentsByPost((prev) => ({
          ...prev,
          [remoteId]: [...(prev[remoteId] ?? []), optimistic],
        }));
        setRemotePosts((prev) =>
          prev.map((p) =>
            p.id === remoteId
              ? {
                  ...p,
                  commentsCount: (p.commentsCount ?? 0) + 1,
                  commentPreview: previewRow
                    ? nextCommentPreview(p.commentPreview, previewRow)
                    : p.commentPreview,
                }
              : p,
          ),
        );
        refresh();

        void (async () => {
          try {
            const supabase = createClient();
            const parentRemote =
              parentId && isSupabasePostId(parentId) ? parentId : parentId;
            const { data, error } = await postsService.addComment(supabase, {
              postId: remoteId,
              userId: user.id,
              body,
              parentCommentId: parentRemote,
            });
            if (error || !data) {
              setCommentsByPost((prev) => ({
                ...prev,
                [remoteId]: (prev[remoteId] ?? []).filter(
                  (c) => c.id !== optimistic.id,
                ),
              }));
              setRemotePosts((prev) =>
                prev.map((p) =>
                  p.id === remoteId
                    ? {
                        ...p,
                        commentsCount: Math.max(0, (p.commentsCount ?? 1) - 1),
                        commentPreview: removeFromCommentPreview(
                          p.commentPreview,
                          optimistic.id,
                        ),
                      }
                    : p,
                ),
              );
              refresh();
              return;
            }
            const confirmed: PostComment = {
              id: data.id,
              postId: data.post_id,
              authorId: data.user_id,
              parentId: data.parent_comment_id ?? undefined,
              body: data.body,
              createdAt: data.created_at,
            };
            setCommentsByPost((prev) => ({
              ...prev,
              [remoteId]: (prev[remoteId] ?? []).map((c) =>
                c.id === optimistic.id ? confirmed : c,
              ),
            }));
            if (!parentId) {
              const confirmedPreview: PostCommentPreview = {
                id: confirmed.id,
                postId: confirmed.postId,
                authorId: confirmed.authorId,
                body: confirmed.body,
                createdAt: confirmed.createdAt,
                username: profile?.username ?? null,
                displayName: profile?.full_name ?? user.fullName ?? null,
                avatarUrl: profile?.avatar_url ?? null,
              };
              setRemotePosts((prev) =>
                prev.map((p) =>
                  p.id === remoteId
                    ? {
                        ...p,
                        commentPreview: nextCommentPreview(
                          p.commentPreview,
                          confirmedPreview,
                          { removeId: optimistic.id },
                        ),
                      }
                    : p,
                ),
              );
            }
            refresh();
          } catch {
            setCommentsByPost((prev) => ({
              ...prev,
              [remoteId]: (prev[remoteId] ?? []).filter(
                (c) => c.id !== optimistic.id,
              ),
            }));
            setRemotePosts((prev) =>
              prev.map((p) =>
                p.id === remoteId
                  ? {
                      ...p,
                      commentsCount: Math.max(0, (p.commentsCount ?? 1) - 1),
                      commentPreview: removeFromCommentPreview(
                        p.commentPreview,
                        optimistic.id,
                      ),
                    }
                  : p,
              ),
            );
            refresh();
          }
        })();

        return optimistic;
      },
      deleteComment: (commentId) => {
        if (!user) return false;
        let targetPostId: string | null = null;
        for (const [pid, list] of Object.entries(commentsByPost)) {
          if (list.some((c) => c.id === commentId)) {
            targetPostId = pid;
            break;
          }
        }
        if (!targetPostId) {
          for (const p of remotePosts) {
            if (p.commentPreview?.some((c) => c.id === commentId)) {
              targetPostId = p.id;
              break;
            }
          }
        }
        if (targetPostId && isSupabasePostId(commentId)) {
          const prevList = commentsByPost[targetPostId] ?? [];
          const prevPost = remotePosts.find((p) => p.id === targetPostId);
          const prevPreview = prevPost?.commentPreview;
          const prevCount = prevPost?.commentsCount ?? 0;
          setCommentsByPost((prev) => ({
            ...prev,
            [targetPostId!]: prevList.filter((c) => c.id !== commentId),
          }));
          setRemotePosts((prev) =>
            prev.map((p) =>
              p.id === targetPostId
                ? {
                    ...p,
                    commentsCount: Math.max(0, (p.commentsCount ?? 1) - 1),
                    commentPreview: removeFromCommentPreview(
                      p.commentPreview,
                      commentId,
                    ),
                  }
                : p,
            ),
          );
          refresh();
          void (async () => {
            try {
              const supabase = createClient();
              const { error } = await postsService.deleteComment(
                supabase,
                commentId,
              );
              if (error) {
                setCommentsByPost((prev) => ({
                  ...prev,
                  [targetPostId!]: prevList,
                }));
                setRemotePosts((prev) =>
                  prev.map((p) =>
                    p.id === targetPostId
                      ? {
                          ...p,
                          commentsCount: prevCount,
                          commentPreview: prevPreview,
                        }
                      : p,
                  ),
                );
                refresh();
              }
            } catch {
              setCommentsByPost((prev) => ({
                ...prev,
                [targetPostId!]: prevList,
              }));
              setRemotePosts((prev) =>
                prev.map((p) =>
                  p.id === targetPostId
                    ? {
                        ...p,
                        commentsCount: prevCount,
                        commentPreview: prevPreview,
                      }
                    : p,
                ),
              );
              refresh();
            }
          })();
          return true;
        }
        const ok = postsStorage.deleteComment(commentId, user.id);
        if (ok) refresh();
        return ok;
      },
      authorStats: (authorId) => postsStorage.authorStats(authorId),
      weekStats: (authorId) => postsStorage.weekStats(authorId),
    };
  }, [
    tick,
    user,
    profile,
    refresh,
    feedStatus,
    feedError,
    feedHasMore,
    loadMoreFeed,
    homeFeedPosts,
    remotePosts,
    likedIds,
    savedIds,
    commentsByPost,
    resolveRemoteId,
    markDeletedIds,
  ]);

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
