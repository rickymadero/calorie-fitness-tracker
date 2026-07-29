"use client";

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Timer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useTrackWorkout } from "@/components/track/TrackWorkoutProvider";
import {
  getTrackActivity,
  type TrackActivityId,
} from "@/lib/track/activityCatalog";

const VALID = new Set([
  "running",
  "walking",
  "cycling",
  "hiking",
  "treadmill",
  "indoor_cycling",
  "swimming",
  "strength",
  "hyrox",
  "yoga",
  "hiit",
  "functional",
  "sports",
  "other",
]);

export default function TrackPreparePage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId: raw } = use(params);
  const activityId = (
    VALID.has(raw) ? raw : "other"
  ) as TrackActivityId;
  const def = getTrackActivity(activityId);
  const { t } = useAppTranslation(["track", "common"]);
  const router = useRouter();
  const {
    prepare,
    setReady,
    start,
    snapshot,
    gpsStatus,
    setGpsDenied,
  } = useTrackWorkout();
  const probedRef = useRef(false);
  const preparedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      snapshot?.phase === "active" ||
      snapshot?.phase === "paused"
    ) {
      if (snapshot.activityId === activityId) {
        router.replace("/track/active");
      }
      return;
    }

    if (
      snapshot?.activityId === activityId &&
      (snapshot.phase === "preparing" || snapshot.phase === "ready")
    ) {
      return;
    }

    if (preparedForRef.current === activityId) return;
    preparedForRef.current = activityId;
    probedRef.current = false;
    prepare(activityId);
  }, [activityId, prepare, router, snapshot?.activityId, snapshot?.phase]);

  useEffect(() => {
    if (probedRef.current) return;
    if (!snapshot || snapshot.activityId !== activityId) return;
    if (snapshot.phase !== "preparing" && snapshot.phase !== "ready") return;
    probedRef.current = true;

    if (!def.usesGps) {
      setReady();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsDenied(true);
      setReady();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setReady(),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGpsDenied(true);
        setReady();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  }, [
    activityId,
    def.usesGps,
    setGpsDenied,
    setReady,
    snapshot,
  ]);

  const gpsLabel =
    gpsStatus === "ready"
      ? t("track:gpsReady")
      : gpsStatus === "denied"
        ? t("track:gpsDenied")
        : gpsStatus === "unsupported"
          ? t("track:gpsUnsupported")
          : t("track:gpsAcquiring");

  return (
    <div>
      <PageHeader
        title={t(`track:${def.titleKey}`)}
        subtitle={t("track:prepareSubtitle")}
        backHref="/track"
        backLabel={t("track:title")}
      />

      <div className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-xl font-semibold">
          {t("track:prepareTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("track:prepareSubtitle")}</p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-muted-bg px-4 py-3">
          {def.usesGps && !snapshot?.gpsDenied ? (
            <MapPin size={18} className="text-accent-dim dark:text-accent" />
          ) : (
            <Timer size={18} className="text-muted" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {def.usesGps ? gpsLabel : t("track:gpsDenied")}
            </p>
            {(snapshot?.gpsDenied || !def.usesGps) && (
              <p className="text-xs text-muted">{t("track:timerOnlyHint")}</p>
            )}
          </div>
        </div>

        <Button
          className="mt-6"
          fullWidth
          size="lg"
          disabled={!snapshot}
          onClick={() => {
            start();
            router.push("/track/active");
          }}
        >
          {t("track:start")}
        </Button>
      </div>
    </div>
  );
}
