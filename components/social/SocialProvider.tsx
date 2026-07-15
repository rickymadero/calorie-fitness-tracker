"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { socialStorage } from "@/lib/storage/social";
import { slugifyUsername } from "@/lib/mock/socialUsers";
import type {
  FollowRequest,
  FollowStatus,
  PublicSocialCard,
  SocialProfile,
} from "@/lib/types/social";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function defaultProfileForUser(userId: string, fullName: string): SocialProfile {
  const base = slugifyUsername(fullName);
  let username = base;
  let n = 1;
  while (socialStorage.isUsernameTaken(username, userId)) {
    username = `${base}${n}`;
    n += 1;
  }
  return {
    userId,
    username,
    displayName: fullName,
    bio: "",
    avatarUrl: "",
    fitnessGoals: [],
    favoriteWorkouts: [],
    showLocation: false,
    showInstagram: false,
    visibility: "public",
    joinedAt: new Date().toISOString(),
    stats: {
      workoutsCompleted: 0,
      totalRunKm: 0,
      totalWorkoutMinutes: 0,
    },
  };
}

interface SocialContextValue {
  ready: boolean;
  myProfile: SocialProfile | null;
  ensureMyProfile: () => SocialProfile | null;
  updateMyProfile: (patch: Partial<SocialProfile>) => SocialProfile | null;
  getCard: (userId: string) => PublicSocialCard | null;
  getCardByUsername: (username: string) => PublicSocialCard | null;
  searchPeople: (query: string) => PublicSocialCard[];
  suggestedPeople: () => PublicSocialCard[];
  followersOf: (userId: string) => PublicSocialCard[];
  followingOf: (userId: string) => PublicSocialCard[];
  follow: (targetUserId: string) => { ok: boolean; message: string };
  unfollow: (targetUserId: string) => void;
  cancelRequest: (targetUserId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  removeFollower: (followerId: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  pendingRequestsToMe: () => FollowRequest[];
  pendingOutgoing: () => FollowRequest[];
  isBlockedEitherWay: (otherUserId: string) => boolean;
  iBlocked: (otherUserId: string) => boolean;
  refresh: () => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const existing = socialStorage.getProfileByUserId(user.id);
    if (!existing) {
      socialStorage.upsertProfile(
        defaultProfileForUser(user.id, user.fullName),
      );
      refresh();
    }
  }, [user, refresh]);

  const myProfile = useMemo(() => {
    void tick;
    if (!user) return null;
    return socialStorage.getProfileByUserId(user.id);
  }, [user, tick]);

  const relationTo = useCallback(
    (viewerId: string | undefined, targetId: string): FollowStatus => {
      if (!viewerId || viewerId === targetId) return "none";
      const blocks = socialStorage.getBlocks();
      if (
        blocks.some(
          (b) =>
            (b.blockerId === viewerId && b.blockedId === targetId) ||
            (b.blockerId === targetId && b.blockedId === viewerId),
        )
      ) {
        return "blocked";
      }
      const follows = socialStorage.getFollows();
      const iFollow = follows.some(
        (f) => f.followerId === viewerId && f.followingId === targetId,
      );
      const theyFollow = follows.some(
        (f) => f.followerId === targetId && f.followingId === viewerId,
      );
      if (iFollow && theyFollow) return "mutual";
      if (iFollow) return "following";
      const pending = socialStorage
        .getRequests()
        .some(
          (r) =>
            r.status === "pending" &&
            r.fromUserId === viewerId &&
            r.toUserId === targetId,
        );
      if (pending) return "requested";
      if (theyFollow) return "follows_you";
      return "none";
    },
    [],
  );

  const countsFor = useCallback((userId: string) => {
    const follows = socialStorage.getFollows();
    return {
      followersCount: follows.filter((f) => f.followingId === userId).length,
      followingCount: follows.filter((f) => f.followerId === userId).length,
    };
  }, []);

