import type { RoutePoint } from "@/lib/types/posts";

/** Prefer preview polyline; fall back to full route. */
export function extractShareRoutePoints(
  post: { routePreview?: RoutePoint[]; route?: RoutePoint[] },
): { lat: number; lng: number }[] {
  const raw = post.routePreview?.length
    ? post.routePreview
    : post.route?.length
      ? post.route
      : [];
  const cleaned = raw
    .filter(
      (p) =>
        p &&
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        Math.abs(p.lat) <= 90 &&
        Math.abs(p.lng) <= 180,
    )
    .map((p) => ({ lat: p.lat, lng: p.lng }));
  return cleaned.length >= 2 ? cleaned : [];
}

/**
 * Project lat/lng into a canvas box as an abstract silhouette.
 * No tiles, labels, or street names — geometry only.
 */
export function projectRouteToBox(
  points: { lat: number; lng: number }[],
  box: { x: number; y: number; w: number; h: number },
  pad = 0.12,
): { x: number; y: number }[] {
  if (points.length < 2) return [];

  // Downsample long polylines for a clean silhouette.
  const maxPts = 120;
  const step = Math.max(1, Math.ceil(points.length / maxPts));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  const lats = sampled.map((p) => p.lat);
  const lngs = sampled.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 1e-6);
  const lngSpan = Math.max(maxLng - minLng, 1e-6);
  // Keep geographic aspect roughly intact inside the box.
  const geoAspect = lngSpan / latSpan;
  const boxAspect = box.w / box.h;
  let drawW = box.w * (1 - pad * 2);
  let drawH = box.h * (1 - pad * 2);
  if (geoAspect > boxAspect) {
    drawH = drawW / geoAspect;
  } else {
    drawW = drawH * geoAspect;
  }
  const ox = box.x + (box.w - drawW) / 2;
  const oy = box.y + (box.h - drawH) / 2;

  return sampled.map((p) => ({
    x: ox + ((p.lng - minLng) / lngSpan) * drawW,
    // Invert lat so north is up
    y: oy + ((maxLat - p.lat) / latSpan) * drawH,
  }));
}
