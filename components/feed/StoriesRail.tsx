"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useStories } from "@/components/stories/StoriesProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import type { DualStory, FeedStoryGroup } from "@/lib/types/stories";

export function StoriesRail() {
  const { user } = useAuth();
  const { getCard } = useSocial();
  const { tick, listFeedGroups, ready } = useStories();
  const { t } = useAppTranslation(["feed", "common"]);
  const [viewer, setViewer] = useState<{
    stories: DualStory[];
    startIndex: number;
  } | null>(null);

  const groups = useMemo(() => {
    void tick;
    return listFeedGroups();
  }, [tick, listFeedGroups]);

  if (!ready || !user) return null;

  const selfGroup = groups.find((g) => g.userId === user.id);
  const others = groups.filter((g) => g.userId !== user.id);
  const hasOwnStory = !!selfGroup && selfGroup.stories.length > 0;

  function openGroup(group: FeedStoryGroup, startIndex = 0) {
    setViewer({ stories: group.stories, startIndex });
  }

  return (
    <>
      <div className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {/* Own story — add, or open if already posted */}
        {hasOwnStory ? (
          <button
            type="button"
            onClick={() => openGroup(selfGroup!)}
            className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full p-[2px] ${
                selfGroup!.hasUnseen
                  ? "bg-gradient-to-tr from-accent to-bronze"
                  : "bg-border"
              }`}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-background p-[2px]">
                <SocialAvatar name={user.fullName} size="md" />
              </span>
              <Link
                href="/stories/new"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg shadow-apex"
                aria-label={t("addStory")}
              >
                <Plus size={14} strokeWidth={2.5} />
              </Link>
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium">
              {t("yourStory")}
            </span>
          </button>
        ) : (
          <Link
            href="/stories/new"
            className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
          >
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed border-border bg-muted-bg">
              <SocialAvatar name={user.fullName} size="md" />
              <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg shadow-apex">
                <Plus size={14} strokeWidth={2.5} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium">
              {t("yourStory")}
            </span>
          </Link>
        )}

        {/* People you follow who posted a story in the last 24h */}
        {others.map((g) => {
          const card = getCard(g.userId);
          const name = card?.profile.displayName ?? t("labels.athlete", { ns: "common" });
          return (
            <button
              key={g.userId}
              type="button"
              onClick={() => openGroup(g)}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-[68px] w-[68px] items-center justify-center rounded-full p-[2px] ${
                  g.hasUnseen
                    ? "bg-gradient-to-tr from-accent to-bronze"
                    : "bg-border"
                }`}
              >
                <span className="flex h-full w-full items-center justify-center rounded-full bg-background p-[2px]">
                  <SocialAvatar name={name} size="md" />
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium">
                {name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {viewer && (
        <StoryViewer
          stories={viewer.stories}
          startIndex={viewer.startIndex}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
