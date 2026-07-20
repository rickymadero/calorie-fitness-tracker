import type {
  BlockEdge,
  FollowEdge,
  FollowRequest,
  SocialProfile,
  SocialStore,
} from "@/lib/types/social";
import { SEED_SOCIAL_PROFILES } from "@/lib/mock/socialUsers";
import {
  inferCountryCodeFromLocation,
  normalizeCountryCode,
} from "@/lib/geo/countryFlag";

const KEY = "evolve.social";
const STARTER_FOLLOWS_KEY = "evolve.starterFollows";
const SEED_IDS = new Set(SEED_SOCIAL_PROFILES.map((p) => p.userId));
const PUBLIC_SEED_IDS = SEED_SOCIAL_PROFILES.filter(
  (p) => p.visibility === "public",
).map((p) => p.userId);

function canUse() {
  return typeof window !== "undefined";
}

/** One-time: follow public demo athletes so Feed + Stories feel populated. */
function ensureStarterFollows(authUserId: string, store: SocialStore): boolean {
  if (!canUse()) return false;
  const flagKey = `${STARTER_FOLLOWS_KEY}.${authUserId}`;
  if (localStorage.getItem(flagKey) === "1") return false;

  let changed = false;
  const now = new Date().toISOString();
  for (const seedId of PUBLIC_SEED_IDS) {
    if (seedId === authUserId) continue;
    const exists = store.follows.some(
      (f) => f.followerId === authUserId && f.followingId === seedId,
    );
    if (exists) continue;
    store.follows.push({
      id: `follow_starter_${authUserId.slice(0, 8)}_${seedId}`,
      followerId: authUserId,
      followingId: seedId,
      createdAt: now,
    });
    changed = true;
  }
  localStorage.setItem(flagKey, "1");
  return changed;
}

function normalizeProfile(p: SocialProfile): SocialProfile {
  const seed = SEED_SOCIAL_PROFILES.find((s) => s.userId === p.userId);
  const code =
    normalizeCountryCode(p.countryCode) ??
    normalizeCountryCode(seed?.countryCode) ??
    inferCountryCodeFromLocation(p.location);
  return {
    ...p,
    personalRecords: Array.isArray(p.personalRecords) ? p.personalRecords : [],
    countryCode: code,
  };
}

/**
 * Collapse duplicate usernames: prefer authUserId match, else first;
 * rewrite orphan userIds in follows/requests/blocks when merging.
 */
function dedupeProfilesByUsername(
  store: SocialStore,
  preferUserId?: string | null,
): boolean {
  const byUser = new Map<string, SocialProfile[]>();
  for (const p of store.profiles) {
    const key = p.username.toLowerCase();
    const list = byUser.get(key) ?? [];
    list.push(p);
    byUser.set(key, list);
  }

  let changed = false;
  const keep: SocialProfile[] = [];
  const idMap = new Map<string, string>(); // orphanId -> keeperId

  for (const [, group] of byUser) {
    if (group.length === 1) {
      keep.push(group[0]);
      continue;
    }
    changed = true;
    const preferred =
      (preferUserId
        ? group.find((p) => p.userId === preferUserId)
        : undefined) ??
      group.find((p) => SEED_IDS.has(p.userId)) ??
      group[0];
    keep.push(preferred);
    for (const orphan of group) {
      if (orphan.userId !== preferred.userId) {
        idMap.set(orphan.userId, preferred.userId);
      }
    }
  }

  if (!changed) return false;

  store.profiles = keep;

  const remap = (id: string) => idMap.get(id) ?? id;
  store.follows = store.follows
    .map((f) => ({
      ...f,
      followerId: remap(f.followerId),
      followingId: remap(f.followingId),
    }))
    .filter((f) => f.followerId !== f.followingId);
  store.requests = store.requests.map((r) => ({
    ...r,
    fromUserId: remap(r.fromUserId),
    toUserId: remap(r.toUserId),
  }));
  store.blocks = store.blocks.map((b) => ({
    ...b,
    blockerId: remap(b.blockerId),
    blockedId: remap(b.blockedId),
  }));
  if (store.dismissedSuggestions) {
    store.dismissedSuggestions = [
      ...new Set(store.dismissedSuggestions.map(remap)),
    ];
  }
  return true;
}

function emptyStore(): SocialStore {
  return {
    profiles: SEED_SOCIAL_PROFILES.map(normalizeProfile),
    follows: [],
    requests: [],
    blocks: [],
    dismissedSuggestions: [],
  };
}

