"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useSocial } from "@/components/social/SocialProvider";
import {
  PersonCard,
  RemoveFollowerButton,
  SocialAvatar,
} from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";

type Tab = "followers" | "following" | "requests";

export default function NetworkPage() {
  const { user } = useAuth();
  const {
    ready,
    myProfile,
    ensureMyProfile,
    followersOf,
    followingOf,
    pendingRequestsToMe,
    getCard,
    acceptRequest,
    rejectRequest,
  } = useSocial();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("following");

  const profile = myProfile ?? (ready ? ensureMyProfile() : null);

  const followers = useMemo(() => {
    if (!profile) return [];
    return followersOf(profile.userId);
  }, [profile, followersOf]);

  const following = useMemo(() => {
    if (!profile) return [];
    return followingOf(profile.userId);
  }, [profile, followingOf]);

  const requests = useMemo(() => {
    if (!ready) return [];
    return pendingRequestsToMe();
  }, [ready, pendingRequestsToMe]);

  if (!ready || !profile) {
    return <div className="h-40 animate-pulse rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Network
      </h1>
      <p className="mt-1 text-sm text-muted">
        Followers, following, and follow requests.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "following", label: `Following (${following.length})` },
            { id: "followers", label: `Followers (${followers.length})` },
            {
              id: "requests",
              label: `Requests (${requests.length})`,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-accent text-accent-fg"
                : "bg-muted-bg text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === "following" &&
          (following.length === 0 ? (
            <Empty
              title="Not following anyone yet"
              hint="Discover athletes on Explore."
              href="/explore"
            />
          ) : (
            following.map((c) => (
              <PersonCard key={c.profile.userId} card={c} />
            ))
          ))}

        {tab === "followers" &&
          (followers.length === 0 ? (
            <Empty
              title="No followers yet"
              hint="Share workouts to grow your network."
              href="/posts/new"
            />
          ) : (
            followers.map((c) => (
              <div key={c.profile.userId}>
                <PersonCard card={c} />
                {user && c.profile.userId !== user.id && (
                  <div className="mt-1 flex justify-end">
                    <RemoveFollowerButton followerId={c.profile.userId} />
                  </div>
                )}
              </div>
            ))
          ))}

        {tab === "requests" &&
          (requests.length === 0 ? (
            <Empty
              title="No pending requests"
              hint="When someone requests to follow your private profile, they appear here."
            />
          ) : (
            requests.map((req) => {
              const card = getCard(req.fromUserId);
              if (!card) return null;
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-apex-lg border border-border bg-card p-4 shadow-apex"
                >
                  <SocialAvatar name={card.profile.displayName} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/social/u/${card.profile.username}`}>
                      <p className="font-display font-semibold">
                        {card.profile.displayName}
                      </p>
                    </Link>
                    <p className="text-sm text-muted">
                      @{card.profile.username}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      acceptRequest(req.id);
                      toast("Accepted.", "success");
                    }}
                  >
                    <Check size={14} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      rejectRequest(req.id);
                      toast("Declined.", "info");
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              );
            })
          ))}
      </div>
    </div>
  );
}

function Empty({
  title,
  hint,
  href,
}: {
  title: string;
  hint: string;
  href?: string;
}) {
  return (
    <div className="rounded-apex-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      {href && (
        <Link href={href} className="mt-4 inline-block">
          <Button variant="outline">Go</Button>
        </Link>
      )}
    </div>
  );
}
