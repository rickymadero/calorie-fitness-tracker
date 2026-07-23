"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  storiesStorage,
  type CreateStoryInput,
} from "@/lib/storage/stories";
import type {
  DualStory,
  FeedStoryGroup,
  StoryHighlight,
  StoryReactionKind,
} from "@/lib/types/stories";
import { messagesStorage } from "@/lib/storage/messages";

interface StoriesContextValue {
  ready: boolean;
  tick: number;
  refresh: () => void;
  listFeedGroups: () => FeedStoryGroup[];
  createStory: (input: CreateStoryInput) => DualStory | null;
  viewStory: (storyId: string) => void;
  /** Mark every story in an opened group as seen (ring turns muted). */
  viewStories: (storyIds: string[]) => void;
  react: (storyId: string, kind: StoryReactionKind) => void;
  reply: (storyId: string, body: string, peerUserId: string) => boolean;
  deleteStory: (storyId: string) => boolean;
  archiveStory: (storyId: string) => boolean;
  listArchive: () => DualStory[];
  highlightsFor: (userId: string) => StoryHighlight[];
  createHighlight: (title: string) => StoryHighlight | null;
  addToHighlight: (highlightId: string, storyId: string) => void;
  muteUser: (userId: string) => void;
  /** Silently hide my stories from this user (they are not notified). */
  hideStoryFrom: (userId: string) => void;
  unhideStoryFrom: (userId: string) => void;
  isStoryHiddenFrom: (userId: string) => boolean;
  getUserActiveStories: (userId: string) => DualStory[];
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

export function StoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setReady(true);
  }, []);

  // Refresh periodically so stories leave the rail at 24h and land in archive
  useEffect(() => {
    const id = window.setInterval(() => refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const value = useMemo<StoriesContextValue>(() => {
    void tick;
    const viewerId = user?.id;
    return {
      ready,
      tick,
      refresh,
      listFeedGroups: () =>
        viewerId ? storiesStorage.listFeedGroups(viewerId) : [],
      createStory: (input) => {
        if (!viewerId) return null;
        const story = storiesStorage.createStory(viewerId, input);
        if (story) refresh();
        return story;
      },
      viewStory: (storyId) => {
        if (!viewerId) return;
        // Only refresh when a new view is stored — avoids a viewStory↔tick loop
        // while the viewer is open (new viewStory identity each tick).
        if (storiesStorage.recordView(storyId, viewerId)) refresh();
      },
      viewStories: (storyIds) => {
        if (!viewerId) return;
        if (storiesStorage.recordViews(storyIds, viewerId)) refresh();
      },
      react: (storyId, kind) => {
        if (!viewerId) return;
        storiesStorage.react(storyId, viewerId, kind);
        refresh();
      },
      reply: (storyId, body, peerUserId) => {
        if (!viewerId) return false;
        const r = storiesStorage.reply(storyId, viewerId, body);
        if (!r) return false;
        messagesStorage.sendMessage(
          viewerId,
          peerUserId,
          `Story reply: ${body.trim()}`,
        );
        refresh();
        return true;
      },
      deleteStory: (storyId) => {
        if (!viewerId) return false;
        const ok = storiesStorage.deleteStory(storyId, viewerId);
        if (ok) refresh();
        return ok;
      },
      archiveStory: (storyId) => {
        if (!viewerId) return false;
        const ok = storiesStorage.archiveStory(storyId, viewerId);
        if (ok) refresh();
        return ok;
      },
      listArchive: () =>
        viewerId ? storiesStorage.listArchive(viewerId) : [],
      highlightsFor: (userId) => storiesStorage.highlightsFor(userId),
      createHighlight: (title) => {
        if (!viewerId) return null;
        const h = storiesStorage.createHighlight(viewerId, title);
        refresh();
        return h;
      },
      addToHighlight: (highlightId, storyId) => {
        if (!viewerId) return;
        storiesStorage.addToHighlight(viewerId, highlightId, storyId);
        refresh();
      },
      muteUser: (mutedId) => {
        if (!viewerId) return;
        storiesStorage.muteUser(viewerId, mutedId);
        refresh();
      },
      hideStoryFrom: (targetUserId) => {
        if (!viewerId) return;
        storiesStorage.hideStoryFrom(viewerId, targetUserId);
        refresh();
      },
      unhideStoryFrom: (targetUserId) => {
        if (!viewerId) return;
        storiesStorage.unhideStoryFrom(viewerId, targetUserId);
        refresh();
      },
      isStoryHiddenFrom: (targetUserId) =>
        viewerId
          ? storiesStorage.isStoryHiddenFrom(viewerId, targetUserId)
          : false,
      getUserActiveStories: (userId) =>
        storiesStorage.getUserActiveStories(userId, viewerId),
    };
  }, [tick, user?.id, ready, refresh]);

  return (
    <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>
  );
}

export function useStories() {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error("useStories must be used within StoriesProvider");
  return ctx;
}
