import type { GpsSample } from "@/lib/track/gpsFilter";

const PRIVACY_RADIUS_M = 180;

function offsetPoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceM: number,
): { latitude: number; longitude: number } {
  const R = 6_371_000;
  const δ = distanceM / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return {
    latitude: (φ2 * 180) / Math.PI,
    longitude: (λ2 * 180) / Math.PI,
  };
}

/**
 * Hide start/end by dropping points near endpoints and shifting the visible ends.
 * Never exposes raw home coordinates in the UI — callers must not render lat/lng text.
 */
export function trimRoutePrivacy(
  points: GpsSample[],
  mode: "show" | "hide_route" | "hide_start_end" | "private",
): GpsSample[] {
  if (mode === "hide_route" || mode === "private") return [];
  if (mode === "show" || points.length < 4) return points;

  // hide_start_end: drop points within privacy radius of start and end
  const start = points[0]!;
  const end = points[points.length - 1]!;
  const kept = points.filter((p, i) => {
    if (i === 0 || i === points.length - 1) return false;
    const dStart = approxMeters(start, p);
    const dEnd = approxMeters(end, p);
    return dStart > PRIVACY_RADIUS_M && dEnd > PRIVACY_RADIUS_M;
  });
  if (kept.length < 2) return kept;

  // Soft-shift first/last visible points away from true endpoints
  const first = kept[0]!;
  const last = kept[kept.length - 1]!;
  const shiftedFirst = {
    ...first,
    ...offsetPoint(first.latitude, first.longitude, 45, 40),
  };
  const shiftedLast = {
    ...last,
    ...offsetPoint(last.latitude, last.longitude, 225, 40),
  };
  return [shiftedFirst, ...kept.slice(1, -1), shiftedLast];
}

function approxMeters(a: GpsSample, b: GpsSample): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.min(1, Math.sqrt(h)));
}
