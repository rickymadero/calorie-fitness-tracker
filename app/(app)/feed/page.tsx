"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ComposeBar, FeedList, FeedSkeleton } from "@/components/feed/FeedComponents";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { Button } from "@/components/ui/Button";

export default function FeedPage() {
  const { tick, followingFeed, publicFeed } = usePosts();
  const { myProfile, ready } = useSocial();

  const { posts, mode } = useMemo(() => {
    void tick;
    const following = followingFeed();
    if (following.length > 0) {
      return { posts: following, mode: "following" as const };
    }
    return { posts: publicFeed().slice(0, 12), mode: "discover" as const };
  }, [tick, followingFeed, publicFeed]);

  if (!ready) return <FeedSkeleton />;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Feed
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {mode === "following"
              ? "People you follow"
              : "Public workouts · follow to personalize"}
          </p>
        </div>
        <Link href="/posts/new" className="hidden sm:block">
          <Button size="sm">Create</Button>
        </Link>
      </div>

      <div className="mt-4">
        <ComposeBar />
      </div>

      {myProfile && (
        <p className="mt-3 text-xs text-muted">@{myProfile.username}</p>
      )}

      <div className="mt-4">
        <FeedList
          posts={posts}
          emptyTitle="No workouts yet"
          emptyHint="Share your first session or find athletes on Explore."
          emptyAction={
            <Link href="/explore">
              <Button>Explore</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
