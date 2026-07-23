import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type EvolveClient = SupabaseClient<Database>;

/**
 * Supabase Auth helpers for Evolve.
 */
export const authService = {
  async signUp(
    client: EvolveClient,
    input: { email: string; password: string; fullName?: string },
  ) {
    return client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: input.fullName ? { full_name: input.fullName } : undefined,
      },
    });
  },

  async signIn(
    client: EvolveClient,
    input: { email: string; password: string },
  ) {
    return client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
  },

  async signOut(client: EvolveClient) {
    return client.auth.signOut();
  },

  async getUser(client: EvolveClient) {
    return client.auth.getUser();
  },

  async getSession(client: EvolveClient) {
    return client.auth.getSession();
  },

  async resetPasswordForEmail(
    client: EvolveClient,
    email: string,
    redirectTo: string,
  ) {
    return client.auth.resetPasswordForEmail(email, { redirectTo });
  },

  async updatePassword(client: EvolveClient, password: string) {
    return client.auth.updateUser({ password });
  },

  async updateEmail(client: EvolveClient, email: string) {
    return client.auth.updateUser({ email });
  },

  async updateMetadata(
    client: EvolveClient,
    data: Record<string, string | undefined>,
  ) {
    return client.auth.updateUser({ data });
  },
};

export type AuthUser = User;
