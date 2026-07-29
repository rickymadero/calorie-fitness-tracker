"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { RouteMapPreview } from "@/components/feed/RouteMapPreview";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useTrackWorkout } from "@/components/track/TrackWorkoutProvider";
import { getTrackActivity } from "@/lib/track/activityCatalog";
import {
  formatDistance,
  formatDuration,
  formatPace,
  paceSecondsPerKm,
  speedKmh,
} from "@/lib/track/metrics";
import { computeElapsedSeconds } from "@/lib/track/activeWorkoutStorage";
import { syncTrackedWorkout } from "@/lib/track/syncTrackedWorkout";
import { trimRoutePrivacy } from "@/lib/track/routePrivacy";
import { fileToCompressedDataUrl } from "@/lib/media/dualCapture";

export default function TrackSummaryPage() {
  const { t } = useAppTranslation(["track", "common", "posts"]);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const units =
    user?.measurementSystem === "imperial" ? "imperial" : "metric";
  const { snapshot, updateMeta, clearLocal, discard, loadExisting } =
    useTrackWorkout();
  const [saving, setSaving] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!snapshot && !hydratedRef.current) {
      hydratedRef.current = true;
      const existing = loadExisting();
      if (!existing || existing.phase !== "completed") {
        router.replace("/track");
      }
      return;
    }
    if (!snapshot) return;
    if (snapshot.phase !== "completed") {
      if (
        snapshot.phase === "active" ||
        snapshot.phase === "paused" ||
        snapshot.phase === "finishing"
      ) {
        router.replace("/track/active");
      } else {
        router.replace("/track");
      }
    }
  }, [snapshot, loadExisting, router]);

  if (!snapshot || snapshot.phase !== "completed") return null;

  const def = getTrackActivity(snapshot.activityId);
  const elapsed = computeElapsedSeconds(snapshot);
  const pace = paceSecondsPerKm(snapshot.distanceMeters, elapsed);
  const speed = speedKmh(snapshot.distanceMeters, elapsed);
  const mapPoints =
    snapshot.privacyRouteMode === "hide_route" ||
    snapshot.privacyRouteMode === "private"
      ? []
      : trimRoutePrivacy(snapshot.points, snapshot.privacyRouteMode).map(
          (p) => ({ lat: p.latitude, lng: p.longitude }),
        );

  async function onMediaSelected(file: File | null) {
    if (!file) return;
    if (file.type.startsWith("video/")) {
      if (file.size > 4_000_000) {
        toast(t("track:videoTooLarge"), "error");
        return;
      }
      setMediaBusy(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("read failed"));
          reader.readAsDataURL(file);
        });
        updateMeta({ videoUrl: dataUrl, photoUrl: null });
      } catch {
        toast(t("common:errors.generic"), "error");
      } finally {
        setMediaBusy(false);
        if (mediaInputRef.current) mediaInputRef.current.value = "";
      }
      return;
    }
    if (file.type.startsWith("image/")) {
      if (file.size > 2_000_000) {
        toast(t("track:photoTooLarge"), "error");
        return;
      }
      setMediaBusy(true);
      try {
        const dataUrl = await fileToCompressedDataUrl(file);
        updateMeta({ photoUrl: dataUrl, videoUrl: null });
      } catch {
        toast(t("common:errors.generic"), "error");
      } finally {
        setMediaBusy(false);
        if (mediaInputRef.current) mediaInputRef.current.value = "";
      }
      return;
    }
    toast(t("common:errors.pickMedia"), "error");
  }

  async function save(publish: boolean) {
    if (!user || !snapshot) return;
    setSaving(true);
    setError(null);
    const snapToSave =
      publish || snapshot.visibility === "private"
        ? snapshot
        : { ...snapshot, visibility: "private" as const };
    if (!publish && snapshot.visibility !== "private") {
      updateMeta({ visibility: "private" });
    }
    const result = await syncTrackedWorkout({
      userId: user.id,
      snapshot: snapToSave,
      publish,
    });
    setSaving(false);
    if (result.errorMessage && !result.activityId) {
      setError(result.errorMessage || t("track:saveError"));
      return;
    }
    clearLocal();
    if (publish && result.postId) {
      router.replace(`/posts/${result.postId}`);
    } else {
      router.replace("/feed");
    }
  }

  return (
    <div className="pb-10">
      <PageHeader
        title={t("track:summaryTitle")}
        subtitle={t("track:sourceTracked")}
        backHref="/track"
        actions={
          <button
            type="button"
            className="text-sm font-medium text-danger"
            onClick={() => {
              discard();
              router.replace("/track");
            }}
          >
            {t("track:discard")}
          </button>
        }
      />

      <p className="text-sm text-muted">
        {t(`track:${def.titleKey}`)} · {formatDuration(elapsed)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryMetric
          label={t("track:metrics.distance")}
          value={formatDistance(snapshot.distanceMeters, units)}
        />
        {def.metrics.includes("pace") && (
          <SummaryMetric
            label={t("track:metrics.pace")}
            value={formatPace(pace)}
          />
        )}
        {def.metrics.includes("speed") && (
          <SummaryMetric
            label={t("track:metrics.speed")}
            value={
              speed != null
                ? units === "imperial"
                  ? `${(speed * 0.621371).toFixed(1)} mph`
                  : `${speed.toFixed(1)} km/h`
                : "--"
            }
          />
        )}
        <SummaryMetric
          label={t("track:metrics.calories")}
          value={`${snapshot.calories || 0}`}
        />
        {def.metrics.includes("elevation") && (
          <SummaryMetric
            label={t("track:metrics.elevation")}
            value={
              units === "imperial"
                ? `${Math.round(snapshot.elevationGainMeters * 3.28084)} ft`
                : `${Math.round(snapshot.elevationGainMeters)} m`
            }
          />
        )}
      </div>

      {mapPoints.length >= 2 && (
        <div className="mt-5">
          <RouteMapPreview
            points={mapPoints}
            height={200}
            hideStart={snapshot.privacyRouteMode === "hide_start_end"}
            hideEnd={snapshot.privacyRouteMode === "hide_start_end"}
            interactive={false}
          />
        </div>
      )}

      {snapshot.splits.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("track:metrics.splits")}
          </h3>
          <ul className="mt-2 divide-y divide-border rounded-2xl border border-border">
            {snapshot.splits.map((s) => (
              <li
                key={s.splitNumber}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <span>
                  {units === "imperial" ? "Mi" : "Km"} {s.splitNumber}
                </span>
                <span className="tabular-nums text-muted">
                  {formatDuration(s.elapsedSeconds)} ·{" "}
                  {formatPace(s.avgPaceSecondsPerKm)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("track:titleLabel")}
          </span>
          <input
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={snapshot.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("track:notesLabel")}
          </span>
          <textarea
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            rows={3}
            value={snapshot.notes}
            onChange={(e) => updateMeta({ notes: e.target.value })}
          />
        </label>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("track:photoLabel")}
          </span>
          <p className="mt-1 text-xs text-muted">{t("track:photoHint")}</p>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={(e) =>
              void onMediaSelected(e.target.files?.[0] ?? null)
            }
          />
          {(snapshot.photoUrl || snapshot.videoUrl) && (
            <div className="mt-2 space-y-3">
              {snapshot.photoUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={snapshot.photoUrl}
                    alt=""
                    className="max-h-56 w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
                    onClick={() => updateMeta({ photoUrl: null })}
                    aria-label={t("track:photoRemove")}
                  >
                    {t("track:photoRemove")}
                  </button>
                </div>
              ) : null}
              {snapshot.videoUrl ? (
                <div className="relative">
                  <video
                    src={snapshot.videoUrl}
                    controls
                    playsInline
                    className="max-h-56 w-full rounded-2xl bg-black"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white"
                    onClick={() => updateMeta({ videoUrl: null })}
                    aria-label={t("track:videoRemove")}
                  >
                    {t("track:videoRemove")}
                  </button>
                </div>
              ) : null}
            </div>
          )}
          {!snapshot.photoUrl && !snapshot.videoUrl ? (
            <button
              type="button"
              disabled={mediaBusy || saving}
              onClick={() => mediaInputRef.current?.click()}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground disabled:opacity-60"
            >
              <ImagePlus size={16} />
              {mediaBusy ? t("track:saving") : t("track:photoAdd")}
            </button>
          ) : (
            <button
              type="button"
              disabled={mediaBusy || saving}
              onClick={() => mediaInputRef.current?.click()}
              className="mt-2 text-sm font-medium text-accent-dim underline-offset-2 hover:underline dark:text-accent disabled:opacity-60"
            >
              {mediaBusy ? t("track:saving") : t("track:photoAdd")}
            </button>
          )}
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("track:visibilityLabel")}
          </span>
          <select
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={snapshot.visibility}
            onChange={(e) =>
              updateMeta({
                visibility: e.target.value as
                  | "public"
                  | "followers"
                  | "private",
              })
            }
          >
            <option value="public">{t("common:labels.public")}</option>
            <option value="followers">
              {t("posts:visibility.followers")}
            </option>
            <option value="private">{t("common:labels.private")}</option>
          </select>
        </label>
        {snapshot.points.length >= 2 && (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("track:routePrivacyLabel")}
            </span>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={snapshot.privacyRouteMode}
              onChange={(e) =>
                updateMeta({
                  privacyRouteMode: e.target.value as
                    | "show"
                    | "hide_route"
                    | "hide_start_end"
                    | "private",
                })
              }
            >
              <option value="show">{t("track:privacyShow")}</option>
              <option value="hide_start_end">
                {t("track:privacyHideEnds")}
              </option>
              <option value="hide_route">{t("track:privacyHideRoute")}</option>
              <option value="private">{t("track:privacyPrivate")}</option>
            </select>
          </label>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          fullWidth
          loading={saving}
          onClick={() => void save(false)}
        >
          {t("track:savePrivate")}
        </Button>
        <Button fullWidth loading={saving} onClick={() => void save(true)}>
          {t("track:publish")}
        </Button>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
