import type { User } from "@supabase/supabase-js";
import type { PlanTier, UserProfile, MeasurementSystem } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];

/**
 * Build the app's UserProfile from Supabase Auth + profiles + user_settings.
 * Onboarding completion comes from profiles.onboarding_completed — never localStorage.
 */
export function buildSessionProfile(
  authUser: User,
  profile: ProfileRow | null,
  local: UserProfile | null,
  settings?: UserSettingsRow | null,
): UserProfile {
  const sameLocal = local?.id === authUser.id ? local : null;
  const planFromDb = profile?.plan as PlanTier | undefined;
  const onboardingComplete = Boolean(profile?.onboarding_completed);

  const unitsFromSettings = settings?.preferred_units as
    | MeasurementSystem
    | undefined;

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
    measurementSystem:
      unitsFromSettings ?? sameLocal?.measurementSystem ?? "metric",
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

/** Map DB theme preference to the app's light/dark ThemeProvider. */
export function resolveAppTheme(
  preference: Database["public"]["Enums"]["theme_preference"] | null | undefined,
): "light" | "dark" {
  if (preference === "light" || preference === "dark") return preference;
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}
