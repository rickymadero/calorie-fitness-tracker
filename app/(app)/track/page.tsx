"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  Waves,
  Activity,
  PersonStanding,
  Timer,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTrackWorkout } from "@/components/track/TrackWorkoutProvider";
import {
  OUTDOOR_GPS_IDS,
  TRACK_ACTIVITIES,
  type TrackActivityId,
} from "@/lib/track/activityCatalog";
import {
  activeWorkoutStorage,
  type ActiveWorkoutSnapshot,
} from "@/lib/track/activeWorkoutStorage";

const ICONS: Partial<Record<TrackActivityId, typeof Activity>> = {
  running: Footprints,
  walking: PersonStanding,
  cycling: Bike,
  hiking: Mountain,
  treadmill: Footprints,
  indoor_cycling: Bike,
  swimming: Waves,
  strength: Dumbbell,
  hyrox: Zap,
  yoga: Activity,
  hiit: Zap,
  functional: Dumbbell,
  sports: Activity,
  other: Timer,
};

function resumeHref(snap: ActiveWorkoutSnapshot): string {
  if (snap.phase === "completed") return "/track/summary";
  if (
    snap.phase === "active" ||
    snap.phase === "paused" ||
    snap.phase === "finishing"
  ) {
    return "/track/active";
  }
  return `/track/prepare/${snap.activityId}`;
}

function isResumable(phase: ActiveWorkoutSnapshot["phase"]) {
  return (
    phase === "active" ||
    phase === "paused" ||
    phase === "finishing" ||
    phase === "ready" ||
    phase === "preparing"
  );
}

export default function TrackPickerPage() {
  const { t } = useAppTranslation(["track", "common"]);
  const router = useRouter();
  const { user } = useAuth();
  const { snapshot, loadExisting, discard } = useTrackWorkout();
  const [dismissed, setDismissed] = useState(false);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const existing = activeWorkoutStorage.load(user.id);
    if (!existing) return;

    if (existing.phase === "completed") {
      loadExisting();
      router.replace("/track/summary");
      return;
    }

    if (isResumable(existing.phase)) {
      loadExisting();
    }
  }, [user?.id, loadExisting, router]);

  const resumeOpen =
    !!snapshot && !dismissed && isResumable(snapshot.phase);

  const outdoor = TRACK_ACTIVITIES.filter((a) =>
    OUTDOOR_GPS_IDS.includes(a.id),
  );
  const indoor = TRACK_ACTIVITIES.filter(
    (a) => !OUTDOOR_GPS_IDS.includes(a.id),
  );

  return (
    <div>
      <PageHeader
        title={t("track:title")}
        subtitle={t("track:subtitle")}
        backHref="/feed"
        backLabel={t("common:nav.feed")}
      />

      <Modal
        open={resumeOpen}
        onClose={() => setDismissed(true)}
        title={t("track:resumeTitle")}
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                discard();
                setDismissed(true);
              }}
            >
              {t("track:discardResume")}
            </Button>
            <Button
              fullWidth
              onClick={() => {
                if (!snapshot) return;
                const href = resumeHref(snapshot);
                setDismissed(true);
                router.push(href);
              }}
            >
              {t("track:resume")}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">{t("track:resumeBody")}</p>
      </Modal>

      <section className="mt-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("track:outdoor")}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {outdoor.map((a) => {
            const Icon = ICONS[a.id] ?? Activity;
            return (
              <Link
                key={a.id}
                href={`/track/prepare/${a.id}`}
                className="flex min-h-[88px] flex-col items-start justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-3 transition hover:border-accent/40 hover:bg-muted-bg"
              >
                <Icon size={20} className="text-accent-dim dark:text-accent" />
                <span className="text-sm font-semibold">
                  {t(`track:${a.titleKey}`)}
                </span>
                <span className="text-[11px] text-muted">
                  {t(`track:${a.descKey}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("track:indoor")}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {indoor.map((a) => {
            const Icon = ICONS[a.id] ?? Timer;
            return (
              <Link
                key={a.id}
                href={`/track/prepare/${a.id}`}
                className="flex min-h-[80px] flex-col items-start justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-3 transition hover:border-accent/40 hover:bg-muted-bg"
              >
                <Icon size={18} className="text-muted" />
                <span className="text-sm font-semibold">
                  {t(`track:${a.titleKey}`)}
                </span>
                <span className="text-[11px] text-muted">
                  {t(`track:${a.descKey}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