  const toCard = useCallback(
    (profile: SocialProfile): PublicSocialCard => {
      const viewerId = user?.id;
      const relation = relationTo(viewerId, profile.userId);
      const { followersCount, followingCount } = countsFor(profile.userId);
      const isSelf = viewerId === profile.userId;
      const approved =
        isSelf ||
        relation === "following" ||
        relation === "mutual";
      const limited =
        profile.visibility === "private" && !approved && !isSelf;

      return {
        profile: limited
          ? {
              ...profile,
              bio: "",
              location: undefined,
              instagramUsername: undefined,
              stats: {
                workoutsCompleted: 0,
                totalRunKm: 0,
                totalWorkoutMinutes: 0,
              },
            }
          : profile,
        followersCount: limited ? 0 : followersCount,
        followingCount: limited ? 0 : followingCount,
        relation,
        limited,
      };
    },
    [user?.id, relationTo, countsFor],
  );

  const ensureMyProfile = useCallback(() => {
    if (!user) return null;
    let p = socialStorage.getProfileByUserId(user.id);
    if (!p) {
      p = socialStorage.upsertProfile(
        defaultProfileForUser(user.id, user.fullName),
      );
      refresh();
    }
    return p;
  }, [user, refresh]);

  const updateMyProfile = useCallback(
    (patch: Partial<SocialProfile>) => {
      if (!user) return null;
      const current =
        socialStorage.getProfileByUserId(user.id) ??
        defaultProfileForUser(user.id, user.fullName);
      if (patch.username) {
        const clean = patch.username
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 24);
        if (!clean) return current;
        if (socialStorage.isUsernameTaken(clean, user.id)) {
          return current;
        }
        patch = { ...patch, username: clean };
      }
      const next = { ...current, ...patch, userId: user.id };
      socialStorage.upsertProfile(next);
      refresh();
      return next;
    },
    [user, refresh],
  );

  const value = useMemo<SocialContextValue>(() => {
    void tick;
    return {
      ready,
      myProfile,
      ensureMyProfile,
      updateMyProfile,
      getCard: (userId) => {
        const p = socialStorage.getProfileByUserId(userId);
        return p ? toCard(p) : null;
      },
      getCardByUsername: (username) => {
        const p = socialStorage.getProfileByUsername(username);
        return p ? toCard(p) : null;
      },
      searchPeople: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const viewerId = user?.id;
        return socialStorage
          .listProfiles()
          .filter((p) => p.userId !== viewerId)
          .filter((p) => {
            if (viewerId && relationTo(viewerId, p.userId) === "blocked") {
              return false;
            }
            const hay = [
              p.displayName,
              p.username,
              p.showInstagram ? p.instagramUsername ?? "" : "",
              p.showLocation ? p.location ?? "" : "",
              ...p.fitnessGoals,
              ...p.favoriteWorkouts,
            ]
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          })
          .map(toCard)
          .slice(0, 40);
      },
      suggestedPeople: () => {
        const viewerId = user?.id;
        const mine = viewerId
          ? socialStorage.getProfileByUserId(viewerId)
          : null;
        return socialStorage
          .listProfiles()
          .filter((p) => p.userId !== viewerId)
          .filter((p) => {
            if (!viewerId) return true;
            const r = relationTo(viewerId, p.userId);
            return r !== "following" && r !== "mutual" && r !== "blocked" && r !== "requested";
          })
          .sort((a, b) => {
            const score = (p: SocialProfile) => {
              let s = p.stats.workoutsCompleted;
              if (mine) {
                const sharedGoals = p.fitnessGoals.filter((g) =>
                  mine.fitnessGoals.includes(g),
                ).length;
                const sharedWorkouts = p.favoriteWorkouts.filter((w) =>
                  mine.favoriteWorkouts.includes(w),
                ).length;
                s += sharedGoals * 20 + sharedWorkouts * 15;
              }
              if (p.visibility === "public") s += 5;
              return s;
            };
            return score(b) - score(a);
          })
          .slice(0, 12)
          .map(toCard);
      },
      followersOf: (userId) => {
        const ids = socialStorage
          .getFollows()
          .filter((f) => f.followingId === userId)
          .map((f) => f.followerId);
        return ids
          .map((id) => socialStorage.getProfileByUserId(id))
          .filter(Boolean)
          .map((p) => toCard(p!));
      },
      followingOf: (userId) => {
        const ids = socialStorage
          .getFollows()
          .filter((f) => f.followerId === userId)
          .map((f) => f.followingId);
        return ids
          .map((id) => socialStorage.getProfileByUserId(id))
          .filter(Boolean)
          .map((p) => toCard(p!));
      },
      follow: (targetUserId) => {
        if (!user) return { ok: false, message: "Sign in required." };
        if (targetUserId === user.id) {
          return { ok: false, message: "You can't follow yourself." };
        }
        if (relationTo(user.id, targetUserId) === "blocked") {
          return { ok: false, message: "Unable to follow this user." };
        }
        const target = socialStorage.getProfileByUserId(targetUserId);
        if (!target) return { ok: false, message: "User not found." };
        const current = relationTo(user.id, targetUserId);
        if (current === "following" || current === "mutual") {
          return { ok: false, message: "Already following." };
        }
        if (current === "requested") {
          return { ok: false, message: "Request already pending." };
        }
        if (target.visibility === "private") {
          socialStorage.addRequest({
            id: uid("freq"),
            fromUserId: user.id,
            toUserId: targetUserId,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
          refresh();
          return { ok: true, message: "Follow request sent." };
        }
        socialStorage.addFollow({
          id: uid("fol"),
          followerId: user.id,
          followingId: targetUserId,
          createdAt: new Date().toISOString(),
        });
        refresh();
        return { ok: true, message: "Following." };
      },
      unfollow: (targetUserId) => {
        if (!user) return;
        socialStorage.removeFollow(user.id, targetUserId);
        refresh();
      },
      cancelRequest: (targetUserId) => {
        if (!user) return;
        const req = socialStorage
          .getRequests()
          .find(
            (r) =>
              r.status === "pending" &&
              r.fromUserId === user.id &&
              r.toUserId === targetUserId,
          );
        if (req) {
          socialStorage.updateRequest(req.id, {
            status: "cancelled",
            respondedAt: new Date().toISOString(),
          });
          refresh();
        }
      },
      acceptRequest: (requestId) => {
        if (!user) return;
        const req = socialStorage.getRequests().find((r) => r.id === requestId);
        if (!req || req.toUserId !== user.id || req.status !== "pending") return;
        socialStorage.updateRequest(requestId, {
          status: "accepted",
          respondedAt: new Date().toISOString(),
        });
        socialStorage.addFollow({
          id: uid("fol"),
          followerId: req.fromUserId,
          followingId: user.id,
          createdAt: new Date().toISOString(),
        });
        refresh();
      },
      rejectRequest: (requestId) => {
        if (!user) return;
        const req = socialStorage.getRequests().find((r) => r.id === requestId);
        if (!req || req.toUserId !== user.id || req.status !== "pending") return;
        socialStorage.updateRequest(requestId, {
          status: "rejected",
          respondedAt: new Date().toISOString(),
        });
        refresh();
      },
      removeFollower: (followerId) => {
        if (!user) return;
        socialStorage.removeFollow(followerId, user.id);
        refresh();
      },
      blockUser: (targetUserId) => {
        if (!user || targetUserId === user.id) return;
        socialStorage.addBlock({
          id: uid("blk"),
          blockerId: user.id,
          blockedId: targetUserId,
          createdAt: new Date().toISOString(),
        });
        refresh();
      },
      unblockUser: (targetUserId) => {
        if (!user) return;
        socialStorage.removeBlock(user.id, targetUserId);
        refresh();
      },
      pendingRequestsToMe: () => {
        if (!user) return [];
        return socialStorage
          .getRequests()
          .filter((r) => r.toUserId === user.id && r.status === "pending")
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      pendingOutgoing: () => {
        if (!user) return [];
        return socialStorage
          .getRequests()
          .filter((r) => r.fromUserId === user.id && r.status === "pending");
      },
      isBlockedEitherWay: (otherUserId) => {
        if (!user) return false;
        return relationTo(user.id, otherUserId) === "blocked";
      },
      iBlocked: (otherUserId) => {
        if (!user) return false;
        return socialStorage
          .getBlocks()
          .some(
            (b) => b.blockerId === user.id && b.blockedId === otherUserId,
          );
      },
      refresh,
    };
  }, [
    tick,
    ready,
    myProfile,
    user,
    ensureMyProfile,
    updateMyProfile,
    toCard,
    relationTo,
    refresh,
  ]);

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
