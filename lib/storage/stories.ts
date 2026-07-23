import type {
  DualStory,
  FeedStoryGroup,
  StoriesStore,
  StoryHighlight,
  StoryHighlightItem,
  StoryReaction,
  StoryReactionKind,
  StoryReply,
  StoryView,
  StoryVisibility,
} from "@/lib/types/stories";
import { socialStorage } from "@/lib/storage/social";
import { SEED_STORIES } from "@/lib/mock/seedStories";

const KEY = "evolve.stories";
/** Compact key — views must not rewrite the large stories blob (quota fails silently). */
const VIEWS_KEY = "evolve.storyViews";
const DAY_MS = 24 * 60 * 60 * 1000;

function canUse() {
  return typeof window !== "undefined";
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function readViews(): StoryView[] {
  if (!canUse()) return [];
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoryView[];
      return Array.isArray(parsed) ? parsed : [];
    }
    // One-time migrate out of the main stories blob
    const mainRaw = localStorage.getItem(KEY);
    if (!mainRaw) return [];
    const store = JSON.parse(mainRaw) as StoriesStore;
    const migrated = Array.isArray(store.views) ? store.views : [];
    if (migrated.length > 0) {
      localStorage.setItem(VIEWS_KEY, JSON.stringify(migrated));
      store.views = [];
      try {
        localStorage.setItem(KEY, JSON.stringify(store));
      } catch {
        /* main blob may already be over quota — views still live in VIEWS_KEY */
      }
    }
    return migrated;
  } catch {
    return [];
  }
}

function writeViews(views: StoryView[]) {
  if (!canUse()) return;
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch (err) {
    console.error("evolve.storyViews: write failed", err);
  }
}

function freshSeedStories(): DualStory[] {
  return SEED_STORIES.map((seed, i) => ({
    ...seed,
    createdAt: new Date(Date.now() - (30 + i * 20) * 60 * 1000).toISOString(),
    expiresAt: new Date(
      Date.now() + (23 - (i % 8)) * 60 * 60 * 1000,
    ).toISOString(),
  }));
}

function emptyStore(): StoriesStore {
  return {
    stories: [],
    views: [],
    reactions: [],
    replies: [],
    highlights: [],
    highlightItems: [],
    mutedUserIds: [],
    storyHiddenFrom: {},
    closeFriendIds: {},
  };
}

function write(store: StoriesStore) {
  if (!canUse()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (err) {
    console.error("evolve.stories: write failed", err);
  }
}

/**
 * Active stories last 24h. When they expire, move to archive automatically.
 * Manual delete (deletedAt) never archives — those stay gone.
 */
function sweepExpiredToArchive(store: StoriesStore): boolean {
  const now = Date.now();
  let changed = false;
  for (const s of store.stories) {
    if (s.deletedAt || s.archivedAt) continue;
    if (new Date(s.expiresAt).getTime() > now) continue;
    s.archivedAt = new Date(
      Math.max(new Date(s.expiresAt).getTime(), now),
    ).toISOString();
    changed = true;
  }
  return changed;
}

function read(): StoriesStore {
  if (!canUse()) return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = emptyStore();
      initial.stories = freshSeedStories();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as StoriesStore;
    parsed.stories = parsed.stories ?? [];
    parsed.views = parsed.views ?? [];
    parsed.reactions = parsed.reactions ?? [];
    parsed.replies = parsed.replies ?? [];
    parsed.highlights = parsed.highlights ?? [];
    parsed.highlightItems = parsed.highlightItems ?? [];
    parsed.mutedUserIds = parsed.mutedUserIds ?? [];
    parsed.storyHiddenFrom = parsed.storyHiddenFrom ?? {};
    parsed.closeFriendIds = parsed.closeFriendIds ?? {};

    // Merge / refresh demo stories so the Feed rail stays populated for demos
    const storyById = new Map(parsed.stories.map((s) => [s.id, s]));
    let seeded = false;
    for (const seed of SEED_STORIES) {
      const existing = storyById.get(seed.id);
      if (!existing) {
        parsed.stories.push({
          ...seed,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        });
        seeded = true;
      } else if (
        existing.deletedAt ||
        existing.archivedAt ||
        new Date(existing.expiresAt).getTime() <= Date.now()
      ) {
        existing.deletedAt = undefined;
        existing.archivedAt = undefined;
        existing.frontImageUrl = seed.frontImageUrl;
        existing.rearImageUrl = seed.rearImageUrl;
        existing.visibility = seed.visibility;
        existing.createdAt = new Date(Date.now() - 90 * 60 * 1000).toISOString();
        existing.expiresAt = new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString();
        seeded = true;
      }
    }

    const swept = sweepExpiredToArchive(parsed);
    if (seeded || swept) {
      try {
        localStorage.setItem(KEY, JSON.stringify(parsed));
      } catch {
        /* quota — keep in-memory merge for session */
      }
    }

    return parsed;
  } catch {
    return emptyStore();
  }
}

