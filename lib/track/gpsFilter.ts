/** GPS sample filtering for outdoor tracking. */

import { haversineMeters, type LatLng } from "./metrics";

export type GpsSample = LatLng & {
  accuracyMeters: number | null;
  speedMps: number | null;
  recordedAt: number;
};

const MAX_ACCURACY_M = 45;
const MAX_SPEED_MPS = 25; // ~90 km/h — above this is a jump for run/walk/hike
const MAX_CYCLE_SPEED_MPS = 35;
const MIN_MOVE_MPS = 0.4;

export function isAcceptableAccuracy(
  accuracyMeters: number | null | undefined,
): boolean {
  if (accuracyMeters == null || !Number.isFinite(accuracyMeters)) return false;
  return accuracyMeters > 0 && accuracyMeters <= MAX_ACCURACY_M;
}

/**
 * Returns true if `next` should be appended after `prev`.
 * Rejects poor accuracy, impossible jumps, and near-stationary noise when paused filtering applies.
 */
export function shouldAcceptGpsPoint(
  prev: GpsSample | null,
  next: GpsSample,
  opts: { activityUsesSpeed?: boolean; paused?: boolean },
): boolean {
  if (opts.paused) return false;
  if (!isAcceptableAccuracy(next.accuracyMeters)) return false;
  if (
    !Number.isFinite(next.latitude) ||
    !Number.isFinite(next.longitude) ||
    Math.abs(next.latitude) > 90 ||
    Math.abs(next.longitude) > 180
  ) {
    return false;
  }
  if (!prev) return true;

  const dt = (next.recordedAt - prev.recordedAt) / 1000;
  if (dt <= 0) return false;
  if (dt > 120) {
    // Long gap after signal loss — accept as resume anchor if accurate
    return true;
  }

  const dist = haversineMeters(prev, next);
  const speed = dist / dt;
  const maxSpeed = opts.activityUsesSpeed
    ? MAX_CYCLE_SPEED_MPS
    : MAX_SPEED_MPS;
  if (speed > maxSpeed) return false;

  // Ignore tiny jitter when barely moving
  if (dist < 1.5 && speed < MIN_MOVE_MPS) return false;

  return true;
}

export function filterGpsTrail(
  samples: GpsSample[],
  opts: { activityUsesSpeed?: boolean } = {},
): GpsSample[] {
  const out: GpsSample[] = [];
  for (const s of samples) {
    const prev = out.length ? out[out.length - 1]! : null;
    if (shouldAcceptGpsPoint(prev, s, { ...opts, paused: false })) {
      out.push(s);
    }
  }
  return out;
}
