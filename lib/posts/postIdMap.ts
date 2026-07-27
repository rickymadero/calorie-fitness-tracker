/**
 * Local post id → Supabase post id map (per authenticated user).
 * Idempotent create/migration. Does not delete localStorage posts.
 */

export type PostIdMap = Record<string, string>;

function mapKey(userId: string) {
  return `evolve.postIdMap.${userId}`;
}

function markerKey(userId: string) {
  return `evolve.postsMigrated.${userId}`;
}

function canUse() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const postIdMapStorage = {
  get(userId: string): PostIdMap {
    if (!canUse()) return {};
    try {
      const raw = localStorage.getItem(mapKey(userId));
      if (!raw) return {};
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return {};
      const out: PostIdMap = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string" && v) out[k] = v;
      }
      return out;
    } catch {
      return {};
    }
  },

  set(userId: string, map: PostIdMap) {
    if (!canUse()) return;
    try {
      localStorage.setItem(mapKey(userId), JSON.stringify(map));
    } catch {
      /* quota */
    }
  },

  getSupabaseId(userId: string, localPostId: string): string | undefined {
    return this.get(userId)[localPostId];
  },

  getLocalId(userId: string, supabasePostId: string): string | undefined {
    const map = this.get(userId);
    for (const [localId, remoteId] of Object.entries(map)) {
      if (remoteId === supabasePostId) return localId;
    }
    return undefined;
  },

  setMapping(userId: string, localPostId: string, supabasePostId: string) {
    const map = this.get(userId);
    map[localPostId] = supabasePostId;
    this.set(userId, map);
  },

  /** Drop mapping for a local id and/or its supabase id. */
  removeMapping(
    userId: string,
    opts: { localPostId?: string; supabasePostId?: string },
  ) {
    const map = this.get(userId);
    let changed = false;
    if (opts.localPostId && map[opts.localPostId]) {
      delete map[opts.localPostId];
      changed = true;
    }
    if (opts.supabasePostId) {
      for (const [localId, remoteId] of Object.entries(map)) {
        if (remoteId === opts.supabasePostId) {
          delete map[localId];
          changed = true;
        }
      }
    }
    if (changed) this.set(userId, map);
  },

  /**
   * Keep only mappings whose remote post id is still known to exist.
   * Does not touch posts localStorage content — only the id map.
   * Idempotent: re-running with the same existing set is a no-op.
   */
  pruneMissingRemoteIds(
    userId: string,
    existingRemoteIds: Iterable<string>,
  ): { removed: number; kept: number } {
    const map = this.get(userId);
    const existing = new Set(
      [...existingRemoteIds].filter((id) => typeof id === "string" && id),
    );
    const next: PostIdMap = {};
    let removed = 0;
    for (const [localId, remoteId] of Object.entries(map)) {
      if (existing.has(remoteId)) {
        next[localId] = remoteId;
      } else {
        removed += 1;
      }
    }
    if (removed > 0) this.set(userId, next);
    return { removed, kept: Object.keys(next).length };
  },

  hasMigrated(userId: string): boolean {
    if (!canUse()) return true;
    try {
      return localStorage.getItem(markerKey(userId)) === "1";
    } catch {
      return false;
    }
  },

  markMigrated(userId: string) {
    if (!canUse()) return;
    try {
      localStorage.setItem(markerKey(userId), "1");
    } catch {
      /* ignore */
    }
  },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isSupabasePostId(id: string): boolean {
  return UUID_RE.test(id);
}

export function isSeedAuthorId(authorId: string): boolean {
  return authorId.startsWith("seed-");
}

export function isSeedPostId(postId: string): boolean {
  return postId.startsWith("post-") && !postId.startsWith("post_");
}

/** Persistable remote image URL only (skip data-URLs / oversized blobs). */
export function persistableImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}
