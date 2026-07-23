import type { User } from "@supabase/supabase-js";
import type { PlanTier, UserProfile } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Build the app's UserProfile from Supabase Auth + profiles row.
 * Onboarding completion comes from profiles.onboarding_completed — never localStorage.
 */
export function buildSessionProfile(
  authUser: User,
  profile: ProfileRow | null,
  local: UserProfile | null,
): UserProfile {
  const sameLocal = local?.id === authUser.id ? local : null;
  const planFromDb = profile?.plan as PlanTier | undefined;
  const onboardingComplete = Boolean(profile?.onboarding_completed);

  return {
    id: authUser.id,
    fullName:
      profile?.full_name?.trim() ||
      sameLocal?.fullName?.trim() ||
      displayNameFromAuth(authUser),
    email: authUser.email ?? sameLocal?.email ?? "",
    emailVerified: Boolean(authUser.email_confirmed_at) || true,
    dateOfBirth: sameLocal?.dateOfBirth ?? "",
    country: sameLocal?.country ?? "",
    measurementSystem: sameLocal?.measurementSystem ?? "metric",
    // Prefer DB plan when present; keep local demo override otherwise.
    plan: planFromDb ?? sameLocal?.plan ?? "free",
    createdAt:
      authUser.created_at ?? sameLocal?.createdAt ?? new Date().toISOString(),
    onboardingComplete,
    // Once onboarding is done in DB, skip legacy intro/pricing gates.
    introSeen: onboardingComplete,
    pricingSeen: onboardingComplete,
  };
}

function displayNameFromAuth(user: User): string {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (fromMeta) return fromMeta;
  const email = user.email ?? "";
  return email.split("@")[0] || "Athlete";
}
