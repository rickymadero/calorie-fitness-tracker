"use client";

import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { getTrackActivity } from "@/lib/track/activityCatalog";
import type { ActiveWorkoutSnapshot } from "@/lib/track/activeWorkoutStorage";
import type { GpsStatus } from "@/components/track/TrackWorkoutProvider";
import {
  currentAltitudeMeters,
  formatElevation,
  formatHeroMetric,
  formatPace,
  heroKindForActivity,
} from "@/lib/track/liveMetrics";
import { formatDuration } from "@/lib/track/metrics";
import { HeroMetric } from "@/components/track/live/HeroMetric";
import {
  SecondaryMetricsGrid,
  type SecondaryMetricItem,
} from "@/components/track/live/SecondaryMetricsGrid";
import { LivePaceChart } from "@/components/track/live/LivePaceChart";
import { SportExtras } from "@/components/track/live/SportExtras";

type LiveTrackingDashboardProps = {
  snapshot: ActiveWorkoutSnapshot;
  elapsedSeconds: number;
  gpsStatus: GpsStatus;
  avgPaceSecondsPerKm: number | null;
  instantPaceSecondsPerKm: number | null;
  avgSpeedKmh: number | null;
  instantSpeedKmh: number | null;
  units: "metric" | "imperial";
  onPause: () => void;
  onResume: () => void;
  onRequestFinish: () => void;
  onConfirmFinish: () => void;
  onContinue: () => void;
  onDiscard: () => void;
  onLap: () => void;
  onLogSet: (input: {
    name: string;
    weightKg: number;
    reps: number;
  }) => void;
  onHyroxStation: () => void;
};

function gpsLabel(
  status: GpsStatus,
  t: (k: string) => string,
  usesGps: boolean,
) {
  if (!usesGps) return t("track:gpsDenied");
  if (status === "ready") return t("track:gpsReady");
  if (status === "denied") return t("track:gpsDenied");
  if (status === "unsupported") return t("track:gpsUnsupported");
  if (status === "weak") return t("track:gpsAcquiring");
  return t("track:gpsAcquiring");
}

