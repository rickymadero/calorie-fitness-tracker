/** Social fitness network types (Phase 1) — free tier */

export type ProfileVisibility = "public" | "private";

export type FollowStatus =
  | "none"
  | "following"
  | "requested"
  | "follows_you"
  | "mutual"
  | "blocked";

export type WorkoutInterest =
  | "running"
  | "walking"
  | "cycling"
  | "gym"
  | "weightlifting"
  | "hiit"
  | "yoga"
  | "swimming"
  | "hiking"
  | "sports";

/** Public-facing personal records shown on athlete profiles */
export type PrCategory = "strength" | "running" | "endurance" | "other";

export interface AthletePersonalRecord {
  id: string;
  category: PrCategory;
  /** e.g. Bench press, 5K, HYROX, Ironman */
  label: string;
  /** Display value e.g. "100 kg", "22:14", "1:18:42" */
  value: string;
  achievedAt?: string;
  notes?: string;
}

export interface SocialProfile {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  /** Soft fitness goals shown publicly (not private health metrics) */
  fitnessGoals: string[];
  favoriteWorkouts: WorkoutInterest[];
  location?: string;
  showLocation: boolean;
  /** ISO 3166-1 alpha-2 — shown as flag on feed + profiles */
  countryCode?: string;
  instagramUsername?: string;
  showInstagram: boolean;
  visibility: ProfileVisibility;
  joinedAt: string;
  /** Aggregate stats (mock-friendly; updated later by activities) */
  stats: {
    workoutsCompleted: number;
    totalRunKm: number;
    totalWorkoutMinutes: number;
  };
  /** Strength / run / race PRs visible on the public profile */
  personalRecords: AthletePersonalRecord[];
}

export interface FollowEdge {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  respondedAt?: string;
}

export interface BlockEdge {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface SocialStore {
  profiles: SocialProfile[];
  follows: FollowEdge[];
  requests: FollowRequest[];
  blocks: BlockEdge[];
  /** UserIds dismissed from Feed suggested-people carousel */
  dismissedSuggestions?: string[];
}

export interface PublicSocialCard {
  profile: SocialProfile;
  followersCount: number;
  followingCount: number;
  /** Relationship from the viewing user's perspective */
  relation: FollowStatus;
  /** Limited view for private profiles when not approved */
  limited: boolean;
}
