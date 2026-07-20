"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { SocialAvatar } from "@/components/social/PersonCard";
import { useMessages } from "@/components/messages/MessagesProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSwipeBack } from "@/components/nav/swipeGestures";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

function formatThreadTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const { ready, tick, inbox } = useMessages();
  const { getCard, ready: socialReady } = useSocial();
  const { t } = useAppTranslation(["common", "social"]);

  useSwipeBack("/feed");

  const threads = useMemo(() => {
    void tick;
    return inbox();
  }, [tick, inbox]);

  if (!ready || !socialReady || !user) {
    return <div className="evolve-shimmer h-40 rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <div className="min-w-0 w-full">
      <PageHeader
        title={t("messages.title", { ns: "social" })}
        subtitle={t("messages.subtitleLong", { ns: "social" })}
        sticky
        actions={
          <Link href="/explore">
            <Button size="sm" variant="outline" aria-label={t("buttons.findPeople")}>
              <Search size={16} />
            </Button>
          </Link>
        }
      />

      <div className="mt-4">
        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={28} />}
            title={t("messages.empty", { ns: "social" })}
            description={t("messages.emptyExplore", { ns: "social" })}
            action={
              <Link href="/explore">
                <Button>{t("explorePeople", { ns: "social" })}</Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {threads.map((thread) => {
              const card = getCard(thread.peerUserId);
              const name =
                card?.profile.displayName ??
                card?.profile.username ??
                t("labels.athlete");
              const preview =
                thread.lastMessage?.body ?? t("messages.sayHello", { ns: "social" });
              const when = thread.lastMessage?.createdAt ?? thread.updatedAt;
              return (
                <li key={thread.conversationId}>
                  <Link
                    href={`/messages/${thread.peerUserId}`}
                    className="flex min-h-[72px] items-center gap-3 px-3.5 py-3 transition hover:bg-muted-bg/60"
                  >
                    <SocialAvatar name={name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate font-display text-sm font-semibold ${
                            thread.unreadCount > 0 ? "text-foreground" : ""
                          }`}
                        >
                          {name}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatThreadTime(when)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={`truncate text-sm ${
                            thread.unreadCount > 0
                              ? "font-medium text-foreground"
                              : "text-muted"
                          }`}
                        >
                          {thread.lastMessage?.senderId === user.id
                            ? t("messages.youPrefix", { ns: "social" })
                            : ""}
                          {preview}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-fg">
                            {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
