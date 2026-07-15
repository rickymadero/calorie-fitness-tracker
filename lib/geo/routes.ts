import type { RoutePoint } from "@/lib/types/posts";

/** Generate a smooth-ish outdoor loop around a center for seed/demo routes. */
export function generateDemoRoute(
  centerLat: number,
  centerLng: number,
  points = 64,
  radiusDeg = 0.018,
): RoutePoint[] {
  const route: RoutePoint[] = [];
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    // Slightly oval path so it doesn’t look like a perfect circle
    const r = radiusDeg * (0.85 + 0.15 * Math.sin(a * 3));
    const lat = centerLat + Math.sin(a) * r * 0.75;
    const lng = centerLng + Math.cos(a) * r;
    const elev = 180 + Math.sin(a * 2) * 25 + (i / points) * 12;
    route.push({
      lat,
      lng,
      elev: Math.round(elev),
      t: Math.round((i / points) * 28 * 60),
    });
  }
  return route;
}

/** Decimate route for feed card previews. */
export function simplifyRoute(points: RoutePoint[], maxPoints = 48): RoutePoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const out: RoutePoint[] = [];
  for (let i = 0; i < points.length; i += step) out.push(points[i]);
  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

export function formatPace(pace?: number) {
  if (pace == null || !Number.isFinite(pace)) return null;
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}/km`;
}

export function formatDuration(min?: number) {
  if (min == null) return null;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}:00`;
  return `${h}:${m.toString().padStart(2, "0")}:00`;
}

export function formatDurationClock(min?: number) {
  if (min == null) return "—";
  const totalSec = Math.round(min * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
