"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, UserPlus, Users, Clock } from "lucide-react";
import { useSocial } from "@/components/social/SocialProvider";
import {
  PersonCard,
  RemoveFollowerButton,
  SocialAvatar,
} from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
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
    return <div className="evolve-shimmer h-40 rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <div>
      <PageHeader
        title="Network"
        subtitle="Followers, following, and follow requests."
        sticky
      />

      <div className="mt-4">
        <SegmentedControl
          scroll
          segments={[
            { id: "following", label: `Following · ${following.length}` },
            { id: "followers", label: `Followers · ${followers.length}` },
            { id: "requests", label: `Requests · ${requests.length}` },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5 space-y-3">
        {tab === "following" &&
          (following.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={28} />}
              title="Not following anyone yet"
              description="Discover athletes on Explore."
              action={
                <Link href="/explore">
                  <Button variant="outline">Explore</Button>
                </Link>
              }
            />
          ) : (
            following.map((c) => (
              <PersonCard key={c.profile.userId} card={c} />
            ))
          ))}

        {tab === "followers" &&
          (followers.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No followers yet"
              description="Share workouts to grow your network."
              action={
                <Link href="/posts/new">
                  <Button variant="outline">Share a workout</Button>
                </Link>
              }
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
            <EmptyState
              icon={<Clock size={28} />}
              title="No pending requests"
              description="When someone requests to follow your private profile, they appear here."
            />
          ) : (
            requests.map((req) => {
              const card = getCard(req.fromUserId);
              if (!card) return null;
              return (
                <div
                  key={req.id}
                  className="rounded-apex-lg border border-border bg-card p-4 shadow-apex"
                >
                  <div className="flex items-center gap-3">
                    <SocialAvatar name={card.profile.displayName} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/social/u/${card.profile.username}`}>
                        <p className="truncate font-display font-semibold">
                          {card.profile.displayName}
                        </p>
                      </Link>
                      <p className="truncate text-sm text-muted">
                        @{card.profile.username}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
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
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })
          ))}
      </div>
    </div>
  );
}
