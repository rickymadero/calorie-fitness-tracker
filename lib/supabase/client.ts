import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (Client Components).
 * Uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (prefer sb_publishable_… with
 * asymmetric ES256 signing keys). Singleton keeps Auth session attached.
 * Does not set a custom Authorization header — supabase-js attaches the
 * session access token via fetchWithAuth.
 */
let browserClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  browserClient = createBrowserClient<Database>(url, key, {
    isSingleton: true,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
