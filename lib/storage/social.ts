import type {
  BlockEdge,
  FollowEdge,
  FollowRequest,
  SocialProfile,
  SocialStore,
} from "@/lib/types/social";
import { SEED_SOCIAL_PROFILES } from "@/lib/mock/socialUsers";

const KEY = "evolve.social";

function canUse() {
  return typeof window !== "undefined";
}

function emptyStore(): SocialStore {
  return {
    profiles: [...SEED_SOCIAL_PROFILES],
    follows: [],
    requests: [],
    blocks: [],
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
    // Merge missing seed profiles so Discover stays useful
    const ids = new Set(parsed.profiles.map((p) => p.userId));
    const missing = SEED_SOCIAL_PROFILES.filter((p) => !ids.has(p.userId));
    if (missing.length) {
      parsed.profiles = [...parsed.profiles, ...missing];
      write(parsed);
    }
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

  upsertProfile(profile: SocialProfile) {
    const store = read();
    const i = store.profiles.findIndex((p) => p.userId === profile.userId);
    if (i >= 0) store.profiles[i] = profile;
    else store.profiles.push(profile);
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
    const store = read();
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
    // remove follows both ways
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
        return { ...r, status: "cancelled" as const, respondedAt: new Date().toISOString() };
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
};
