"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { usePosts } from "@/components/posts/PostsProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import type { ActivityType, PostVisibility } from "@/lib/types/posts";
import { syncLocalPostActivity } from "@/lib/activities/syncLocalActivity";

const TYPE_IDS: ActivityType[] = [
  "running",
  "walking",
  "cycling",
  "hiking",
  "swimming",
  "gym",
  "yoga",
  "sports",
  "custom",
];

export function ActivityTypePicker({
  value,
  onChange,
}: {
  value: ActivityType;
  onChange: (t: ActivityType) => void;
}) {
  const { t } = useAppTranslation("posts");
  return (
    <div className="flex flex-wrap gap-2">
      {TYPE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium ${
            value === id
              ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
              : "border-border text-muted"
          }`}
        >
          {t(`types.${id}`)}
        </button>
      ))}
    </div>
  );
}

export function CreatePostForm() {
  const { createPost } = usePosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useAppTranslation(["posts", "common"]);
  const router = useRouter();

  const [type, setType] = useState<ActivityType>("running");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [gymSummary, setGymSummary] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const needsDistance = ["running", "walking", "cycling", "swimming"].includes(
    type,
  );
  const needsGym = type === "gym";

  function onPhoto(file: File | null) {
    if (!file) {
      setPhotoUrl(undefined);
      return;
    }
    if (file.size > 2_000_000) {
      toast(t("photoSizeDemo"), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // Downscale large data-URLs so feed localStorage / renders stay healthy.
      const img = new Image();
      img.onload = () => {
        const max = 1280;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setPhotoUrl(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        setPhotoUrl(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => setPhotoUrl(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function onVideo(file: File | null) {
    if (!file) {
      setVideoUrl(undefined);
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast(t("errors.pickVideo", { ns: "common" }), "error");
      return;
    }
    // Data-URLs inflate ~33%; keep clips short so localStorage can save them.
    if (file.size > 4_000_000) {
      toast(t("errors.videoSize", { ns: "common" }), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setVideoUrl(String(reader.result));
    reader.onerror = () => toast(t("readVideoFail"), "error");
    reader.readAsDataURL(file);
  }

  function onMedia(file: File | null) {
    if (!file) return;
    if (file.type.startsWith("video/")) {
      onVideo(file);
      return;
    }
    if (file.type.startsWith("image/")) {
      onPhoto(file);
      return;
    }
    toast(t("common:errors.pickMedia"), "error");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast(t("toast.needTitle"), "error");
      return;
    }
    setSaving(true);
    const post = createPost({
      type,
      title: title.trim(),
      caption: caption.trim(),
      occurredAt: new Date().toISOString(),
      visibility,
      photoUrl,
      videoUrl,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      durationMin: durationMin ? Number(durationMin) : undefined,
      gymSummary: needsGym ? gymSummary.trim() || undefined : undefined,
    });
    if (!post) {
      setSaving(false);
      toast(t("toast.publishFail"), "error");
      return;
    }

    // Dual-write activity to Supabase; keep local post. Soft-fail if offline.
    if (user?.id) {
      try {
        await syncLocalPostActivity(user.id, post);
      } catch {
        /* local post already saved */
      }
    }

    setSaving(false);
    toast(t("toast.published"), "success");
    router.push(`/posts/${post.id}`);
  }

  return (
    <Card>
      <form onSubmit={(e) => void submit(e)} className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">{t("activityType")}</p>
          <ActivityTypePicker value={type} onChange={setType} />
        </div>

        <Input
          label={t("title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("caption")}</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 280))}
            rows={3}
            placeholder={t("captionPlaceholder")}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent"
          />
        </div>

        {needsDistance && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("distanceKm")}
              type="number"
              step="0.1"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="5"
            />
            <Input
              label={t("durationMin")}
              type="number"
              min="0"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="28"
            />
          </div>
        )}

        {!needsDistance && (
          <Input
            label={t("durationMin")}
            type="number"
            min="0"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="45"
          />
        )}

        {needsGym && (
          <Input
            label={t("gymSummary")}
            value={gymSummary}
            onChange={(e) => setGymSummary(e.target.value)}
            placeholder={t("gymPlaceholder")}
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium">{t("whoCanSee")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "public" as const, labelKey: "visibility.public" },
                { id: "followers" as const, labelKey: "visibility.followers" },
                { id: "private" as const, labelKey: "visibility.onlyMe" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisibility(v.id)}
                className={`min-h-11 rounded-2xl border text-sm font-medium ${
                  visibility === v.id
                    ? "border-accent bg-accent-soft"
                    : "border-border"
                }`}
              >
                {t(v.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("mediaOptional")}
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => onMedia(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-muted-bg file:px-4 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-1.5 text-xs text-muted">{t("mediaHint")}</p>
          {(photoUrl || videoUrl) && (
            <div className="mt-3 space-y-3">
              {photoUrl && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt=""
                    className="max-h-48 w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
                    onClick={() => setPhotoUrl(undefined)}
                  >
                    {t("removePhoto")}
                  </button>
                </div>
              )}
              {videoUrl && (
                <div className="relative">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="max-h-56 w-full rounded-2xl bg-black object-contain"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
                    onClick={() => setVideoUrl(undefined)}
                  >
                    {t("removeVideo")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.back()}
            className="sm:w-auto"
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button type="submit" loading={saving} fullWidth size="lg">
            {t("publish")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
