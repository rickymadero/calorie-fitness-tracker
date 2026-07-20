"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { FeedList, FeedSkeleton } from "@/components/feed/FeedComponents";
import { StoriesRail } from "@/components/feed/StoriesRail";
import { SuggestedPeopleRow } from "@/components/feed/SuggestedPeopleRow";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useMessages } from "@/components/messages/MessagesProvider";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useSwipeToMessages } from "@/components/nav/swipeGestures";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function FeedPage() {
  const { tick, homeFeed } = usePosts();
  const { ready, suggestedPeople } = useSocial();
  const { tick: msgTick, unreadTotal } = useMessages();
  const { t } = useAppTranslation(["common", "feed"]);

  useSwipeToMessages(ready);

  const feedPosts = useMemo(() => {
    void tick;
    return homeFeed();
  }, [tick, homeFeed]);

  const suggestions = useMemo(() => {
    void tick;
    return suggestedPeople().slice(0, 8);
  }, [tick, suggestedPeople]);

  const unread = useMemo(() => {
    void msgTick;
    return unreadTotal();
  }, [msgTick, unreadTotal]);

  if (!ready) return <FeedSkeleton />;

  return (
    <div>
      <PageHeader
        sticky
        titleContent={<EvolveLogo size="md" />}
        actions={
          <Link
            href="/messages"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label={t("common:nav.messages")}
          >
            <MessageCircle size={22} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-fg">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        }
      />

      <div className="mt-3">
        <StoriesRail />
      </div>

      <div className="mt-5">
        <SuggestedPeopleRow people={suggestions} />
      </div>

      <div className="mt-5">
        <FeedList
          posts={feedPosts}
          emptyTitle={t("feed:emptyTitle")}
          emptyHint={t("feed:emptyHint")}
          emptyAction={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/network">
                <Button variant="outline">{t("feed:findPeople")}</Button>
              </Link>
              <Link href="/posts/new">
                <Button>{t("feed:shareWorkout")}</Button>
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
