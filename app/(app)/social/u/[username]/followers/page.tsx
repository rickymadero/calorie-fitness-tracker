"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import {
  PersonCard,
  RemoveFollowerButton,
} from "@/components/social/PersonCard";

export default function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { user } = useAuth();
  const { ready, getCardByUsername, followersOf } = useSocial();

  const card = useMemo(() => {
    if (!ready) return null;
    return getCardByUsername(username);
  }, [ready, username, getCardByUsername]);

  const list = useMemo(() => {
    if (!card || card.limited) return [];
    return followersOf(card.profile.userId);
  }, [card, followersOf]);

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
        <p className="font-medium">Followers are private</p>
        <p className="mt-1 text-sm text-muted">
          Follow this account to see their network.
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

  const isOwner = user?.id === card.profile.userId;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Followers
          </h1>
          <p className="mt-1 text-sm text-muted">
            @{card.profile.username} · {list.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/social/u/${card.profile.username}/following`}>
            <Button size="sm" variant="outline">
              Following
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
          <p className="font-medium">No followers yet</p>
          <p className="mt-1 text-sm text-muted">
            When people follow this athlete, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {list.map((f) => (
            <div key={f.profile.userId} className="space-y-2">
              <PersonCard card={f} />
              {isOwner && f.profile.userId !== user?.id && (
                <div className="flex justify-end px-1">
                  <RemoveFollowerButton followerId={f.profile.userId} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