function isFollowing(viewerId: string, authorId: string) {
  return socialStorage
    .getFollows()
    .some((f) => f.followerId === viewerId && f.followingId === authorId);
}

function isBlocked(a: string, b: string) {
  return socialStorage
    .getBlocks()
    .some(
      (x) =>
        (x.blockerId === a && x.blockedId === b) ||
        (x.blockerId === b && x.blockedId === a),
    );
}

function canViewStory(
  story: DualStory,
  viewerId: string | null | undefined,
): boolean {
  if (story.deletedAt) return false;
  if (story.archivedAt && story.userId !== viewerId) return false;
  if (new Date(story.expiresAt).getTime() < Date.now() && !story.archivedAt) {
    return story.userId === viewerId;
  }
  if (!viewerId) return story.visibility === "public";
  if (story.userId === viewerId) return true;
  if (isBlocked(viewerId, story.userId)) return false;

  // Silent hide: owner hid stories from this viewer (no notification)
  const hiddenFor = read().storyHiddenFrom[story.userId] ?? [];
  if (hiddenFor.includes(viewerId)) return false;

  const author = socialStorage.getProfileByUserId(story.userId);
  if (
    author?.visibility === "private" &&
    !isFollowing(viewerId, story.userId)
  ) {
    return false;
  }

  switch (story.visibility) {
    case "public":
      return true;
    case "followers":
      return isFollowing(viewerId, story.userId);
    case "close_friends": {
      const list = read().closeFriendIds[story.userId] ?? [];
      return list.includes(viewerId);
    }
    case "selected":
      return (story.selectedUserIds ?? []).includes(viewerId);
    case "private":
      return false;
    default:
      return false;
  }
}

export type CreateStoryInput = {
  frontImageUrl: string;
  rearImageUrl: string;
  primaryImage?: "rear" | "front";
  layout?: DualStory["layout"];
  caption?: string;
  workoutType?: string;
  activityStats?: string;
  visibility?: StoryVisibility;
  selectedUserIds?: string[];
  repliesEnabled?: boolean;
};