function read(): SocialStore {
  if (!canUse()) return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = emptyStore();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as SocialStore;
    parsed.profiles = (parsed.profiles ?? []).map(normalizeProfile);
    if (!Array.isArray(parsed.dismissedSuggestions)) {
      parsed.dismissedSuggestions = [];
    }
    // Merge missing seed profiles so Discover stays useful
    const byId = new Map(parsed.profiles.map((p) => [p.userId, p]));
    let changed = false;
    for (const seed of SEED_SOCIAL_PROFILES) {
      const existing = byId.get(seed.userId);
      if (!existing) {
        parsed.profiles.push(normalizeProfile(seed));
        changed = true;
      } else {
        if (
          (!existing.personalRecords || existing.personalRecords.length === 0) &&
          seed.personalRecords.length > 0
        ) {
          existing.personalRecords = seed.personalRecords;
          changed = true;
        }
        if (seed.countryCode && existing.countryCode !== seed.countryCode) {
          existing.countryCode = seed.countryCode;
          changed = true;
        }
      }
    }
    if (dedupeProfilesByUsername(parsed)) changed = true;

    const before = parsed.follows.length;
    parsed.follows = (parsed.follows ?? []).filter(
      (f) => f.followerId !== f.followingId,
    );
    if (parsed.follows.length !== before) changed = true;

    if (changed) write(parsed);
    return parsed;
  } catch {
    return emptyStore();
  }
}

