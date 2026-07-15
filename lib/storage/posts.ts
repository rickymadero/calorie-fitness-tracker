import type {
  CreatePostInput,
  PostComment,
  PostLike,
  PostsStore,
  WorkoutPost,
} from "@/lib/types/posts";
import { SEED_POSTS } from "@/lib/mock/seedPosts";
import { socialStorage } from "@/lib/storage/social";

const KEY = "evolve.posts";

function canUse() {
  return typeof window !== "undefined";
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function emptyStore(): PostsStore {
  return {
    posts: [...SEED_POSTS],
    likes: [],
    comments: [
      {
        id: "cmt-1",
        postId: "post-maya-1",
        authorId: "seed-jordan",
        body: "Strong pace — keep it up!",
        createdAt: "2026-07-14T07:15:00.000Z",
      },
      {
        id: "cmt-2",
        postId: "post-maya-1",
        authorId: "seed-ava",
        body: "Early bird wins.",
        createdAt: "2026-07-14T07:30:00.000Z",
      },
      {
        id: "cmt-3",
        postId: "post-jordan-1",
        authorId: "seed-maya",
        body: "Those volumes are no joke.",
        createdAt: "2026-07-13T19:20:00.000Z",
      },
    ],
    saved: [],
  };
}

function read(): PostsStore {
  if (!canUse()) return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = emptyStore();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as PostsStore;
    if (!parsed.saved) parsed.saved = [];
    const byId = new Map(parsed.posts.map((p) => [p.id, p]));
    let changed = false;
    for (const seed of SEED_POSTS) {
      const existing = byId.get(seed.id);
      if (!existing) {
        parsed.posts.push(seed);
        changed = true;
      } else if (
        (seed.routePreview && !existing.routePreview) ||
        (seed.exercises && !existing.exercises) ||
        (seed.achievements && !existing.achievements)
      ) {
        // Enrich older local seed rows with Strava-style fields
        Object.assign(existing, seed, {
          likesCount: existing.likesCount,
          commentsCount: existing.commentsCount,
        });
        changed = true;
      }
    }
    if (changed) write(parsed);
    return parsed;
  } catch {
    return emptyStore();
  }
}

