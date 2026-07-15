"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSocial } from "@/components/social/SocialProvider";
import { PersonCard } from "@/components/social/PersonCard";

export default function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { ready, getCardByUsername, followingOf } = useSocial();

  const card = useMemo(() => {
    if (!ready) return null;
    return getCardByUsername(username);
  }, [ready, username, getCardByUsername]);

  const list = useMemo(() => {
    if (!card || card.limited) return [];
    return followingOf(card.profile.userId);
  }, [card, followingOf]);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-apex-lg bg-muted-bg" />;
  }

  if (!card) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium">User not found</p>
        <Link href="/social/discover" className="mt-4 inline-block">
          <Button>Discover</Button>
        </Link>
      </div>
    );
  }

  if (card.limited) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-12 text-center">
        <p className="font-medium">Following list is private</p>
        <p className="mt-1 text-sm text-muted">
          Follow this account to see who they follow.
        </p>
        <Link
          href={`/social/u/${card.profile.username}`}
          className="mt-4 inline-block"
        >
          <Button variant="outline">Back to profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Following
          </h1>
          <p className="mt-1 text-sm text-muted">
            @{card.profile.username} · {list.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/social/u/${card.profile.username}/followers`}>
            <Button size="sm" variant="outline">
              Followers
            </Button>
          </Link>
          <Link href={`/social/u/${card.profile.username}`}>
            <Button size="sm" variant="ghost">
              Profile
            </Button>
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-apex-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">Not following anyone yet</p>
          <p className="mt-1 text-sm text-muted">
            Discover athletes to build a feed.
          </p>
          <Link href="/social/discover" className="mt-4 inline-block">
            <Button>Discover people</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {list.map((f) => (
            <PersonCard key={f.profile.userId} card={f} />
          ))}
        </div>
      )}
    </div>
  );
}
