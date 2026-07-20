/** Social workout posts (Free tier) — Strava-style activity data */

export type ActivityType =
  | "running"
  | "walking"
  | "cycling"
  | "swimming"
  | "gym"
  | "yoga"
  | "sports"
  | "hiking"
  | "custom";

export type PostVisibility = "public" | "followers" | "private" | "selected";

export interface RoutePoint {
  lat: number;
  lng: number;
  /** Optional altitude meters */
  elev?: number;
  /** Seconds from activity start */
  t?: number;
}

export interface SplitKm {
  km: number;
  paceMinPerKm: number;
}

export interface GymExerciseSummary {
  name: string;
  sets: number;
  reps?: number;
  weightKg?: number;
}

export interface ActivityAchievement {
  id: string;
  label: string;
}

export interface WorkoutPost {
  id: string;
  authorId: string;
  type: ActivityType;
  title: string;
  caption: string;
  occurredAt: string;
  createdAt: string;
  visibility: PostVisibility;
  photoUrl?: string;
  photos?: string[];
  /** Demo data-URL or remote URL for an uploaded clip */
  videoUrl?: string;
  distanceKm?: number;
  durationMin?: number;
  movingTimeMin?: number;
  paceMinPerKm?: number;
  fastestPaceMinPerKm?: number;
  avgSpeedKmh?: number;
  maxSpeedKmh?: number;
  caloriesBurned?: number;
  elevationGainM?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  cadence?: number;
  locationName?: string;
  /** GPS polyline — full detail for detail page; feed uses simplified sample */
  route?: RoutePoint[];
  /** Decimated preview (~40–80 pts) for feed maps */
  routePreview?: RoutePoint[];
  routeVisible?: boolean;
  hideStart?: boolean;
  hideEnd?: boolean;
  commentsEnabled?: boolean;
  gymSummary?: string;
  muscleGroups?: string[];
  exerciseCount?: number;
  totalSets?: number;
  totalReps?: number;
  totalVolumeKg?: number;
  exercises?: GymExerciseSummary[];
  achievements?: ActivityAchievement[];
  splits?: SplitKm[];
  likesCount: number;
  commentsCount: number;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  body: string;
  createdAt: string;
}

export interface SavedActivity {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PostsStore {
  posts: WorkoutPost[];
  likes: PostLike[];
  comments: PostComment[];
  saved: SavedActivity[];
}

export interface CreatePostInput {
  type: ActivityType;
  title: string;
  caption: string;
  occurredAt: string;
  visibility: PostVisibility;
  photoUrl?: string;
  photos?: string[];
  videoUrl?: string;
  distanceKm?: number;
  durationMin?: number;
  caloriesBurned?: number;
  gymSummary?: string;
  muscleGroups?: string[];
  exercises?: GymExerciseSummary[];
  route?: RoutePoint[];
  routePreview?: RoutePoint[];
  elevationGainM?: number;
  locationName?: string;
  routeVisible?: boolean;
  hideStart?: boolean;
  hideEnd?: boolean;
  commentsEnabled?: boolean;
}
