import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type PreferredUnits = Database["public"]["Enums"]["preferred_units"];

export type CompleteOnboardingInput = {
  username: string;
  fullName: string;
  bio?: string | null;
  isPrivate?: boolean;
  preferredUnits?: PreferredUnits;
};

export const profilesService = {
  async getById(client: EvolveClient, id: string) {
    return client.from("profiles").select("*").eq("id", id).maybeSingle();
  },

  async getByUsername(client: EvolveClient, username: string) {
    return client
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();
  },

  /** Never includes `plan` — client cannot self-upgrade. */
  async updateOwn(
    client: EvolveClient,
    userId: string,
    patch: Omit<ProfileUpdate, "plan" | "id">,
  ) {
    const { plan: _ignored, ...safe } = patch as ProfileUpdate;
    void _ignored;
    return client.from("profiles").update(safe).eq("id", userId).select().single();
  },

  /**
   * Persist onboarding selections and mark the profile complete.
   * Returns the updated row or an error — callers must verify success.
   */
  async completeOnboarding(
    client: EvolveClient,
    userId: string,
    input: CompleteOnboardingInput,
  ) {
    const completedAt = new Date().toISOString();
    const { data, error } = await client
      .from("profiles")
      .update({
        username: input.username,
        full_name: input.fullName,
        bio: input.bio ?? null,
        is_private: input.isPrivate ?? false,
        onboarding_completed: true,
        onboarding_completed_at: completedAt,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) return { data: null, error };

    if (input.preferredUnits) {
      const settingsResult = await client
        .from("user_settings")
        .update({ preferred_units: input.preferredUnits })
        .eq("user_id", userId);
      if (settingsResult.error) {
        return { data, error: settingsResult.error };
      }
    }

    return { data, error: null };
  },
};
