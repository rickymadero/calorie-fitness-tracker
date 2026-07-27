import type { EvolveClient } from "@/lib/services/auth";
import { createClient } from "@/lib/supabase/client";

export type AuthedClient = {
  client: EvolveClient;
  userId: string;
};

export type PostgrestErrorFields = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

/**
 * Browser client with a verified Auth session for RLS writes.
 * Uses getClaims() + getSession() — does not manually set Authorization.
 */
export async function getAuthedClient(): Promise<AuthedClient> {
  const client = createClient();

  const { data: claimsData, error: claimsError } =
    await client.auth.getClaims();
  const claimsSub =
    typeof claimsData?.claims?.sub === "string"
      ? claimsData.claims.sub
      : null;

  if (claimsError || !claimsSub) {
    throw new Error(
      "You are signed out of Supabase Auth. Sign in again, then retry.",
    );
  }

  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error(
      "Missing Supabase session token. Sign out, sign in again, then retry.",
    );
  }

  if (sessionData.session.user?.id && sessionData.session.user.id !== claimsSub) {
    throw new Error(
      "Session token does not match verified claims. Sign out and sign in again.",
    );
  }

  return { client, userId: claimsSub };
}

export function extractPostgrestError(error: unknown): PostgrestErrorFields {
  if (!error || typeof error !== "object") {
    return { message: String(error ?? "Unknown error") };
  }
  const e = error as Record<string, unknown>;
  const cause =
    e.cause && typeof e.cause === "object"
      ? (e.cause as Record<string, unknown>)
      : null;
  const src = cause ?? e;
  return {
    message:
      (typeof src.message === "string" && src.message) ||
      (typeof e.message === "string" && e.message) ||
      "Unknown error",
    code:
      typeof src.code === "string"
        ? src.code
        : typeof e.code === "string"
          ? e.code
          : undefined,
    details:
      typeof src.details === "string"
        ? src.details
        : typeof e.details === "string"
          ? e.details
          : undefined,
    hint:
      typeof src.hint === "string"
        ? src.hint
        : typeof e.hint === "string"
          ? e.hint
          : undefined,
    status:
      typeof src.status === "number"
        ? src.status
        : typeof e.status === "number"
          ? e.status
          : undefined,
  };
}

export function formatPostgrestError(error: unknown): string {
  const f = extractPostgrestError(error);
  const parts = [
    f.message,
    f.code ? `code=${f.code}` : null,
    f.status != null ? `status=${f.status}` : null,
    f.details ? `details=${f.details}` : null,
    f.hint ? `hint=${f.hint}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

export function explainRlsWriteError(message: string): string {
  if (!/row-level security|permission|42501|policy/i.test(message)) {
    return message;
  }
  return (
    "Supabase blocked the write (RLS). Check that you are signed in, " +
    "user_id matches the Auth session, and any linked activity is yours. " +
    "Your post was saved locally as a fallback. " +
    message
  );
}
