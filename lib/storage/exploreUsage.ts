/** Per-user Explore “For You” usage counts (local). */

const KEY = "evolve.explore.featureUsage";

export type ExploreFeatureUsageKey =
  | "basicLogging"
  | "basicStats"
  | "plans"
  | "macros"
  | "scanner"
  | "history"
  | "library"
  | "goals"
  | "meals"
  | "recipes"
  | "analytics"
  | "body"
  | "health"
  | "support"
  | "adFree"
  | "forums";

type UsageEntry = {
  count: number;
  lastUsedAt: number;
};

type Store = Record<string, Partial<Record<ExploreFeatureUsageKey, UsageEntry>>>;

function canUse() {
  return typeof window !== "undefined";
}

function read(): Store {
  if (!canUse()) return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (!canUse()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

export const exploreUsageStorage = {
  record(userId: string, feature: ExploreFeatureUsageKey) {
    if (!userId || !feature) return;
    const store = read();
    const forUser = { ...(store[userId] ?? {}) };
    const prev = forUser[feature];
    forUser[feature] = {
      count: (prev?.count ?? 0) + 1,
      lastUsedAt: Date.now(),
    };
    store[userId] = forUser;
    write(store);
  },

  getScores(userId: string): Record<string, number> {
    if (!userId) return {};
    const forUser = read()[userId] ?? {};
    const scores: Record<string, number> = {};
    for (const [key, entry] of Object.entries(forUser)) {
      if (entry?.count) scores[key] = entry.count;
    }
    return scores;
  },

  getRankedFeatures(userId: string): ExploreFeatureUsageKey[] {
    const forUser = read()[userId] ?? {};
    return (Object.entries(forUser) as [ExploreFeatureUsageKey, UsageEntry][])
      .filter(([, e]) => e && e.count > 0)
      .sort((a, b) => {
        if (b[1].count !== a[1].count) return b[1].count - a[1].count;
        return b[1].lastUsedAt - a[1].lastUsedAt;
      })
      .map(([key]) => key);
  },
};

/** Stable sort: higher usage first; ties keep original order. */
export function sortToolsByUsage<T extends { feature: string }>(
  items: T[],
  scores: Record<string, number>,
): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const sa = scores[a.item.feature] ?? 0;
      const sb = scores[b.item.feature] ?? 0;
      if (sb !== sa) return sb - sa;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