export function LiveTrackingDashboard({
  snapshot,
  elapsedSeconds,
  gpsStatus,
  avgPaceSecondsPerKm,
  instantPaceSecondsPerKm,
  avgSpeedKmh,
  instantSpeedKmh,
  units,
  onPause,
  onResume,
  onRequestFinish,
  onConfirmFinish,
  onContinue,
  onDiscard,
  onLap,
  onLogSet,
  onHyroxStation,
}: LiveTrackingDashboardProps) {
  const { t } = useAppTranslation(["track", "common"]);
  const def = getTrackActivity(snapshot.activityId);
  const isPaused = snapshot.phase === "paused";
  const finishOpen = snapshot.phase === "finishing";
  const controlsDisabled =
    snapshot.phase !== "active" && snapshot.phase !== "paused";
  const heroKind = heroKindForActivity(snapshot.activityId);
  const volumeKg = (snapshot.strengthSets ?? []).reduce(
    (sum, s) => sum + s.weightKg * s.reps,
    0,
  );
  const hero = formatHeroMetric({
    kind: heroKind,
    distanceMeters: snapshot.distanceMeters,
    elevationGainMeters: snapshot.elevationGainMeters,
    elapsedSeconds,
    lapCount: snapshot.manualLaps.length,
    volumeKg,
    units,
  });

  const heroLabel =
    heroKind === "distance"
      ? t("track:metrics.distance")
      : heroKind === "elevation"
        ? t("track:live.elevationGain")
        : heroKind === "laps"
          ? t("track:live.laps")
          : heroKind === "volume"
            ? t("track:live.volume")
            : t("track:metrics.time");

  const paceUnit = units === "imperial" ? "/mi" : "/km";
  const displayPace = instantPaceSecondsPerKm ?? avgPaceSecondsPerKm;
  const displaySpeed = instantSpeedKmh ?? avgSpeedKmh;
  const alt = currentAltitudeMeters(snapshot.points);

  const secondary: SecondaryMetricItem[] = [];

  // Always show duration when hero isn't duration
  if (heroKind !== "duration") {
    secondary.push({
      key: "time",
      label: t("track:metrics.time"),
      value: formatDuration(elapsedSeconds),
    });
  }

  if (def.metrics.includes("distance") && heroKind !== "distance") {
    secondary.push({
      key: "distance",
      label: t("track:metrics.distance"),
      value:
        units === "imperial"
          ? `${(snapshot.distanceMeters / 1609.344).toFixed(2)} mi`
          : snapshot.distanceMeters < 1000
            ? `${Math.round(snapshot.distanceMeters)} m`
            : `${(snapshot.distanceMeters / 1000).toFixed(2)} km`,
    });
  }

  if (def.metrics.includes("pace")) {
    secondary.push({
      key: "pace",
      label: t("track:metrics.pace"),
      value: `${formatPace(displayPace)} ${paceUnit}`,
      hint:
        instantPaceSecondsPerKm != null
          ? t("track:live.current")
          : t("track:live.average"),
    });
  }

  if (def.metrics.includes("speed")) {
    secondary.push({
      key: "speed",
      label: t("track:metrics.speed"),
      value:
        displaySpeed != null
          ? units === "imperial"
            ? `${(displaySpeed * 0.621371).toFixed(1)} mph`
            : `${displaySpeed.toFixed(1)} km/h`
          : "--",
    });
  }

  if (
    snapshot.activityId === "running" ||
    snapshot.activityId === "walking" ||
    snapshot.activityId === "treadmill"
  ) {
    secondary.push({
      key: "cadence",
      label: t("track:live.cadence"),
      value:
        snapshot.estimatedCadenceSpm != null
          ? `${snapshot.estimatedCadenceSpm}`
          : "--",
      hint: t("track:live.cadenceEst"),
    });
  }

  if (def.metrics.includes("elevation")) {
    secondary.push({
      key: "elev",
      label: t("track:metrics.elevation"),
      value: `+${formatElevation(snapshot.elevationGainMeters, units)}`,
      hint:
        alt != null
          ? `${t("track:live.altitude")} ${formatElevation(alt, units)}`
          : undefined,
    });
  }

  if (def.metrics.includes("calories")) {
    secondary.push({
      key: "cal",
      label: t("track:metrics.calories"),
      value: `${snapshot.calories || 0}`,
    });
  }

  // Honest empty HR — wearables not live on web
  if (def.metrics.includes("heart_rate")) {
    secondary.push({
      key: "hr",
      label: t("track:live.heartRate"),
      value: "--",
      hint: t("track:live.wearableRequired"),
    });
  }

  if (snapshot.activityId === "hyrox") {
    secondary.push({
      key: "stations",
      label: t("track:live.stations"),
      value: `${snapshot.hyroxStationsCompleted ?? 0}/8`,
    });
  }

  const chartMode =
    snapshot.activityId === "cycling" ||
    snapshot.activityId === "indoor_cycling"
      ? "speed"
      : "pace";
  const showChart =
    snapshot.usesGps &&
    (def.metrics.includes("pace") || def.metrics.includes("speed")) &&
    (snapshot.paceSamples?.length ?? 0) >= 0;

  return (
    <div className="pb-10">
      {/* Sticky mini header */}
      <div className="sticky top-0 z-20 -mx-3 mb-4 border-b border-border/70 bg-background/90 px-3 py-2 backdrop-blur-md sm:-mx-5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {t(`track:${def.titleKey}`)}
            </p>
            <p className="text-[11px] text-muted">
              {formatDuration(elapsedSeconds)} ·{" "}
              {gpsLabel(gpsStatus, t, snapshot.usesGps && !snapshot.gpsDenied)}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-danger"
            onClick={() => {
              if (
                window.confirm(
                  `${t("track:discardTitle")}\n${t("track:discardBody")}`,
                )
              ) {
                onDiscard();
              }
            }}
          >
            {t("track:discard")}
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted">{t("track:bgWarning")}</p>

      <HeroMetric
        value={hero.value}
        unit={hero.unit}
        label={heroLabel}
        paused={isPaused}
      />

      <div className="mt-4">
        <SecondaryMetricsGrid items={secondary.slice(0, 6)} />
      </div>

      {showChart && (
        <div className="mt-4">
          <LivePaceChart
            samples={snapshot.paceSamples ?? []}
            mode={chartMode}
            title={
              chartMode === "speed"
                ? t("track:live.speedTrend")
                : t("track:live.paceTrend")
            }
            units={units}
          />
        </div>
      )}

      {(snapshot.splits?.length ?? 0) > 0 && (
        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-2 pb-1">
            {snapshot.splits.slice(-5).map((s) => (
              <div
                key={s.splitNumber}
                className="min-w-[72px] rounded-xl border border-border bg-card px-2 py-2 text-center"
              >
                <p className="text-[10px] text-muted">
                  {units === "imperial" ? "Mi" : "Km"} {s.splitNumber}
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatPace(s.avgPaceSecondsPerKm)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <SportExtras
          snapshot={snapshot}
          elapsedSeconds={elapsedSeconds}
          onLap={onLap}
          onLogSet={onLogSet}
          onHyroxStation={onHyroxStation}
          disabled={snapshot.phase !== "active"}
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {isPaused ? (
          <Button size="lg" onClick={onResume} className="min-w-[132px]">
            <Play size={18} />
            {t("track:resumeActive")}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="secondary"
            onClick={onPause}
            className="min-w-[132px]"
            disabled={snapshot.phase !== "active"}
          >
            <Pause size={18} />
            {t("track:pause")}
          </Button>
        )}
        <Button
          size="lg"
          variant="danger"
          onClick={onRequestFinish}
          disabled={controlsDisabled}
        >
          <Square size={16} />
          {t("track:finish")}
        </Button>
      </div>

      <Modal
        open={finishOpen}
        onClose={onContinue}
        title={t("track:finishConfirmTitle")}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={onContinue}>
              {t("track:continueWorkout")}
            </Button>
            <Button fullWidth onClick={onConfirmFinish}>
              {t("track:finishConfirm")}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">{t("track:finishConfirmBody")}</p>
      </Modal>
    </div>
  );
}