function write(store: PostsStore) {
  if (!canUse()) return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

function syncCounts(store: PostsStore, postId: string) {
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return;
  post.likesCount = store.likes.filter((l) => l.postId === postId).length;
  post.commentsCount = store.comments.filter((c) => c.postId === postId).length;
}

function isFollowing(viewerId: string, authorId: string) {
  return socialStorage
    .getFollows()
    .some((f) => f.followerId === viewerId && f.followingId === authorId);
}

function canViewPost(post: WorkoutPost, viewerId?: string | null) {
  if (post.visibility === "public") return true;
  if (!viewerId) return false;
  if (post.authorId === viewerId) return true;
  if (post.visibility === "private") return false;
  if (post.visibility === "followers") {
    return isFollowing(viewerId, post.authorId);
  }
  return false;
}

function derivePace(distanceKm?: number, durationMin?: number) {
  if (!distanceKm || !durationMin || distanceKm <= 0) return undefined;
  return Math.round((durationMin / distanceKm) * 100) / 100;
}

export const postsStorage = {
  getStore: read,

  listVisiblePosts(viewerId?: string | null) {
    return read()
      .posts.filter((p) => canViewPost(p, viewerId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listFollowingFeed(viewerId: string) {
    const followingIds = new Set(
      socialStorage
        .getFollows()
        .filter((f) => f.followerId === viewerId)
        .map((f) => f.followingId),
    );
    followingIds.add(viewerId);
    return read()
      .posts.filter(
        (p) => followingIds.has(p.authorId) && canViewPost(p, viewerId),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listPublicFeed(viewerId?: string | null) {
    return read()
      .posts.filter(
        (p) => p.visibility === "public" && canViewPost(p, viewerId),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listPostsByAuthor(authorId: string, viewerId?: string | null, limit = 20) {
    return read()
      .posts.filter(
        (p) => p.authorId === authorId && canViewPost(p, viewerId),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  getPost(postId: string, viewerId?: string | null) {
    const post = read().posts.find((p) => p.id === postId);
    if (!post || !canViewPost(post, viewerId)) return null;
    return post;
  },

  createPost(authorId: string, input: CreatePostInput): WorkoutPost {
    const store = read();
    const post: WorkoutPost = {
      id: uid("post"),
      authorId,
      type: input.type,
      title: input.title.trim(),
      caption: input.caption.trim(),
      occurredAt: input.occurredAt,
      createdAt: new Date().toISOString(),
      visibility: input.visibility,
      photoUrl: input.photoUrl,
      photos: input.photos,
      distanceKm: input.distanceKm,
      durationMin: input.durationMin,
      paceMinPerKm:
        input.type === "running" || input.type === "walking"
          ? derivePace(input.distanceKm, input.durationMin)
          : undefined,
      caloriesBurned: input.caloriesBurned,
      gymSummary: input.gymSummary,
      muscleGroups: input.muscleGroups,
      exercises: input.exercises,
      exerciseCount: input.exercises?.length,
      totalSets: input.exercises?.reduce((s, e) => s + e.sets, 0),
      route: input.route,
      routePreview: input.routePreview,
      elevationGainM: input.elevationGainM,
      locationName: input.locationName,
      routeVisible: input.routeVisible ?? true,
      hideStart: input.hideStart,
      hideEnd: input.hideEnd,
      commentsEnabled: input.commentsEnabled ?? true,
      likesCount: 0,
      commentsCount: 0,
    };
    store.posts.unshift(post);
    write(store);
    return post;
  },

  deletePost(postId: string, authorId: string) {
    const store = read();
    const post = store.posts.find((p) => p.id === postId);
    if (!post || post.authorId !== authorId) return false;
    store.posts = store.posts.filter((p) => p.id !== postId);
    store.likes = store.likes.filter((l) => l.postId !== postId);
    store.comments = store.comments.filter((c) => c.postId !== postId);
    store.saved = store.saved.filter((s) => s.postId !== postId);
    write(store);
    return true;
  },

  hasLiked(postId: string, userId: string) {
    return read().likes.some(
      (l) => l.postId === postId && l.userId === userId,
    );
  },

  listLikers(postId: string) {
    return read()
      .likes.filter((l) => l.postId === postId)
      .map((l) => l.userId);
  },

  hasSaved(postId: string, userId: string) {
    return read().saved.some(
      (s) => s.postId === postId && s.userId === userId,
    );
  },

  toggleSave(postId: string, userId: string) {
    const store = read();
    const post = store.posts.find((p) => p.id === postId);
    if (!post || !canViewPost(post, userId)) {
      return { saved: false };
    }
    const existing = store.saved.find(
      (s) => s.postId === postId && s.userId === userId,
    );
    if (existing) {
      store.saved = store.saved.filter((s) => s.id !== existing.id);
      write(store);
      return { saved: false };
    }
    store.saved.push({
      id: uid("save"),
      postId,
      userId,
      createdAt: new Date().toISOString(),
    });
    write(store);
    return { saved: true };
  },

  listSaved(userId: string) {
    const store = read();
    const ids = store.saved
      .filter((s) => s.userId === userId)
      .map((s) => s.postId);
    return store.posts
      .filter((p) => ids.includes(p.id) && canViewPost(p, userId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  toggleLike(postId: string, userId: string) {
    const store = read();
    const post = store.posts.find((p) => p.id === postId);
    if (!post || !canViewPost(post, userId)) {
      return { liked: false, likesCount: post?.likesCount ?? 0 };
    }
    const existing = store.likes.find(
      (l) => l.postId === postId && l.userId === userId,
    );
    if (existing) {
      store.likes = store.likes.filter((l) => l.id !== existing.id);
      syncCounts(store, postId);
      write(store);
      return { liked: false, likesCount: post.likesCount };
    }
    const like: PostLike = {
      id: uid("like"),
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };
    store.likes.push(like);
    syncCounts(store, postId);
    write(store);
    return { liked: true, likesCount: post.likesCount };
  },

  listComments(postId: string) {
    return read()
      .comments.filter((c) => c.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  addComment(
    postId: string,
    authorId: string,
    body: string,
    parentId?: string,
  ): PostComment | null {
    const store = read();
    const post = store.posts.find((p) => p.id === postId);
    if (!post || !canViewPost(post, authorId)) return null;
    if (post.commentsEnabled === false) return null;
    const trimmed = body.trim();
    if (!trimmed) return null;
    const comment: PostComment = {
      id: uid("cmt"),
      postId,
      authorId,
      parentId,
      body: trimmed.slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    store.comments.push(comment);
    syncCounts(store, postId);
    write(store);
    return comment;
  },

  deleteComment(commentId: string, userId: string) {
    const store = read();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) return false;
    const post = store.posts.find((p) => p.id === comment.postId);
    if (comment.authorId !== userId && post?.authorId !== userId) {
      return false;
    }
    store.comments = store.comments.filter((c) => c.id !== commentId);
    if (post) syncCounts(store, post.id);
    write(store);
    return true;
  },

  authorStats(authorId: string) {
    const posts = read().posts.filter((p) => p.authorId === authorId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = posts.filter(
      (p) => new Date(p.occurredAt) >= monthStart,
    );
    const totalKm = posts.reduce((s, p) => s + (p.distanceKm ?? 0), 0);
    return {
      workoutsThisMonth: thisMonth.length,
      totalWorkouts: posts.length,
      totalKm: Math.round(totalKm * 10) / 10,
      streakDays: estimateStreak(posts),
    };
  },
};

function estimateStreak(posts: WorkoutPost[]) {
  if (!posts.length) return 0;
  const days = new Set(
    posts.map((p) => p.occurredAt.slice(0, 10)),
  );
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
}
