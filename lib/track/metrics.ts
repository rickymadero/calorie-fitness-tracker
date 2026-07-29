/** Geographic distance and workout metric helpers (canonical SI units). */

const EARTH_RADIUS_M = 6_371_000;

export type LatLng = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  recordedAt?: number;
};

/** Haversine distance in meters between two coordinates. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total path distance along a coordinate sequence (not start→finish). */
export function pathDistanceMeters(points: LatLng[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1]!, points[i]!);
  }
  return total;
}

export function elevationGainMeters(points: LatLng[]): number {
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!.altitude;
    const cur = points[i]!.altitude;
    if (prev == null || cur == null) continue;
    const d = cur - prev;
    if (d > 0.5) gain += d; // ignore tiny noise
  }
  return gain;
}

/**
 * Pace as seconds per kilometer.
 * Returns null when distance or duration is insufficient / impossible.
 */
export function paceSecondsPerKm(
  distanceMeters: number,
  durationSeconds: number,
): number | null {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(durationSeconds) ||
    distanceMeters < 5 ||
    durationSeconds <= 0
  ) {
    return null;
  }
  const pace = durationSeconds / (distanceMeters / 1000);
  if (!Number.isFinite(pace) || pace <= 0 || pace > 3600) return null;
  return pace;
}

/** Speed in km/h. */
export function speedKmh(
  distanceMeters: number,
  durationSeconds: number,
): number | null {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    distanceMeters < 0
  ) {
    return null;
  }
  const kmh = (distanceMeters / 1000) / (durationSeconds / 3600);
  if (!Number.isFinite(kmh) || kmh < 0 || kmh > 120) return null;
  return kmh;
}

export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm == null || !Number.isFinite(secondsPerKm)) return "--";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function formatDistance(
  meters: number,
  units: "metric" | "imperial",
): string {
  if (!Number.isFinite(meters) || meters < 0) return "--";
  if (units === "imperial") {
    const miles = meters / 1609.344;
    return miles < 0.1
      ? `${Math.round(meters * 3.28084)} ft`
      : `${miles.toFixed(2)} mi`;
  }
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export type Split = {
  splitNumber: number;
  distanceMeters: number;
  elapsedSeconds: number;
  movingSeconds: number;
  avgPaceSecondsPerKm: number | null;
  avgSpeedKmh: number | null;
  elevationChangeMeters: number;
};

/**
 * Build automatic splits every `splitDistanceMeters` (1000 or 1609.344).
 */
export function buildDistanceSplits(
  points: LatLng[],
  startedAtMs: number,
  splitDistanceMeters: number,
): Split[] {
  if (points.length < 2 || splitDistanceMeters <= 0) return [];
  const splits: Split[] = [];
  let accum = 0;
  let splitStartIdx = 0;
  let splitStartDist = 0;
  let nextBoundary = splitDistanceMeters;

  for (let i = 1; i < points.length; i++) {
    const seg = haversineMeters(points[i - 1]!, points[i]!);
    accum += seg;
    while (accum >= nextBoundary) {
      const end = points[i]!;
      const start = points[splitStartIdx]!;
      const elapsed =
        ((end.recordedAt ?? startedAtMs) - (start.recordedAt ?? startedAtMs)) /
        1000;
      const dist = nextBoundary - splitStartDist;
      const moving = Math.max(0, elapsed);
      const pace = paceSecondsPerKm(dist, moving);
      const elev =
        (end.altitude ?? 0) - (start.altitude ?? end.altitude ?? 0);
      splits.push({
        splitNumber: splits.length + 1,
        distanceMeters: dist,
        elapsedSeconds: moving,
        movingSeconds: moving,
        avgPaceSecondsPerKm: pace,
        avgSpeedKmh: speedKmh(dist, moving),
        elevationChangeMeters: Number.isFinite(elev) ? elev : 0,
      });
      splitStartIdx = i;
      splitStartDist = nextBoundary;
      nextBoundary += splitDistanceMeters;
    }
  }
  return splits;
}

/** Rough calorie estimate from MET × weight × hours (fallback when no HR). */
export function estimateCalories(opts: {
  activityId: string;
  durationSeconds: number;
  distanceMeters: number;
  weightKg?: number;
}): number {
  const hours = Math.max(0, opts.durationSeconds) / 3600;
  const kg = opts.weightKg ?? 70;
  const mets: Record<string, number> = {
    running: 9.8,
    walking: 3.5,
    cycling: 7.5,
    hiking: 6,
    treadmill: 8,
    indoor_cycling: 7,
    swimming: 8,
    strength: 5,
    hyrox: 9,
    yoga: 2.5,
    hiit: 8,
    functional: 6,
    sports: 6,
    other: 4,
  };
  const met = mets[opts.activityId] ?? 4;
  return Math.round(met * kg * hours);
}
