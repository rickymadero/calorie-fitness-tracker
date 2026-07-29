/** Live-tracking display helpers (canonical SI → UI). */

import type { TrackActivityId } from "@/lib/track/activityCatalog";
import type { GpsSample } from "@/lib/track/gpsFilter";
import {
  formatDistance,
  formatDuration,
  formatPace,
  haversineMeters,
  paceSecondsPerKm,
  speedKmh,
} from "@/lib/track/metrics";

export type HeroMetricKind =
  | "distance"
  | "duration"
  | "elevation"
  | "laps"
  | "volume";

export type PaceSample = {
  atMs: number;
  distanceMeters: number;
  paceSecondsPerKm: number | null;
  speedKmh: number | null;
};

export type SecondaryMetric = {
  key: string;
  labelKey: string;
  value: string;
  empty?: boolean;
};

/** Which hero number dominates for each activity. */
export function heroKindForActivity(id: TrackActivityId): HeroMetricKind {
  switch (id) {
    case "running":
    case "walking":
    case "cycling":
    case "treadmill":
    case "indoor_cycling":
      return "distance";
    case "hiking":
      return "elevation";
    case "swimming":
      return "laps";
    case "strength":
    case "functional":
      return "volume";
    case "hyrox":
    case "yoga":
    case "hiit":
    case "sports":
    case "other":
    default:
      return "duration";
  }
}

export function formatHeroMetric(opts: {
  kind: HeroMetricKind;
  distanceMeters: number;
  elevationGainMeters: number;
  elapsedSeconds: number;
  lapCount: number;
  volumeKg: number;
  units: "metric" | "imperial";
}): { value: string; unit: string } {
  switch (opts.kind) {
    case "distance": {
      if (opts.units === "imperial") {
        const mi = opts.distanceMeters / 1609.344;
        if (mi < 0.1) {
          return {
            value: String(Math.round(opts.distanceMeters * 3.28084)),
            unit: "ft",
          };
        }
        return { value: mi.toFixed(2), unit: "mi" };
      }
      if (opts.distanceMeters < 1000) {
        return {
          value: String(Math.round(opts.distanceMeters)),
          unit: "m",
        };
      }
      return {
        value: (opts.distanceMeters / 1000).toFixed(2),
        unit: "km",
      };
    }
    case "elevation": {
      if (opts.units === "imperial") {
        return {
          value: `+${Math.round(opts.elevationGainMeters * 3.28084)}`,
          unit: "ft",
        };
      }
      return {
        value: `+${Math.round(opts.elevationGainMeters)}`,
        unit: "m",
      };
    }
    case "laps":
      return { value: String(opts.lapCount), unit: "laps" };
    case "volume":
      return {
        value:
          opts.volumeKg >= 1000
            ? (opts.volumeKg / 1000).toFixed(1)
            : String(Math.round(opts.volumeKg)),
        unit: opts.volumeKg >= 1000 ? "t" : "kg",
      };
    case "duration":
    default:
      return { value: formatDuration(opts.elapsedSeconds), unit: "" };
  }
}

/** Instant pace from the last ~20–60s of GPS trail. */
export function instantPaceSecondsPerKm(
  points: GpsSample[],
): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1]!;
  const windowMs = 45_000;
  let startIdx = points.length - 2;
  for (let i = points.length - 2; i >= 0; i--) {
    startIdx = i;
    if (last.recordedAt - points[i]!.recordedAt >= windowMs) break;
  }
  const start = points[startIdx]!;
  let dist = 0;
  for (let i = startIdx + 1; i < points.length; i++) {
    dist += haversineMeters(points[i - 1]!, points[i]!);
  }
  const dt = (last.recordedAt - start.recordedAt) / 1000;
  return paceSecondsPerKm(dist, dt);
}

export function instantSpeedKmh(points: GpsSample[]): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1]!;
  if (last.speedMps != null && last.speedMps > 0.3) {
    return last.speedMps * 3.6;
  }
  const windowMs = 20_000;
  let startIdx = points.length - 2;
  for (let i = points.length - 2; i >= 0; i--) {
    startIdx = i;
    if (last.recordedAt - points[i]!.recordedAt >= windowMs) break;
  }
  const start = points[startIdx]!;
  let dist = 0;
  for (let i = startIdx + 1; i < points.length; i++) {
    dist += haversineMeters(points[i - 1]!, points[i]!);
  }
  const dt = (last.recordedAt - start.recordedAt) / 1000;
  return speedKmh(dist, dt);
}

/**
 * Estimated running cadence from speed (spm).
 * Honest estimate — not a wearable measurement.
 */
export function estimateCadenceSpm(speedKmhVal: number | null): number | null {
  if (speedKmhVal == null || speedKmhVal < 3) return null;
  // Rough linear model: walk ~110–120, easy run ~160, faster ~180
  const spm = 90 + speedKmhVal * 7.2;
  return Math.round(Math.min(200, Math.max(100, spm)));
}

export function currentAltitudeMeters(
  points: GpsSample[],
): number | null {
  for (let i = points.length - 1; i >= 0; i--) {
    const a = points[i]!.altitude;
    if (a != null && Number.isFinite(a)) return a;
  }
  return null;
}

/** Append a pace sample at most every `minIntervalMs`. Cap list length. */
export function appendPaceSample(
  samples: PaceSample[],
  next: PaceSample,
  minIntervalMs = 15_000,
  maxSamples = 40,
): PaceSample[] {
  const last = samples[samples.length - 1];
  if (last && next.atMs - last.atMs < minIntervalMs) return samples;
  const out = [...samples, next];
  if (out.length > maxSamples) return out.slice(out.length - maxSamples);
  return out;
}

export function formatElevation(
  meters: number,
  units: "metric" | "imperial",
): string {
  if (units === "imperial") {
    return `${Math.round(meters * 3.28084)} ft`;
  }
  return `${Math.round(meters)} m`;
}

export {
  formatDistance,
  formatDuration,
  formatPace,
  paceSecondsPerKm,
  speedKmh,
};