function write(store: SocialStore) {
  if (!canUse()) return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export const socialStorage = {
  getStore: read,
  setStore: write,

  /**
   * Ensure auth user owns one profile. Reclaims username orphans by remapping
   * their userId to authUserId (Instagram: you never appear as a peer).
   */
  claimProfileForAuthUser(
    authUserId: string,
    fullName: string,
    preferredUsername?: string,
    country?: string,
  ): SocialProfile {
    const store = read();
    dedupeProfilesByUsername(store, authUserId);

    const fromAuth = normalizeCountryCode(country);

    let mine = store.profiles.find((p) => p.userId === authUserId);
    if (mine) {
      if (fromAuth && !mine.countryCode) {
        mine.countryCode = fromAuth;
      }
      ensureStarterFollows(authUserId, store);
      write(store);
      return mine;
    }

    const uname = (preferredUsername || fullName)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    if (uname.length >= 3) {
      const orphan = store.profiles.find(
        (p) =>
          p.username.toLowerCase() === uname && !SEED_IDS.has(p.userId),
      );
      if (orphan) {
        const oldId = orphan.userId;
        orphan.userId = authUserId;
        orphan.displayName = orphan.displayName || fullName;
        const remap = (id: string) => (id === oldId ? authUserId : id);
        store.follows = store.follows
          .map((f) => ({
            ...f,
            followerId: remap(f.followerId),
            followingId: remap(f.followingId),
          }))
          .filter((f) => f.followerId !== f.followingId);
        store.requests = store.requests.map((r) => ({
          ...r,
          fromUserId: remap(r.fromUserId),
          toUserId: remap(r.toUserId),
        }));
        store.blocks = store.blocks.map((b) => ({
          ...b,
          blockerId: remap(b.blockerId),
          blockedId: remap(b.blockedId),
        }));
        ensureStarterFollows(authUserId, store);
        write(store);
        return orphan;
      }
    }

    // Also reclaim by matching displayName to fullName for non-seed orphans
    const byName = store.profiles.find(
      (p) =>
        !SEED_IDS.has(p.userId) &&
        p.displayName.trim().toLowerCase() === fullName.trim().toLowerCase(),
    );
    if (byName) {
      const oldId = byName.userId;
      byName.userId = authUserId;
      const remap = (id: string) => (id === oldId ? authUserId : id);
      store.follows = store.follows
        .map((f) => ({
          ...f,
          followerId: remap(f.followerId),
          followingId: remap(f.followingId),
        }))
        .filter((f) => f.followerId !== f.followingId);
      ensureStarterFollows(authUserId, store);
      write(store);
      return byName;
    }

    const base =
      uname.length >= 3
        ? uname
        : fullName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 18) || "athlete";
    let username = base;
    let n = 1;
    while (
      store.profiles.some(
        (p) =>
          p.username.toLowerCase() === username && p.userId !== authUserId,
      )
    ) {
      username = `${base}${n}`;
      n += 1;
    }
    mine = {
      userId: authUserId,
      username,
      displayName: fullName,
      bio: "",
      avatarUrl: "",
      fitnessGoals: [],
      favoriteWorkouts: [],
      showLocation: false,
      showInstagram: false,
      visibility: "public",
      countryCode: fromAuth,
      joinedAt: new Date().toISOString(),
      stats: {
        workoutsCompleted: 0,
        totalRunKm: 0,
        totalWorkoutMinutes: 0,
      },
      personalRecords: [],
    };
    store.profiles.push(mine);
    ensureStarterFollows(authUserId, store);
    write(store);
    return mine;
  },

  upsertProfile(profile: SocialProfile) {
    const store = read();
    const i = store.profiles.findIndex((p) => p.userId === profile.userId);
    if (i >= 0) store.profiles[i] = normalizeProfile(profile);
    else store.profiles.push(normalizeProfile(profile));
    dedupeProfilesByUsername(store, profile.userId);
    write(store);
    return profile;
  },

  getProfileByUserId(userId: string) {
    return read().profiles.find((p) => p.userId === userId) ?? null;
  },

  getProfileByUsername(username: string) {
    const u = username.toLowerCase().replace(/^@/, "");
    return (
      read().profiles.find((p) => p.username.toLowerCase() === u) ?? null
    );
  },

  isUsernameTaken(username: string, exceptUserId?: string) {
    const u = username.toLowerCase().replace(/^@/, "");
    return read().profiles.some(
      (p) =>
        p.username.toLowerCase() === u &&
        (!exceptUserId || p.userId !== exceptUserId),
    );
  },

  listProfiles() {
    return read().profiles;
  },

  getFollows() {
    return read().follows;
  },

  addFollow(edge: FollowEdge) {
    if (edge.followerId === edge.followingId) return read().follows;
    const store = read();
    const follower = store.profiles.find((p) => p.userId === edge.followerId);
    const following = store.profiles.find(
      (p) => p.userId === edge.followingId,
    );
    if (
      follower &&
      following &&
      (follower.username.toLowerCase() === following.username.toLowerCase() ||
        follower.displayName.trim().toLowerCase() ===
          following.displayName.trim().toLowerCase())
    ) {
      return store.follows;
    }
    if (
      store.follows.some(
        (f) =>
          f.followerId === edge.followerId &&
          f.followingId === edge.followingId,
      )
    ) {
      return store.follows;
    }
    store.follows.push(edge);
    write(store);
    return store.follows;
  },

  removeFollow(followerId: string, followingId: string) {
    const store = read();
    store.follows = store.follows.filter(
      (f) =>
        !(f.followerId === followerId && f.followingId === followingId),
    );
    write(store);
  },

  getRequests() {
    return read().requests;
  },

  addRequest(req: FollowRequest) {
    const store = read();
    store.requests.push(req);
    write(store);
    return req;
  },

  updateRequest(id: string, patch: Partial<FollowRequest>) {
    const store = read();
    const i = store.requests.findIndex((r) => r.id === id);
    if (i < 0) return null;
    store.requests[i] = { ...store.requests[i], ...patch };
    write(store);
    return store.requests[i];
  },

  getBlocks() {
    return read().blocks;
  },

  addBlock(edge: BlockEdge) {
    const store = read();
    store.blocks.push(edge);
    store.follows = store.follows.filter(
      (f) =>
        !(
          (f.followerId === edge.blockerId &&
            f.followingId === edge.blockedId) ||
          (f.followerId === edge.blockedId &&
            f.followingId === edge.blockerId)
        ),
    );
    store.requests = store.requests.map((r) => {
      if (
        r.status === "pending" &&
        ((r.fromUserId === edge.blockerId &&
          r.toUserId === edge.blockedId) ||
          (r.fromUserId === edge.blockedId &&
            r.toUserId === edge.blockerId))
      ) {
        return {
          ...r,
          status: "cancelled" as const,
          respondedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    write(store);
  },

  removeBlock(blockerId: string, blockedId: string) {
    const store = read();
    store.blocks = store.blocks.filter(
      (b) => !(b.blockerId === blockerId && b.blockedId === blockedId),
    );
    write(store);
  },

  getDismissedSuggestions() {
    return read().dismissedSuggestions ?? [];
  },

  dismissSuggestion(userId: string) {
    const store = read();
    const list = new Set(store.dismissedSuggestions ?? []);
    list.add(userId);
    store.dismissedSuggestions = [...list];
    write(store);
  },

  clearDismissedSuggestion(userId: string) {
    const store = read();
    store.dismissedSuggestions = (store.dismissedSuggestions ?? []).filter(
      (id) => id !== userId,
    );
    write(store);
  },
};
