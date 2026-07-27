import type { EvolveClient } from "@/lib/services/auth";
import { postIdMapStorage } from "@/lib/posts/postIdMap";

export type PruneStalePostIdMapResult = {
  removed: number;
  kept: number;
  checked: number;
};

/**
 * Drop local→remote post id mappings whose Supabase post no longer exists.
 * Safe / idempotent: only rewrites the map when something is stale.
 * Does not delete localStorage post bodies or any Supabase rows.
 */
export async function pruneStalePostIdMappings(
  client: EvolveClient,
  userId: string,
): Promise<PruneStalePostIdMapResult> {
  const map = postIdMapStorage.get(userId);
  const remoteIds = [...new Set(Object.values(map))].filter(Boolean);
  if (remoteIds.length === 0) {
    return { removed: 0, kept: 0, checked: 0 };
  }

  const existing = new Set<string>();
  const chunkSize = 100;
  for (let i = 0; i < remoteIds.length; i += chunkSize) {
    const chunk = remoteIds.slice(i, i + chunkSize);
    const { data, error } = await client
      .from("posts")
      .select("id")
      .in("id", chunk);
    if (error) {
      // Leave the map unchanged if existence cannot be verified.
      return {
        removed: 0,
        kept: remoteIds.length,
        checked: remoteIds.length,
      };
    }
    for (const row of data ?? []) {
      if (row?.id) existing.add(row.id);
    }
  }

  const { removed, kept } = postIdMapStorage.pruneMissingRemoteIds(
    userId,
    existing,
  );
  return { removed, kept, checked: remoteIds.length };
}
