"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UserPlus, UserCheck, Clock, UserMinus, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import {
  isViewerSelf,
  useSocial,
} from "@/components/social/SocialProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
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
  src,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  /** Optional profile photo — falls back to initials */
  src?: string | null;
}) {
  const dims = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-[76px] w-[76px] text-xl",
  };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`shrink-0 rounded-full object-cover ${dims[size]}`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold transition duration-300 ${avatarPalette(name)} ${dims[size]}`}
    >
      {initials(name)}
    </div>
  );
}

function useIsSelfCard(card: PublicSocialCard) {
  const { user } = useAuth();
  const { myProfile } = useSocial();
  return isViewerSelf(card.profile, {
    userId: user?.id,
    username: myProfile?.username,
    displayName: myProfile?.displayName,
    fullName: user?.fullName,
  });
}

export function FollowButton({
  card,
  fullWidth = false,
  compact = false,
}: {
  card: PublicSocialCard;
  fullWidth?: boolean;
  /** Feed header — same slot for Follow / Request / Following */
  compact?: boolean;
}) {
  const { follow, unfollow, cancelRequest } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "social"]);
  const { relation, profile } = card;
  const isSelf = useIsSelfCard(card);

  if (isSelf) return null;

  const widthClass = fullWidth
    ? "w-full"
    : compact
      ? "shrink-0 whitespace-nowrap"
      : "shrink-0 whitespace-nowrap";

  if (relation === "blocked") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        fullWidth={fullWidth}
        className={widthClass}
      >
        {t("common:buttons.unavailable")}
      </Button>
    );
  }

  if (relation === "following" || relation === "mutual") {
    if (compact && !fullWidth) return null;
    return (
      <Button
        size="sm"
        variant="secondary"
        fullWidth={fullWidth}
        className={widthClass}
        onClick={() => {
          unfollow(profile.userId);
          toast(t("social:unfollowed"), "info");
        }}
      >
        <UserCheck size={14} className="shrink-0" />
        {t("common:buttons.following")}
      </Button>
    );
  }

  if (relation === "requested") {
    if (compact && !fullWidth) {
      return (
        <Button
          size="sm"
          variant="secondary"
          className="!min-h-9 shrink-0 !px-2.5 whitespace-nowrap"
          onClick={() => {
            cancelRequest(profile.userId);
            toast(t("social:requestCancelled"), "info");
          }}
        >
          <Clock size={14} className="shrink-0" />
          {t("common:buttons.pending")}
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        variant="secondary"
        fullWidth={fullWidth}
        className={widthClass}
        onClick={() => {
          cancelRequest(profile.userId);
          toast(t("social:requestCancelled"), "info");
        }}
      >
        <Clock size={14} className="shrink-0" />
        {t("common:buttons.requested")}
      </Button>
    );
  }

  const isPrivate = profile.visibility === "private";

  return (
    <Button
      size="sm"
      fullWidth={fullWidth}
      className={
        compact && !fullWidth
          ? "!min-h-9 shrink-0 !px-2.5 whitespace-nowrap"
          : widthClass
      }
      onClick={() => {
        const res = follow(profile.userId);
        toast(res.message, res.ok ? "success" : "error");
      }}
    >
      <UserPlus size={14} className="shrink-0" />
      {isPrivate
        ? t("common:buttons.request")
        : t("common:buttons.follow")}
    </Button>
  );
}

export function PersonCard({ card }: { card: PublicSocialCard }) {
  const { profile, followersCount, limited } = card;
  const reduce = useReducedMotion();
  const isSelf = useIsSelfCard(card);
  const { t } = useAppTranslation(["common", "social"]);

  if (isSelf) return null;

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="evolve-card-lift min-w-0 rounded-apex-lg border border-border bg-card p-3 shadow-apex sm:p-4"
    >
      <div className="flex items-start gap-3">
        <Link href={`/social/u/${profile.username}`} className="shrink-0">
          <SocialAvatar
            name={profile.displayName}
            src={profile.avatarUrl || undefined}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/social/u/${profile.username}`}
            className="flex items-center gap-2"
          >
            <p className="truncate font-display font-semibold">
              {profile.displayName}
            </p>
            <CountryFlag
              code={profile.countryCode}
              size="sm"
              className="shrink-0"
            />
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
              {followersCount} {t("common:labels.followers")}
              {profile.showLocation && profile.location
                ? ` · ${profile.location}`
                : ""}
            </p>
          )}
          {limited && (
            <Badge className="mt-2" variant="default">
              {t("social:privateAccount")}
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
  const { t } = useAppTranslation(["social", "common"]);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        removeFollower(followerId);
        toast(t("followerRemoved"), "info");
      }}
    >
      <UserMinus size={14} />
      {t("buttons.remove", { ns: "common" })}
    </Button>
  );
}
