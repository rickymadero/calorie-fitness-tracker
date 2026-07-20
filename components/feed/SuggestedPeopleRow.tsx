"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { FollowButton, SocialAvatar } from "@/components/social/PersonCard";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useSocial } from "@/components/social/SocialProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import type { PublicSocialCard } from "@/lib/types/social";

export function SuggestedPeopleRow({
  people,
}: {
  people: PublicSocialCard[];
}) {
  const { dismissSuggestion, suggestionReason } = useSocial();
  const { t } = useAppTranslation(["feed", "common"]);

  if (people.length === 0) return null;

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <h2 className="font-display text-sm font-semibold">{t("suggested")}</h2>
        <Link href="/network" className="text-xs font-medium text-accent">
          {t("buttons.seeAll", { ns: "common" })}
        </Link>
      </div>
      <div className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {people.map((card) => {
          const { profile } = card;
          const interest =
            profile.favoriteWorkouts[0] ??
            profile.fitnessGoals[0] ??
            "Fitness";
          return (
            <div
              key={profile.userId}
              className="relative flex w-[148px] shrink-0 flex-col rounded-2xl border border-border bg-card p-3 shadow-apex"
            >
              <button
                type="button"
                className="absolute right-1.5 top-1.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-muted-bg hover:text-foreground"
                aria-label={t("dismissSuggestion")}
                onClick={() => dismissSuggestion(profile.userId)}
              >
                <X size={14} />
              </button>
              <Link
                href={`/social/u/${profile.username}`}
                className="flex min-h-0 flex-1 flex-col items-center text-center"
              >
                <SocialAvatar name={profile.displayName} />
                <p className="mt-2 flex w-full items-center justify-center gap-1 font-display text-sm font-semibold">
                  <span className="truncate">{profile.displayName}</span>
                  <CountryFlag code={profile.countryCode} size="sm" />
                </p>
                <p className="w-full truncate text-xs text-muted">
                  @{profile.username}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] capitalize text-muted">
                  {interest}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] text-muted">
                  {suggestionReason(card)}
                </p>
              </Link>
              <div className="mt-2 flex h-11 w-full shrink-0 items-stretch">
                <FollowButton card={card} fullWidth />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
