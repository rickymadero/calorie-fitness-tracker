"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function FollowRequestsPage() {
  const {
    ready,
    pendingRequestsToMe,
    getCard,
    acceptRequest,
    rejectRequest,
  } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "social"]);

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
        {t("social:requestsTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted">{t("social:requestsSubtitle")}</p>

      {requests.length === 0 ? (
        <div className="mt-8 rounded-apex-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">{t("social:noRequests")}</p>
          <p className="mt-1 text-sm text-muted">
            {t("social:requestsEmptyDetail")}
          </p>
          <Link href="/network" className="mt-4 inline-block">
            <Button variant="outline">{t("social:backToNetwork")}</Button>
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
                      toast(t("social:requestAccepted"), "success");
                    }}
                  >
                    <Check size={14} />
                    {t("social:accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      rejectRequest(req.id);
                      toast(t("social:requestDeclined"), "info");
                    }}
                  >
                    <X size={14} />
                    {t("social:decline")}
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
