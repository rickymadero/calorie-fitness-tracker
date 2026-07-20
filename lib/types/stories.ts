/** Dual-camera fitness stories (localStorage-backed). */

export type StoryLayout =
  | "overlay_rear_main"
  | "overlay_selfie_main"
  | "split"
  | "stack";

export type StoryVisibility =
  | "public"
  | "followers"
  | "close_friends"
  | "selected"
  | "private";

export type StoryReactionKind =
  | "strong"
  | "great_work"
  | "keep_going"
  | "pr"
  | "fire"
  | "respect"
  | "lets_train";

export interface DualStory {
  id: string;
  userId: string;
  frontImageUrl: string;
  rearImageUrl: string;
  primaryImage: "rear" | "front";
  layout: StoryLayout;
  caption?: string;
  workoutType?: string;
  activityStats?: string;
  visibility: StoryVisibility;
  selectedUserIds?: string[];
  repliesEnabled: boolean;
  createdAt: string;
  expiresAt: string;
  deletedAt?: string;
  archivedAt?: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: string;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  kind: StoryReactionKind;
  createdAt: string;
}

export interface StoryReply {
  id: string;
  storyId: string;
  fromUserId: string;
  body: string;
  createdAt: string;
}

export interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  coverStoryId?: string;
  createdAt: string;
  order: number;
}

export interface StoryHighlightItem {
  id: string;
  highlightId: string;
  storyId: string;
  addedAt: string;
}

export interface StoriesStore {
  stories: DualStory[];
  views: StoryView[];
  reactions: StoryReaction[];
  replies: StoryReply[];
  highlights: StoryHighlight[];
  highlightItems: StoryHighlightItem[];
  /** Viewer muted these authors' stories (viewer-centric). */
  mutedUserIds: string[];
  /**
   * Owner → people who silently cannot see that owner's stories.
   * No notification when added.
   */
  storyHiddenFrom: Record<string, string[]>;
  closeFriendIds: Record<string, string[]>;
}

export interface FeedStoryGroup {
  userId: string;
  stories: DualStory[];
  hasUnseen: boolean;
}
