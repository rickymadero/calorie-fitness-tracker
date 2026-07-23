"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { SocialAvatar } from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { socialStorage } from "@/lib/storage/social";
import type { ProfileVisibility } from "@/lib/types/social";

function downscaleImage(dataUrl: string, max = 640): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function EditProfilePage() {
  const { user, updateUser, profile, refreshProfile } = useAuth();
  const { myProfile, ensureMyProfile, updateMyProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "settings", "profile"]);
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [instagram, setInstagram] = useState("");
  const [showInstagram, setShowInstagram] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Auth hydrate / token refresh replaces `user`/`profile` refs often; don't
  // clobber in-progress edits (especially full name) when that happens.
  const formDirtyRef = useRef(false);

  useEffect(() => {
    formDirtyRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (!user || formDirtyRef.current) return;
    const p = ensureMyProfile();
    setFullName(profile?.full_name?.trim() || user.fullName);
    setUsername(profile?.username || p?.username || "");
    setBio(profile?.bio ?? p?.bio ?? "");
    const httpAvatar =
      profile?.avatar_url && /^https?:\/\//i.test(profile.avatar_url)
        ? profile.avatar_url
        : "";
    setAvatarUrl(httpAvatar || p?.avatarUrl || "");
    setVisibility(
      profile?.is_private
        ? "private"
        : (p?.visibility ?? "public"),
    );
    if (p) {
      setInstagram(p.instagramUsername ?? "");
      setShowInstagram(p.showInstagram);
    }
  }, [user, ensureMyProfile, myProfile?.userId, profile]);

  if (!user) return null;

  function onAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast(t("common:errors.pickImage"), "error");
      return;
    }
    if (file.size > 2_000_000) {
      toast(t("common:errors.photoSize"), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = String(reader.result);
      const scaled = await downscaleImage(raw);
      formDirtyRef.current = true;
      setAvatarUrl(scaled);
    };
    reader.readAsDataURL(file);
  }

  async function validateUsername() {
    const clean = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 30);
    if (clean.length < 3) {
      setUsernameError(t("common:errors.usernameMin"));
      return null;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { profilesService } = await import("@/lib/services/profiles");
      const supabase = createClient();
      const check = await profilesService.isUsernameAvailable(
        supabase,
        clean,
        user!.id,
      );
      if (check.error) {
        setUsernameError(check.error.message);
        return null;
      }
      if (!check.available) {
        setUsernameError(t("common:errors.usernameTaken"));
        return null;
      }
    } catch {
      if (socialStorage.isUsernameTaken(clean, user!.id)) {
        setUsernameError(t("common:errors.usernameTaken"));
        return null;
      }
    }
    setUsernameError("");
    return clean;
  }

  async function saveChanges() {
    const clean = await validateUsername();
    if (!clean) return;

    const nextName = fullName.trim().slice(0, 80) || user!.fullName;
    const nextBio = bio.slice(0, 160);
    const httpAvatar = avatarUrl.startsWith("http") ? avatarUrl : null;

    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { profilesService } = await import("@/lib/services/profiles");
      const { authService } = await import("@/lib/services/auth");
      const { mirrorSupabaseProfileToSocial } = await import(
        "@/lib/auth/mirrorSocialProfile"
      );
      const supabase = createClient();
      const { data, error } = await profilesService.updateOwn(
        supabase,
        user!.id,
        {
          username: clean,
          full_name: nextName,
          bio: nextBio || null,
          // Keep existing http avatar unless replacing with another http URL.
          // Data-URL picks stay local-only until Storage is wired.
          ...(httpAvatar || !avatarUrl
            ? { avatar_url: httpAvatar }
            : {}),
          is_private: visibility === "private",
        },
      );
      if (error || !data) {
        toast(error?.message || t("common:errors.generic"), "error");
        setSaving(false);
        return;
      }

      // Keep Auth metadata in sync so hydrate fallbacks don't revive the old name.
      await authService.updateMetadata(supabase, { full_name: nextName });

      const savedName = data.full_name?.trim() || nextName;
      mirrorSupabaseProfileToSocial(data, savedName);
      updateMyProfile({
        username: data.username || clean,
        displayName: savedName,
        bio: data.bio ?? nextBio,
        avatarUrl: avatarUrl.slice(0, 400_000),
        visibility: data.is_private ? "private" : "public",
        instagramUsername: instagram.replace(/^@/, "").trim() || undefined,
        showInstagram,
      });
      // Local session only — avoid a second profiles write + auth event race.
      updateUser({ fullName: savedName }, { syncRemote: false });
      await refreshProfile();
    } catch {
      toast(t("common:errors.generic"), "error");
      setSaving(false);
      return;
    }

    formDirtyRef.current = false;
    setSaving(false);
    toast(t("common:success.settingsSaved"), "success");
    router.push("/profile");
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader title={t("profile:edit")} href="/profile" />

      <div className="space-y-7">
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="relative rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t("settings:photo")}
              >
                <SocialAvatar
                  name={fullName || "Athlete"}
                  size="lg"
                  src={avatarUrl || undefined}
                />
                <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-accent text-accent-fg shadow-apex">
                  <Plus size={16} strokeWidth={2.5} />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  onAvatar(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("settings:photo")}</p>
              <p className="mt-0.5 text-xs text-muted">
                {t("settings:photoHint")}
              </p>
              {avatarUrl ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-muted hover:text-foreground"
                  onClick={() => {
                    formDirtyRef.current = true;
                    setAvatarUrl("");
                  }}
                >
                  {t("settings:removePhoto")}
                </button>
              ) : null}
            </div>
          </div>

          <Input
            label={t("settings:fullName")}
            value={fullName}
            onChange={(e) => {
              formDirtyRef.current = true;
              setFullName(e.target.value);
            }}
            autoComplete="name"
          />
          <Input
            label={t("settings:username")}
            value={username}
            onChange={(e) => {
              formDirtyRef.current = true;
              setUsername(e.target.value);
              setUsernameError("");
            }}
            autoComplete="username"
            error={usernameError || undefined}
            hint={
              !usernameError
                ? t("settings:shownAs", { username: username || "…" })
                : undefined
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("settings:bio")}
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                formDirtyRef.current = true;
                setBio(e.target.value.slice(0, 160));
              }}
              rows={3}
              placeholder={t("settings:bioPlaceholder")}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <p className="mt-1 text-xs text-muted">{bio.length}/160</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            {t("settings:privacy")}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "public" as const,
                  label: t("settings:visibilityPublic"),
                  hint: t("settings:visibilityPublicHint"),
                },
                {
                  id: "private" as const,
                  label: t("settings:visibilityPrivate"),
                  hint: t("settings:visibilityPrivateHint"),
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  formDirtyRef.current = true;
                  setVisibility(opt.id);
                }}
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
          <Link
            href="/settings/privacy"
            className="block text-sm font-medium text-accent"
          >
            {t("settings:morePrivacy")}
          </Link>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            {t("settings:linked")}
          </h2>
          <Input
            label={t("settings:instagram")}
            value={instagram}
            onChange={(e) => {
              formDirtyRef.current = true;
              setInstagram(e.target.value);
            }}
            placeholder={t("settings:instagramPlaceholder")}
            hint={t("settings:instagramHint")}
          />
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-border px-4">
            <span className="text-sm">{t("settings:showInstagram")}</span>
            <input
              type="checkbox"
              checked={showInstagram}
              onChange={(e) => {
                formDirtyRef.current = true;
                setShowInstagram(e.target.checked);
              }}
              className="h-4 w-4 accent-[var(--accent)]"
            />
          </label>
        </section>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push("/profile")}
            className="sm:w-auto"
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button
            type="button"
            fullWidth
            size="lg"
            loading={saving}
            onClick={() => void saveChanges()}
          >
            {t("common:buttons.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}
