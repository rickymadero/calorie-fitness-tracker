"use client";

import {
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMessages } from "@/components/messages/MessagesProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { useSwipeBack } from "@/components/nav/swipeGestures";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

function formatBubbleTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: peerUserId } = use(params);
  const { user } = useAuth();
  const { tick, messagesWith, send, markRead, openThread, ready } =
    useMessages();
  const { getCard, ready: socialReady } = useSocial();
  const { t } = useAppTranslation(["common", "social"]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useSwipeBack("/messages");

  const card = useMemo(() => {
    if (!socialReady) return null;
    return getCard(peerUserId);
  }, [socialReady, peerUserId, getCard]);

  const messages = useMemo(() => {
    void tick;
    return messagesWith(peerUserId);
  }, [tick, peerUserId, messagesWith]);

  const onOpen = useEffectEvent(() => {
    openThread(peerUserId);
    markRead(peerUserId);
  });

  useEffect(() => {
    if (!ready || !user) return;
    onOpen();
  }, [ready, user, peerUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const msg = send(peerUserId, draft);
    if (msg) setDraft("");
  }

  if (!ready || !socialReady || !user) {
    return <div className="evolve-shimmer h-40 rounded-apex-lg bg-muted-bg" />;
  }

  if (peerUserId === user.id) {
    return (
      <div className="rounded-apex-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">
          {t("messages.thatsYou", { ns: "social" })}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t("messages.thatsYouHint", { ns: "social" })}
        </p>
        <Link href="/messages" className="mt-4 inline-block">
          <Button variant="outline">
            {t("messages.backInbox", { ns: "social" })}
          </Button>
        </Link>
      </div>
    );
  }

  const name = card?.profile.displayName ?? t("labels.athlete");
  const username = card?.profile.username;

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] min-w-0 flex-col lg:min-h-[calc(100dvh-4rem)]">
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
        <div className="flex min-h-14 items-center gap-2 py-2">
          <Link
            href="/messages"
            className="evolve-press inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label={t("messages.backAria", { ns: "social" })}
          >
            <ChevronLeft size={22} />
          </Link>
          <Link
            href={username ? `/social/u/${username}` : "/explore"}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <SocialAvatar name={name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">
                {name}
              </p>
              {username ? (
                <p className="truncate text-xs text-muted">@{username}</p>
              ) : null}
            </div>
          </Link>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted">
            {t("messages.threadEmpty", { ns: "social" })}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    mine
                      ? "rounded-br-md bg-accent text-accent-fg"
                      : "rounded-bl-md bg-muted-bg text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-accent-fg/70" : "text-muted"
                    }`}
                  >
                    {formatBubbleTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={submit}
        className="sticky bottom-[var(--mobile-nav-clearance)] z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:bottom-0 lg:mx-0 lg:px-0"
      >
        <div className="flex items-end gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
            placeholder={t("messages.placeholder", { ns: "social" })}
            className="min-h-11 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            autoComplete="off"
            enterKeyHint="send"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!draft.trim()}
            className="!min-w-11 !px-0"
            aria-label={t("messages.sendAria", { ns: "social" })}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
