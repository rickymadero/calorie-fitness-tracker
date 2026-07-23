import type { ProfileRow } from "@/lib/services/profiles";
import { socialStorage } from "@/lib/storage/social";
import type { SocialProfile } from "@/lib/types/social";

/**
 * Mirror Supabase profile fields into the local social overlay for display.
 * Does not touch follows, posts, or other social graph data.
 * Keeps existing local avatar data URLs when DB avatar_url is empty.
 */
export function mirrorSupabaseProfileToSocial(
  profile: ProfileRow,
  fallbackFullName?: string,
): SocialProfile {
  const existing = socialStorage.getProfileByUserId(profile.id);
  const displayName =
    profile.full_name?.trim() ||
    existing?.displayName ||
    fallbackFullName?.trim() ||
    "Athlete";
  const dbAvatar =
    profile.avatar_url && /^https?:\/\//i.test(profile.avatar_url)
      ? profile.avatar_url
      : "";
  const localAvatar = existing?.avatarUrl ?? "";
  const keepLocalDataUrl =
    localAvatar.startsWith("data:") && !dbAvatar ? localAvatar : dbAvatar;

  const next: SocialProfile = {
    userId: profile.id,
    username: profile.username,
    displayName,
    bio: profile.bio ?? "",
    avatarUrl: keepLocalDataUrl || dbAvatar || localAvatar || "",
    fitnessGoals: existing?.fitnessGoals ?? [],
    favoriteWorkouts: existing?.favoriteWorkouts ?? [],
    location: existing?.location,
    showLocation: existing?.showLocation ?? false,
    countryCode: existing?.countryCode,
    instagramUsername: existing?.instagramUsername,
    showInstagram: existing?.showInstagram ?? false,
    visibility: profile.is_private ? "private" : "public",
    joinedAt: existing?.joinedAt ?? profile.created_at,
    stats: existing?.stats ?? {
      workoutsCompleted: 0,
      totalRunKm: 0,
      totalWorkoutMinutes: 0,
    },
    personalRecords: existing?.personalRecords ?? [],
  };

  return socialStorage.upsertProfile(next);
}
