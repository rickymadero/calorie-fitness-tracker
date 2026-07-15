"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UserPlus, UserCheck, Clock, UserMinus, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { avatarPalette } from "@/lib/colors/vivid";
import type { PublicSocialCard } from "@/lib/types/social";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SocialAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-[76px] w-[76px] text-xl",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold transition duration-300 ${avatarPalette(name)} ${dims[size]}`}
    >
      {initials(name)}
    </div>
  );
}

export function FollowButton({
  card,
  fullWidth = false,
}: {
  card: PublicSocialCard;
  fullWidth?: boolean;
}) {
  const { follow, unfollow, cancelRequest } = useSocial();
  const { toast } = useToast();
  const { relation, profile } = card;

  if (relation === "blocked") {
    return (
      <Button size="sm" variant="outline" disabled fullWidth={fullWidth}>
        Unavailable
      </Button>
    );
  }

  if (relation === "following" || relation === "mutual") {
    return (
      <Button
        size="sm"
        variant="secondary"
        fullWidth={fullWidth}
        onClick={() => {
          unfollow(profile.userId);
          toast("Unfollowed.", "info");
        }}
      >
        <UserCheck size={14} />
        Following
      </Button>
    );
  }

  if (relation === "requested") {
    return (
      <Button
        size="sm"
        variant="outline"
        fullWidth={fullWidth}
        onClick={() => {
          cancelRequest(profile.userId);
          toast("Request cancelled.", "info");
        }}
      >
        <Clock size={14} />
        Requested
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      fullWidth={fullWidth}
      onClick={() => {
        const res = follow(profile.userId);
        toast(res.message, res.ok ? "success" : "error");
      }}
    >
      <UserPlus size={14} />
      {profile.visibility === "private" ? "Request" : "Follow"}
    </Button>
  );
}

export function PersonCard({ card }: { card: PublicSocialCard }) {
  const { profile, followersCount, limited } = card;
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="evolve-card-lift min-w-0 rounded-apex-lg border border-border bg-card p-3 shadow-apex sm:p-4"
    >
      <div className="flex items-start gap-3">
        <Link href={`/social/u/${profile.username}`} className="shrink-0">
          <SocialAvatar name={profile.displayName} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/social/u/${profile.username}`}
            className="flex items-center gap-2"
          >
            <p className="truncate font-display font-semibold">
              {profile.displayName}
            </p>
            {profile.visibility === "private" && (
              <Lock size={12} className="shrink-0 text-muted" />
            )}
          </Link>
          <p className="truncate text-sm text-muted">@{profile.username}</p>
          {!limited && profile.bio ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{profile.bio}</p>
          ) : null}
          {!limited && (
            <p className="mt-1 text-xs text-muted">
              {followersCount} followers
              {profile.showLocation && profile.location
                ? ` · ${profile.location}`
                : ""}
            </p>
          )}
          {limited && (
            <Badge className="mt-2" variant="default">
              Private account
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-3">
        <FollowButton card={card} fullWidth />
      </div>
    </motion.div>
  );
}

export function RemoveFollowerButton({ followerId }: { followerId: string }) {
  const { removeFollower } = useSocial();
  const { toast } = useToast();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        removeFollower(followerId);
        toast("Follower removed.", "info");
      }}
    >
      <UserMinus size={14} />
      Remove
    </Button>
  );
}
