/**
 * Local post/session id → Supabase activity id map (per authenticated user).
 * Used for idempotent migration and future posts.activity_id linking.
 * Does not delete localStorage activity/post data.
 */

export type ActivityIdMap = Record<string, string>;

function mapKey(userId: string) {
  return `evolve.activityIdMap.${userId}`;
}

function markerKey(userId: string) {
  return `evolve.activitiesMigrated.${userId}`;
}

function canUse() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export const activityIdMapStorage = {
  get(userId: string): ActivityIdMap {
    if (!canUse()) return {};
    try {
      const raw = localStorage.getItem(mapKey(userId));
      if (!raw) return {};
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return {};
      const out: ActivityIdMap = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string" && v) out[k] = v;
      }
      return out;
    } catch {
      return {};
    }
  },

  set(userId: string, map: ActivityIdMap) {
    if (!canUse()) return;
    try {
      localStorage.setItem(mapKey(userId), JSON.stringify(map));
    } catch {
      /* quota */
    }
  },

  getSupabaseId(userId: string, localKey: string): string | undefined {
    return this.get(userId)[localKey];
  },

  setMapping(userId: string, localKey: string, supabaseActivityId: string) {
    const map = this.get(userId);
    map[localKey] = supabaseActivityId;
    this.set(userId, map);
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
