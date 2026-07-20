"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { postsStorage } from "@/lib/storage/posts";
import type {
  CreatePostInput,
  PostComment,
  WorkoutPost,
} from "@/lib/types/posts";

interface PostsContextValue {
  tick: number;
  refresh: () => void;
  followingFeed: () => WorkoutPost[];
  homeFeed: () => WorkoutPost[];
  publicFeed: () => WorkoutPost[];
  postsByAuthor: (authorId: string, limit?: number) => WorkoutPost[];
  getPost: (postId: string) => WorkoutPost | null;
  createPost: (input: CreatePostInput) => WorkoutPost | null;
  deletePost: (postId: string) => boolean;
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

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo<PostsContextValue>(() => {
    void tick;
    const viewerId = user?.id ?? null;
    return {
      tick,
      refresh,
      followingFeed: () =>
        viewerId
          ? postsStorage.listFollowingFeed(viewerId)
          : postsStorage.listPublicFeed(null),
      homeFeed: () =>
        viewerId
          ? postsStorage.listHomeFeed(viewerId)
          : postsStorage.listPublicFeed(null),
      publicFeed: () => postsStorage.listPublicFeed(viewerId),
      postsByAuthor: (authorId, limit = 20) =>
        postsStorage.listPostsByAuthor(authorId, viewerId, limit),
      getPost: (postId) => postsStorage.getPost(postId, viewerId),
      createPost: (input) => {
        if (!user) return null;
        const post = postsStorage.createPost(user.id, input);
        refresh();
        return post;
      },
      deletePost: (postId) => {
        if (!user) return false;
        const ok = postsStorage.deletePost(postId, user.id);
        if (ok) refresh();
        return ok;
      },
      hasLiked: (postId) =>
        user ? postsStorage.hasLiked(postId, user.id) : false,
      toggleLike: (postId) => {
        if (!user) return { liked: false, likesCount: 0 };
        const res = postsStorage.toggleLike(postId, user.id);
        refresh();
        return res;
      },
      hasSaved: (postId) =>
        user ? postsStorage.hasSaved(postId, user.id) : false,
      toggleSave: (postId) => {
        if (!user) return { saved: false };
        const res = postsStorage.toggleSave(postId, user.id);
        refresh();
        return res;
      },
      listSavedPosts: () =>
        user ? postsStorage.listSaved(user.id) : [],
      commentsFor: (postId) => postsStorage.listComments(postId),
      addComment: (postId, body, parentId) => {
        if (!user) return null;
        const c = postsStorage.addComment(postId, user.id, body, parentId);
        if (c) refresh();
        return c;
      },
      deleteComment: (commentId) => {
        if (!user) return false;
        const ok = postsStorage.deleteComment(commentId, user.id);
        if (ok) refresh();
        return ok;
      },
      authorStats: (authorId) => postsStorage.authorStats(authorId),
      weekStats: (authorId) => postsStorage.weekStats(authorId),
    };
  }, [tick, user, refresh]);

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
}
