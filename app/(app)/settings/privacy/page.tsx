"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { SocialAvatar } from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { socialStorage } from "@/lib/storage/social";
import {
  settingsPrefs,
  type MessagePrivacy,
} from "@/lib/storage/settingsPrefs";
import type { ProfileVisibility } from "@/lib/types/social";

export default function PrivacySettingsPage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const { myProfile, ensureMyProfile, updateMyProfile, unblockUser, getCard } =
    useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "settings"]);

  const profile = myProfile ?? ensureMyProfile();
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [messagePrivacy, setMessagePrivacy] = useState<MessagePrivacy>(
    settingsPrefs.getMessagePrivacy(),
  );

  useEffect(() => {
    if (authProfile) {
      setVisibility(authProfile.is_private ? "private" : "public");
      return;
    }
    if (profile?.visibility) setVisibility(profile.visibility);
  }, [authProfile, profile?.visibility]);

  const blocked = useMemo(() => {
    if (!user) return [];
    return socialStorage
      .getBlocks()
      .filter((b) => b.blockerId === user.id)
      .map((b) => getCard(b.blockedId))
      .filter(Boolean);
  }, [user, getCard, myProfile]);

  if (!user || !profile) return null;

  async function saveVisibility(next: ProfileVisibility) {
    setVisibility(next);
    updateMyProfile({ visibility: next });
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { profilesService } = await import("@/lib/services/profiles");
      const supabase = createClient();
      const { error } = await profilesService.updateOwn(supabase, user!.id, {
        is_private: next === "private",
      });
      if (error) {
        toast(error.message, "error");
        return;
      }
      await refreshProfile();
    } catch {
      toast(t("common:errors.generic"), "error");
      return;
    }
    toast(
      next === "private"
        ? t("privacyPage.nowPrivate", { ns: "settings" })
        : t("privacyPage.nowPublic", { ns: "settings" }),
      "success",
    );
  }

  function saveMessages(next: MessagePrivacy) {
    setMessagePrivacy(next);
    settingsPrefs.setMessagePrivacy(next);
    toast(t("privacyPage.messagesUpdated", { ns: "settings" }), "success");
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader
        title={t("privacyPage.title", { ns: "settings" })}
        href="/profile"
      />

      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          {t("privacyPage.visibility", { ns: "settings" })}
        </h2>
        <p className="text-sm text-muted">
          {t("privacyPage.visibilityHint", { ns: "settings" })}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: "public" as const,
                label: t("visibilityPublic", { ns: "settings" }),
                hint: t("privacyPage.openProfile", { ns: "settings" }),
              },
              {
                id: "private" as const,
                label: t("visibilityPrivate", { ns: "settings" }),
                hint: t("privacyPage.approveFollows", { ns: "settings" }),
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => void saveVisibility(opt.id)}
              className={`min-h-11 rounded-2xl border px-3 py-2.5 text-left transition ${
                visibility === opt.id
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:border-accent/40"
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-[11px] text-muted">{opt.hint}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          {t("privacyPage.whoCanMessage", { ns: "settings" })}
        </h2>
        <div className="space-y-2">
          {(
            [
              {
                id: "everyone" as const,
                label: t("privacyPage.everyone", { ns: "settings" }),
              },
              {
                id: "followers" as const,
                label: t("privacyPage.peopleYouFollow", { ns: "settings" }),
              },
              {
                id: "none" as const,
                label: t("privacyPage.noOne", { ns: "settings" }),
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => saveMessages(opt.id)}
              className={`flex min-h-11 w-full items-center rounded-2xl border px-4 text-left text-sm font-medium transition ${
                messagePrivacy === opt.id
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:border-accent/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          {t("privacyPage.blocked", { ns: "settings" })}
        </h2>
        {blocked.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            {t("privacyPage.blockedEmpty", { ns: "settings" })}
          </p>
        ) : (
          <ul className="space-y-2">
            {blocked.map((card) => {
              if (!card) return null;
              const { profile: p } = card;
              return (
                <li
                  key={p.userId}
                  className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2.5"
                >
                  <Link href={`/social/u/${p.username}`} className="shrink-0">
                    <SocialAvatar
                      name={p.displayName}
                      size="sm"
                      src={p.avatarUrl || undefined}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {p.displayName}
                    </p>
                    <p className="truncate text-xs text-muted">@{p.username}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      unblockUser(p.userId);
                      toast(
                        t("privacyPage.unblocked", { ns: "settings" }),
                        "info",
                      );
                    }}
                  >
                    {t("buttons.unblock")}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          {t("privacyPage.reports", { ns: "settings" })}
        </h2>
        <p className="text-sm text-muted">
          {t("privacyPage.reportsBodyLong", { ns: "settings" })}
        </p>
        <Link
          href="/settings/help"
          className="inline-block text-sm font-medium text-accent"
        >
          {t("privacyPage.contactSupport", { ns: "settings" })}
        </Link>
      </section>
    </div>
  );
}
