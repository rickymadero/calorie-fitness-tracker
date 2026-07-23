import type { EvolveClient } from "@/lib/services/auth";
import type { ProfileRow } from "@/lib/services/profiles";
import { profilesService } from "@/lib/services/profiles";
import {
  userSettingsService,
  type UserSettingsRow,
  type ThemePreference,
} from "@/lib/services/userSettings";
import { storage } from "@/lib/storage";
import { settingsPrefs } from "@/lib/storage/settingsPrefs";
import { socialStorage } from "@/lib/storage/social";
import { STORAGE_KEY as LANGUAGE_KEY } from "@/lib/i18n/i18n";

export type BridgeStatus =
  | "migrated"
  | "partial"
  | "skipped"
  | "failed";

export type BridgeResult = {
  status: BridgeStatus;
  profileFields: string[];
  settingsFields: string[];
};

function markerKey(userId: string) {
  return `evolve.profileSettingsMigrated.${userId}`;
}

function hasMigrated(userId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(markerKey(userId)) === "1";
  } catch {
    return false;
  }
}

function markMigrated(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(markerKey(userId), "1");
  } catch {
    /* ignore quota */
  }
}

function isBlank(value: string | null | undefined): boolean {
  return !value || !value.trim();
}

function isPlaceholderUsername(username: string, email?: string | null): boolean {
  const u = username.toLowerCase();
  if (!u || u.startsWith("athlete")) return true;
  const local = (email ?? "").split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return Boolean(local && u === local);
}

function readDeviceLanguage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

function resolveTheme(raw: string | null): ThemePreference | null {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return null;
}

/**
 * One-time bridge: fill empty Supabase profile/settings from localStorage.
 * Never overwrites non-empty Supabase values. Does not delete localStorage.
 */
export async function runProfileSettingsBridge(
  client: EvolveClient,
  userId: string,
  profile: ProfileRow | null,
  settings: UserSettingsRow | null,
  authEmail?: string | null,
): Promise<BridgeResult> {
  if (hasMigrated(userId)) {
    return { status: "skipped", profileFields: [], settingsFields: [] };
  }

  const profileFields: string[] = [];
  const settingsFields: string[] = [];

  try {
    const localUser = storage.getUser();
    const sameUser = localUser?.id === userId ? localUser : null;
    const social = socialStorage.getProfileByUserId(userId);

    if (profile) {
      const patch: {
        full_name?: string;
        bio?: string | null;
        username?: string;
        avatar_url?: string | null;
        is_private?: boolean;
      } = {};

      if (isBlank(profile.full_name)) {
        const name =
          sameUser?.fullName?.trim() || social?.displayName?.trim() || "";
        if (name) {
          patch.full_name = name.slice(0, 80);
          profileFields.push("full_name");
        }
      }

      if (isBlank(profile.bio) && social?.bio?.trim()) {
        patch.bio = social.bio.slice(0, 160);
        profileFields.push("bio");
      }

      if (
        social?.username &&
        isPlaceholderUsername(profile.username, authEmail) &&
        !isPlaceholderUsername(social.username, authEmail)
      ) {
        const available = await profilesService.isUsernameAvailable(
          client,
          social.username,
          userId,
        );
        if (available.available) {
          patch.username = social.username.toLowerCase();
          profileFields.push("username");
        }
      }

      if (
        isBlank(profile.avatar_url) &&
        social?.avatarUrl &&
        /^https?:\/\//i.test(social.avatarUrl)
      ) {
        patch.avatar_url = social.avatarUrl;
        profileFields.push("avatar_url");
      }

      if (
        profile.is_private === false &&
        social?.visibility === "private"
      ) {
        patch.is_private = true;
        profileFields.push("is_private");
      }

      if (Object.keys(patch).length > 0) {
        const { error } = await profilesService.updateOwn(client, userId, patch);
        if (error) {
          console.info("[profileSettingsBridge] profile update failed", {
            status: "failed",
          });
          return {
            status: "failed",
            profileFields,
            settingsFields,
          };
        }
      }
    }

    if (settings) {
      const patch: {
        preferred_units?: "metric" | "imperial";
        language?: string;
        theme?: ThemePreference;
      } = {};

      // Defaults from signup are metric/en/system — only migrate when local differs
      // and we treat "still default" carefully: fill when local has an explicit value.
      const localUnits = sameUser?.measurementSystem;
      if (
        localUnits &&
        (localUnits === "metric" || localUnits === "imperial") &&
        settings.preferred_units === "metric" &&
        localUnits === "imperial"
      ) {
        patch.preferred_units = "imperial";
        settingsFields.push("preferred_units");
      }

      const localLang = readDeviceLanguage() || settingsPrefs.getLanguage();
      if (
        localLang &&
        localLang !== "en" &&
        (settings.language === "en" || !settings.language)
      ) {
        patch.language = localLang;
        settingsFields.push("language");
      }

      const localTheme = resolveTheme(storage.getTheme());
      if (
        localTheme &&
        localTheme !== "system" &&
        (settings.theme === "system" || !settings.theme)
      ) {
        patch.theme = localTheme;
        settingsFields.push("theme");
      }

      if (Object.keys(patch).length > 0) {
        const { error } = await userSettingsService.updateOwn(
          client,
          userId,
          patch,
        );
        if (error) {
          console.info("[profileSettingsBridge] settings update failed", {
            status: "failed",
          });
          return {
            status: profileFields.length ? "partial" : "failed",
            profileFields,
            settingsFields,
          };
        }
      }
    }

    markMigrated(userId);

    const changed = profileFields.length + settingsFields.length;
    const status: BridgeStatus =
      changed === 0 ? "skipped" : profileFields.length && settingsFields.length
        ? "migrated"
        : changed > 0
          ? profileFields.length && !settings
            ? "partial"
            : "migrated"
          : "skipped";

    console.info("[profileSettingsBridge]", {
      status: changed === 0 ? "skipped" : status === "partial" ? "partial" : "migrated",
      profileFieldCount: profileFields.length,
      settingsFieldCount: settingsFields.length,
    });

    return {
      status: changed === 0 ? "skipped" : "migrated",
      profileFields,
      settingsFields,
    };
  } catch {
    console.info("[profileSettingsBridge]", { status: "failed" });
    return { status: "failed", profileFields, settingsFields };
  }
}
