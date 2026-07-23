import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type PreferredUnits = Database["public"]["Enums"]["preferred_units"];

export type { ProfileRow };

export type CompleteOnboardingInput = {
  username: string;
  fullName: string;
  bio?: string | null;
  isPrivate?: boolean;
  preferredUnits?: PreferredUnits;
};

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export function normalizeUsername(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

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

  /**
   * Returns true when username is free (or owned by exceptUserId).
   */
  async isUsernameAvailable(
    client: EvolveClient,
    username: string,
    exceptUserId?: string,
  ) {
    const clean = normalizeUsername(username);
    if (!isValidUsername(clean)) {
      return { available: false, error: new Error("Invalid username.") };
    }
    const { data, error } = await this.getByUsername(client, clean);
    if (error) return { available: false, error };
    if (!data) return { available: true, error: null };
    if (exceptUserId && data.id === exceptUserId) {
      return { available: true, error: null };
    }
    return { available: false, error: null };
  },

  /** Never includes `plan` or `id` — client cannot self-upgrade or reassign. */
  async updateOwn(
    client: EvolveClient,
    userId: string,
    patch: Omit<ProfileUpdate, "plan" | "id">,
  ) {
    const { plan: _plan, id: _id, ...safe } = patch as ProfileUpdate;
    void _plan;
    void _id;
    return client
      .from("profiles")
      .update(safe)
      .eq("id", userId)
      .select("*")
      .single();
  },

  async updateUsername(client: EvolveClient, userId: string, username: string) {
    const clean = normalizeUsername(username);
    if (!isValidUsername(clean)) {
      return {
        data: null,
        error: { message: "Username must be 3–30 characters: a-z, 0-9, _." },
      };
    }
    const check = await this.isUsernameAvailable(client, clean, userId);
    if (check.error) return { data: null, error: check.error };
    if (!check.available) {
      return { data: null, error: { message: "Username is already taken." } };
    }
    return this.updateOwn(client, userId, { username: clean });
  },

  async updateAvatarUrl(
    client: EvolveClient,
    userId: string,
    avatarUrl: string | null,
  ) {
    return this.updateOwn(client, userId, { avatar_url: avatarUrl });
  },

  async updatePrivacy(
    client: EvolveClient,
    userId: string,
    isPrivate: boolean,
  ) {
    return this.updateOwn(client, userId, { is_private: isPrivate });
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

  async markOnboardingCompleted(client: EvolveClient, userId: string) {
    return this.updateOwn(client, userId, {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    });
  },
};
