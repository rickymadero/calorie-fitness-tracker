"use client";

import { useMemo, useState, useDeferredValue } from "react";
import Link from "next/link";
import {
  Check,
  X,
  UserPlus,
  Users,
  Clock,
  MessageCircle,
  Search,
} from "lucide-react";
import { useSocial } from "@/components/social/SocialProvider";
import {
  PersonCard,
  RemoveFollowerButton,
  SocialAvatar,
} from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

type Tab = "search" | "followers" | "following" | "requests";

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
    searchPeople,
    suggestedPeople,
  } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "social"]);
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());

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

  const people = useMemo(() => {
    if (!ready) return [];
    if (deferred) return searchPeople(deferred);
    return suggestedPeople();
  }, [ready, deferred, searchPeople, suggestedPeople]);

  if (!ready || !profile) {
    return <div className="evolve-shimmer h-40 rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <div className="min-w-0 w-full max-w-full">
      <PageHeader
        sticky
        titleContent={<EvolveLogo size="md" />}
        actions={
          <Link
            href="/messages"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label={t("nav.messages")}
          >
            <MessageCircle size={22} />
          </Link>
        }
      />

      <div className="mt-2 min-w-0 max-w-full">
        <SegmentedControl
          scroll
          segments={[
            { id: "search", label: t("tabs.search", { ns: "social" }) },
            {
              id: "following",
              label: `${t("tabs.following", { ns: "social" })} · ${following.length}`,
            },
            {
              id: "followers",
              label: `${t("tabs.followers", { ns: "social" })} · ${followers.length}`,
            },
            {
              id: "requests",
              label: `${t("tabs.requests", { ns: "social" })} · ${requests.length}`,
            },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "search" && (
        <div className="relative mt-4">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder", { ns: "social" })}
            className="h-12 w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      )}

      <div className="mt-5 space-y-3">
        {tab === "search" &&
          (people.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={28} />}
              title={
                deferred
                  ? t("noAthletes", { ns: "social" })
                  : t("noSuggestions", { ns: "social" })
              }
              description={
                deferred
                  ? t("searchEmptyHint", { ns: "social" })
                  : t("suggestionsEmptyHint", { ns: "social" })
              }
            />
          ) : (
            people.map((c) => (
              <PersonCard key={c.profile.userId} card={c} />
            ))
          ))}

        {tab === "following" &&
          (following.length === 0 ? (
            <EmptyState
              icon={<UserPlus size={28} />}
              title={t("notFollowing", { ns: "social" })}
              description={t("notFollowingHint", { ns: "social" })}
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
              title={t("noFollowers", { ns: "social" })}
              description={t("noFollowersHint", { ns: "social" })}
              action={
                <Link href="/posts/new">
                  <Button variant="outline">
                    {t("shareWorkout", { ns: "social" })}
                  </Button>
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
              title={t("noRequests", { ns: "social" })}
              description={t("requestsEmptyHint", { ns: "social" })}
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
                        toast(t("accepted", { ns: "social" }), "success");
                      }}
                    >
                      <Check size={14} />
                      {t("accept", { ns: "social" })}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        rejectRequest(req.id);
                        toast(t("declined", { ns: "social" }), "info");
                      }}
                    >
                      <X size={14} />
                      {t("decline", { ns: "social" })}
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
