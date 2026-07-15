"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { useToast } from "@/components/providers/ToastProvider";

export default function FollowRequestsPage() {
  const {
    ready,
    pendingRequestsToMe,
    getCard,
    acceptRequest,
    rejectRequest,
  } = useSocial();
  const { toast } = useToast();

  const requests = useMemo(() => {
    if (!ready) return [];
    return pendingRequestsToMe();
  }, [ready, pendingRequestsToMe]);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Follow requests
      </h1>
      <p className="mt-1 text-sm text-muted">
        People who asked to follow your private profile.
      </p>

      {requests.length === 0 ? (
        <div className="mt-8 rounded-apex-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No pending requests</p>
          <p className="mt-1 text-sm text-muted">
            When someone requests to follow you, they&apos;ll appear here.
          </p>
          <Link href="/network" className="mt-4 inline-block">
            <Button variant="outline">Back to Network</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {requests.map((req) => {
            const card = getCard(req.fromUserId);
            if (!card) return null;
            return (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-apex-lg border border-border bg-card p-4 shadow-apex"
              >
                <Link href={`/social/u/${card.profile.username}`}>
                  <SocialAvatar name={card.profile.displayName} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/social/u/${card.profile.username}`}>
                    <p className="font-display font-semibold">
                      {card.profile.displayName}
                    </p>
                  </Link>
                  <p className="text-sm text-muted">@{card.profile.username}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      acceptRequest(req.id);
                      toast("Request accepted.", "success");
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
                      toast("Request declined.", "info");
                    }}
                  >
                    <X size={14} />
                    Decline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
