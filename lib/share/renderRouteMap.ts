import type { RoutePoint } from "@/lib/types/posts";

const TILE = 256;
const MAX_ZOOM = 16;
const MIN_ZOOM = 11;

/**
 * Renders the same Carto street map used in feed posts onto a canvas.
 * Dark → Dark Matter tiles; light → Voyager (matches RouteMapPreview).
 */
export async function drawRealStreetMap(
  ctx: CanvasRenderingContext2D,
  points: RoutePoint[],
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { hideStart?: boolean; hideEnd?: boolean; theme?: "light" | "dark" },
): Promise<void> {
  if (points.length < 2) return;

  const isDark = opts.theme === "dark";
  const routeColor = isDark ? "#22d484" : "#1dbf73";
  const tilePath = isDark ? "dark_all" : "rastertiles/voyager";

  const pad = 36;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  // Expand tiny routes so tiles still show neighborhood context
  const latPad = Math.max((maxLat - minLat) * 0.18, 0.0012);
  const lngPad = Math.max((maxLng - minLng) * 0.18, 0.0012);
  minLat -= latPad;
  maxLat += latPad;
  minLng -= lngPad;
  maxLng += lngPad;

  const zoom = chooseZoom(minLat, maxLat, minLng, maxLng, w - pad * 2, h - pad * 2);
  const center = project((minLat + maxLat) / 2, (minLng + maxLng) / 2, zoom);
  const topLeft = { x: center.x - w / 2, y: center.y - h / 2 };

  ctx.save();
  roundRectPath(ctx, x, y, w, h, 24);
  ctx.clip();

  // Base while tiles load / fill gaps
  ctx.fillStyle = isDark ? "#0b0d10" : "#e9e4da";
  ctx.fillRect(x, y, w, h);

  const minTX = Math.floor(topLeft.x / TILE);
  const maxTX = Math.floor((topLeft.x + w) / TILE);
  const minTY = Math.floor(topLeft.y / TILE);
  const maxTY = Math.floor((topLeft.y + h) / TILE);
  const n = Math.pow(2, zoom);

  const jobs: Promise<void>[] = [];
  let sub = 0;
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (tx < 0 || ty < 0 || tx >= n || ty >= n) continue;
      const s = "abcd"[sub++ % 4];
      const url = `https://${s}.basemaps.cartocdn.com/${tilePath}/${zoom}/${tx}/${ty}@2x.png`;
      const dx = x + tx * TILE - topLeft.x;
      const dy = y + ty * TILE - topLeft.y;
      jobs.push(
        loadTile(url).then((img) => {
          if (!img) return;
          ctx.drawImage(img, dx, dy, TILE, TILE);
        }),
      );
    }
  }
  await Promise.all(jobs);

  const screen = points.map((p) => {
    const world = project(p.lat, p.lng, zoom);
    return {
      x: x + world.x - topLeft.x,
      y: y + world.y - topLeft.y,
    };
  });

  // Route glow + stroke (matches feed RouteMapPreview)
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = isDark ? "rgba(34, 212, 132, 0.4)" : "rgba(29, 191, 115, 0.35)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  screen.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  ctx.strokeStyle = routeColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  screen.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();

  if (!opts.hideStart) {
    ctx.beginPath();
    ctx.fillStyle = routeColor;
    ctx.arc(screen[0].x, screen[0].y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  if (!opts.hideEnd) {
    const last = screen[screen.length - 1];
    ctx.beginPath();
    ctx.fillStyle = "#0a0a0a";
    ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = routeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Soft bottom fade like feed cards
  const fade = ctx.createLinearGradient(x, y + h - 48, x, y + h);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)");
  ctx.fillStyle = fade;
  ctx.fillRect(x, y + h - 48, w, 48);

  // Attribution (required for OSM / CARTO)
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  ctx.font = "500 14px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("© OSM · CARTO", x + w - 12, y + h - 12);
  ctx.textAlign = "left";

  ctx.restore();

  roundRectPath(ctx, x, y, w, h, 24);
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** Web Mercator world pixel at a zoom level (256px tiles). */
function project(lat: number, lng: number, zoom: number) {
  const scale = TILE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const clamped = Math.max(Math.min(lat, 85.05112878), -85.05112878);
  const sin = Math.sin((clamped * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function chooseZoom(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  mapW: number,
  mapH: number,
) {
  for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
    const nw = project(maxLat, minLng, z);
    const se = project(minLat, maxLng, z);
    if (Math.abs(se.x - nw.x) <= mapW && Math.abs(se.y - nw.y) <= mapH) {
      return z;
    }
  }
  return MIN_ZOOM;
}

function loadTile(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