export const storiesStorage = {
  createStory(userId: string, input: CreateStoryInput): DualStory | null {
    if (!input.frontImageUrl || !input.rearImageUrl) return null;
    const store = read();
    const now = Date.now();
    const story: DualStory = {
      id: uid("story"),
      userId,
      frontImageUrl: input.frontImageUrl,
      rearImageUrl: input.rearImageUrl,
      primaryImage: input.primaryImage ?? "rear",
      layout: input.layout ?? "overlay_rear_main",
      caption: input.caption?.trim().slice(0, 140) || undefined,
      workoutType: input.workoutType,
      activityStats: input.activityStats,
      visibility: input.visibility ?? "followers",
      selectedUserIds: input.selectedUserIds,
      repliesEnabled: input.repliesEnabled ?? true,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + DAY_MS).toISOString(),
    };
    store.stories.unshift(story);
    write(store);
    return story;
  },

  listFeedGroups(viewerId: string): FeedStoryGroup[] {
    const store = read();
    const muted = new Set(store.mutedUserIds);
    const followingIds = new Set(
      socialStorage
        .getFollows()
        .filter((f) => f.followerId === viewerId)
        .map((f) => f.followingId),
    );

    const active = store.stories.filter((s) => {
      if (s.deletedAt || s.archivedAt) return false;
      if (new Date(s.expiresAt).getTime() <= Date.now()) return false;
      if (muted.has(s.userId)) return false;
      if (!canViewStory(s, viewerId)) return false;
      // Rail = you + people you follow (BeReal / Instagram style)
      if (s.userId !== viewerId && !followingIds.has(s.userId)) return false;
      return true;
    });

    const byUser = new Map<string, DualStory[]>();
    for (const s of active) {
      const list = byUser.get(s.userId) ?? [];
      list.push(s);
      byUser.set(s.userId, list);
    }

    const viewed = new Set(
      readViews()
        .filter((v) => v.viewerId === viewerId)
        .map((v) => v.storyId),
    );

    const groups: FeedStoryGroup[] = [];
    for (const [userId, stories] of byUser) {
      stories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      groups.push({
        userId,
        stories,
        hasUnseen: stories.some((s) => !viewed.has(s.id)),
      });
    }

    // Self first, then unseen, then rest
    groups.sort((a, b) => {
      if (a.userId === viewerId) return -1;
      if (b.userId === viewerId) return 1;
      if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
      const aT = a.stories[a.stories.length - 1]?.createdAt ?? "";
      const bT = b.stories[b.stories.length - 1]?.createdAt ?? "";
      return bT.localeCompare(aT);
    });
    return groups;
  },

  getStory(storyId: string, viewerId?: string | null) {
    const story = read().stories.find((s) => s.id === storyId);
    if (!story || !canViewStory(story, viewerId)) return null;
    return story;
  },

  getUserActiveStories(userId: string, viewerId?: string | null) {
    return read()
      .stories.filter(
        (s) =>
          s.userId === userId &&
          !s.deletedAt &&
          !s.archivedAt &&
          new Date(s.expiresAt).getTime() > Date.now() &&
          canViewStory(s, viewerId),
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  },

  /**
   * Persist that `viewerId` saw this story (including own stories).
   * Returns the new view, or null if already recorded.
   */
  recordView(storyId: string, viewerId: string): StoryView | null {
    const views = readViews();
    if (views.some((v) => v.storyId === storyId && v.viewerId === viewerId)) {
      return null;
    }
    const view: StoryView = {
      id: uid("sview"),
      storyId,
      viewerId,
      viewedAt: new Date().toISOString(),
    };
    views.push(view);
    writeViews(views);
    return view;
  },

  /** Mark many stories seen in one write. Returns true if anything new was stored. */
  recordViews(storyIds: string[], viewerId: string): boolean {
    if (!storyIds.length) return false;
    const views = readViews();
    const seen = new Set(
      views
        .filter((v) => v.viewerId === viewerId)
        .map((v) => v.storyId),
    );
    let changed = false;
    const now = new Date().toISOString();
    for (const storyId of storyIds) {
      if (seen.has(storyId)) continue;
      views.push({
        id: uid("sview"),
        storyId,
        viewerId,
        viewedAt: now,
      });
      seen.add(storyId);
      changed = true;
    }
    if (changed) writeViews(views);
    return changed;
  },

  react(
    storyId: string,
    userId: string,
    kind: StoryReactionKind,
  ): StoryReaction | null {
    const store = read();
    const story = store.stories.find((s) => s.id === storyId);
    if (!story || !canViewStory(story, userId)) return null;
    store.reactions = store.reactions.filter(
      (r) => !(r.storyId === storyId && r.userId === userId),
    );
    const reaction: StoryReaction = {
      id: uid("srx"),
      storyId,
      userId,
      kind,
      createdAt: new Date().toISOString(),
    };
    store.reactions.push(reaction);
    write(store);
    return reaction;
  },

  reply(storyId: string, fromUserId: string, body: string): StoryReply | null {
    const text = body.trim().slice(0, 500);
    if (!text) return null;
    const store = read();
    const story = store.stories.find((s) => s.id === storyId);
    if (!story || !story.repliesEnabled || !canViewStory(story, fromUserId)) {
      return null;
    }
    const reply: StoryReply = {
      id: uid("srep"),
      storyId,
      fromUserId,
      body: text,
      createdAt: new Date().toISOString(),
    };
    store.replies.push(reply);
    write(store);
    return reply;
  },

  deleteStory(storyId: string, userId: string) {
    const store = read();
    const s = store.stories.find((x) => x.id === storyId);
    if (!s || s.userId !== userId) return false;
    // Permanent remove from feed + archive
    s.deletedAt = new Date().toISOString();
    s.archivedAt = undefined;
    write(store);
    return true;
  },

  archiveStory(storyId: string, userId: string) {
    const store = read();
    const s = store.stories.find((x) => x.id === storyId);
    if (!s || s.userId !== userId || s.deletedAt) return false;
    s.archivedAt = new Date().toISOString();
    write(store);
    return true;
  },

  listArchive(userId: string) {
    // Ensure anything past 24h is archived before listing
    const store = read();
    return store.stories
      .filter((s) => s.userId === userId && !s.deletedAt && !!s.archivedAt)
      .sort(
        (a, b) =>
          new Date(b.archivedAt!).getTime() -
          new Date(a.archivedAt!).getTime(),
      );
  },

  listViewsForOwner(storyId: string, ownerId: string) {
    const store = read();
    const s = store.stories.find((x) => x.id === storyId);
    if (!s || s.userId !== ownerId) return [];
    return readViews().filter((v) => v.storyId === storyId);
  },

  muteUser(viewerId: string, mutedId: string) {
    const store = read();
    if (!store.mutedUserIds.includes(mutedId)) {
      store.mutedUserIds.push(mutedId);
      write(store);
    }
  },

  /** Owner hides their stories from targetUserId — silent, no notification. */
  hideStoryFrom(ownerId: string, targetUserId: string) {
    if (ownerId === targetUserId) return;
    const store = read();
    const list = store.storyHiddenFrom[ownerId] ?? [];
    if (!list.includes(targetUserId)) {
      store.storyHiddenFrom[ownerId] = [...list, targetUserId];
      write(store);
    }
  },

  unhideStoryFrom(ownerId: string, targetUserId: string) {
    const store = read();
    const list = store.storyHiddenFrom[ownerId] ?? [];
    store.storyHiddenFrom[ownerId] = list.filter((id) => id !== targetUserId);
    write(store);
  },

  isStoryHiddenFrom(ownerId: string, targetUserId: string) {
    return (read().storyHiddenFrom[ownerId] ?? []).includes(targetUserId);
  },

  highlightsFor(userId: string) {
    return read()
      .highlights.filter((h) => h.userId === userId)
      .sort((a, b) => a.order - b.order);
  },

  createHighlight(userId: string, title: string): StoryHighlight {
    const store = read();
    const highlight: StoryHighlight = {
      id: uid("hl"),
      userId,
      title: title.trim().slice(0, 40) || "Highlight",
      createdAt: new Date().toISOString(),
      order: store.highlights.filter((h) => h.userId === userId).length,
    };
    store.highlights.push(highlight);
    write(store);
    return highlight;
  },

  addToHighlight(
    userId: string,
    highlightId: string,
    storyId: string,
  ): StoryHighlightItem | null {
    const store = read();
    const hl = store.highlights.find(
      (h) => h.id === highlightId && h.userId === userId,
    );
    const story = store.stories.find(
      (s) => s.id === storyId && s.userId === userId && !s.deletedAt,
    );
    if (!hl || !story) return null;
    if (
      store.highlightItems.some(
        (i) => i.highlightId === highlightId && i.storyId === storyId,
      )
    ) {
      return null;
    }
    const item: StoryHighlightItem = {
      id: uid("hli"),
      highlightId,
      storyId,
      addedAt: new Date().toISOString(),
    };
    store.highlightItems.push(item);
    if (!hl.coverStoryId) hl.coverStoryId = storyId;
    write(store);
    return item;
  },

  itemsForHighlight(highlightId: string) {
    const store = read();
    return store.highlightItems
      .filter((i) => i.highlightId === highlightId)
      .map((i) => store.stories.find((s) => s.id === i.storyId))
      .filter((s): s is DualStory => !!s && !s.deletedAt);
  },
};
