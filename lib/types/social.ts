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
