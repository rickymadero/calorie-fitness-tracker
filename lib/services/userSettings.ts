import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];
type UserSettingsUpdate =
  Database["public"]["Tables"]["user_settings"]["Update"];
type PreferredUnits = Database["public"]["Enums"]["preferred_units"];
type ThemePreference = Database["public"]["Enums"]["theme_preference"];

export type { UserSettingsRow, PreferredUnits, ThemePreference };

export const userSettingsService = {
  async getByUserId(client: EvolveClient, userId: string) {
    return client
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
  },

  async updateOwn(
    client: EvolveClient,
    userId: string,
    patch: Omit<UserSettingsUpdate, "user_id">,
  ) {
    const { user_id: _ignored, ...safe } = patch as UserSettingsUpdate;
    void _ignored;
    return client
      .from("user_settings")
      .update(safe)
      .eq("user_id", userId)
      .select("*")
      .single();
  },

  async updatePreferredUnits(
    client: EvolveClient,
    userId: string,
    preferredUnits: PreferredUnits,
  ) {
    return this.updateOwn(client, userId, {
      preferred_units: preferredUnits,
    });
  },

  async updateLanguage(client: EvolveClient, userId: string, language: string) {
    return this.updateOwn(client, userId, { language });
  },

  async updateTheme(
    client: EvolveClient,
    userId: string,
    theme: ThemePreference,
  ) {
    return this.updateOwn(client, userId, { theme });
  },
};
