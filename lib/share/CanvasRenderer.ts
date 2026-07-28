import { getExportDimensions } from "@/lib/share/ExportDimensions";
import { formatShareLocationLabel } from "@/lib/share/formatShareLocation";
import { formatShareMetricDisplay } from "@/lib/share/formatShareMetric";
import {
  drawEvolveWordmark,
  evolveWordmarkBounds,
} from "@/lib/share/LogoRenderer";
import { projectRouteToBox } from "@/lib/share/routeContext";
import type {
  AtmosphereTheme,
  ShareExportFormat,
  ShareRenderOptions,
  SignalKind,
  WorkoutShareModel,
} from "@/lib/share/WorkoutShareModel";

type SignalBox = { x: number; y: number; w: number; h: number };

/** Apply alpha to #rrggbb or rgb()/rgba() accent colors. */
function withAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex) {
    const n = parseInt(hex[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color);
  if (rgb) {
    return `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${alpha})`;
  }
  return color;
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  atmosphere: AtmosphereTheme,
  signalGlowY = h * 0.26,
) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, atmosphere.background[0]);
  g.addColorStop(0.35, atmosphere.background[1]);
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Strong cinematic bloom behind signal + logo (photo energy, still controlled).
  const wash = ctx.createRadialGradient(
    w * 0.5,
    signalGlowY,
    10,
    w * 0.5,
    signalGlowY + 40,
    w * 0.85,
  );
  wash.addColorStop(0, withAlpha(atmosphere.primaryAccent, 0.55));
  wash.addColorStop(0.35, atmosphere.glow);
  wash.addColorStop(0.7, withAlpha(atmosphere.primaryAccent, 0.08));
  wash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Dark map layer from real GPS — street grid + highlighted route.
 * Looks like the cinematic reference, without tiles or labels.
 */
function drawRouteContext(
  ctx: CanvasRenderingContext2D,
  points: { lat: number; lng: number }[],
  box: SignalBox,
  accent: string,
) {
  const projected = projectRouteToBox(points, box, 0.08);
  if (projected.length < 2) return;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of projected) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  // Expand footprint toward full signal box so the map fills the art plane.
  const padX = box.w * 0.06;
  const padY = box.h * 0.08;
  minX = Math.min(minX, box.x + padX);
  maxX = Math.max(maxX, box.x + box.w - padX);
  minY = Math.min(minY, box.y + padY);
  maxY = Math.max(maxY, box.y + box.h - padY);
  const bw = Math.max(80, maxX - minX);
  const bh = Math.max(80, maxY - minY);

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowBlur = 0;

  // Road network — cooler blue-grey like the photo map
  const road = "rgba(120, 160, 190, 1)";
  ctx.strokeStyle = road;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1.4;
  const cols = 11;
  const rows = 9;
  for (let c = 0; c <= cols; c++) {
    const x = minX + (c / cols) * bw;
    const j = projected[Math.min(projected.length - 1, Math.floor((c / cols) * (projected.length - 1)))]!;
    ctx.beginPath();
    ctx.moveTo(x, minY);
    ctx.quadraticCurveTo(x + (j.x - x) * 0.08, (minY + maxY) / 2, x + (j.x - x) * 0.03, maxY);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    const y = minY + (r / rows) * bh;
    const j = projected[Math.min(projected.length - 1, Math.floor((r / rows) * (projected.length - 1)))]!;
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.quadraticCurveTo((minX + maxX) / 2, y + (j.y - y) * 0.08, maxX, y + (j.y - y) * 0.03);
    ctx.stroke();
  }

  // Secondary alleys from route samples
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 1;
  const step = Math.max(2, Math.floor(projected.length / 22));
  for (let i = step; i < projected.length - 1; i += step) {
    const a = projected[i - 1]!;
    const b = projected[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * 28;
    const ny = (dx / len) * 28;
    ctx.beginPath();
    ctx.moveTo(b.x - nx, b.y - ny);
    ctx.lineTo(b.x + nx, b.y + ny);
    ctx.stroke();
  }

  // Athlete route highlight — brighter green/cyan path
  ctx.beginPath();
  ctx.moveTo(projected[0]!.x, projected[0]!.y);
  for (let i = 1; i < projected.length; i++) {
    ctx.lineTo(projected[i]!.x, projected[i]!.y);
  }
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 2.25;
  ctx.stroke();

  ctx.restore();
}

function strokeDashedPath(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  width: number,
  alpha: number,
  dash: number[],
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.setLineDash(dash);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowBlur = 0;
  ctx.stroke(path);
  ctx.setLineDash([]);
  ctx.restore();
}

function findPeakIndices(points: number[], maxPeaks = 5): number[] {
  if (points.length < 5) return [];
  const peaks: { i: number; v: number }[] = [];
  for (let i = 2; i < points.length - 2; i++) {
    const v = points[i]!;
    if (
      v >= 58 &&
      v >= points[i - 1]! &&
      v >= points[i + 1]! &&
      v > points[i - 2]! &&
      v > points[i + 2]!
    ) {
      peaks.push({ i, v });
    }
  }
  peaks.sort((a, b) => b.v - a.v);
  return peaks.slice(0, maxPeaks).map((p) => p.i);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Smooth flowing pulse — continuous undulation, not a twin-peak "M".
 * Blends real signal data with a soft asymmetric sine so it reads like
 * a premium neon waveform under the EVOLVE wordmark.
 */
function shapePulseSeries(points: number[]): number[] {
  if (points.length === 0) return points;
  const src =
    points.length < 3
      ? points
      : points.map((p, i) => {
          const a = points[Math.max(0, i - 1)]!;
          const c = points[Math.min(points.length - 1, i + 1)]!;
          return (a + p * 2 + c) / 4;
        });

  const n = Math.max(56, src.length * 4);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const pos = t * (src.length - 1);
    const i0 = Math.floor(pos);
    const i1 = Math.min(src.length - 1, i0 + 1);
    const f = pos - i0;
    const data = src[i0]! * (1 - f) + src[i1]! * f;

    // ~1.55 cycles + light harmonic — peaks are uneven, never a hard M.
    const flow =
      0.52 +
      0.3 * Math.sin(t * Math.PI * 1.55 + 0.4) +
      0.11 * Math.sin(t * Math.PI * 3.05 + 1.2) +
      0.06 * Math.sin(t * Math.PI * 0.55 - 0.2);
    const blended = data * 0.38 + flow * 100 * 0.62;
    out.push(Math.max(16, Math.min(94, blended)));
  }
  return out;
}

function buildWavePath(
  points: number[],
  x: number,
  y: number,
  w: number,
  h: number,
  /** Softly keep stroke under the wordmark if it creeps up. */
  clearBand?: { top: number; bottom: number; left: number; right: number },
  /** Vertical amplitude scale. */
  amplitude = 0.52,
): Path2D {
  const path = new Path2D();
  if (points.length === 0) return path;
  const n = points.length;
  const step = w / Math.max(1, n - 1);
  const base = y + h * (1 - amplitude * 0.12);
  const ampH = h * amplitude;
  const at = (i: number) => {
    const px = x + i * step;
    let py = base - (points[i]! / 100) * ampH;
    if (
      clearBand &&
      px >= clearBand.left &&
      px <= clearBand.right &&
      py < clearBand.bottom
    ) {
      // Soft blend under logo — avoid a flat M-notch.
      const floor = clearBand.bottom + 10;
      const mix = Math.min(1, (floor - py) / Math.max(24, ampH * 0.35));
      py = py + (floor - py) * (0.55 + mix * 0.35);
    }
    return { px, py };
  };
  const first = at(0);
  path.moveTo(first.px, first.py);
  for (let i = 1; i < n; i++) {
    const prev = at(i - 1);
    const cur = at(i);
    const cpx = (prev.px + cur.px) / 2;
    path.quadraticCurveTo(prev.px, prev.py, cpx, (prev.py + cur.py) / 2);
    if (i === n - 1) path.lineTo(cur.px, cur.py);
  }
  return path;
}

function drawPulseWave(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  atmosphere: AtmosphereTheme,
  clearBand?: { top: number; bottom: number; left: number; right: number },
) {
  const shaped = shapePulseSeries(points);
  // Sit the wave under the logo so we don't need an M-shaped valley.
  const logoFloor = clearBand ? clearBand.bottom + 8 : box.y + box.h * 0.34;
  const waveTop = Math.max(box.y + box.h * 0.34, logoFloor);
  const waveH = Math.max(box.h * 0.48, box.y + box.h - waveTop - 8);
  const wx = box.x + box.w * 0.01;
  const ww = box.w * 0.98;
  const amp = 0.78;

  const core = "#ffffff";
  const trail = atmosphere.primaryAccent;
  const cyan =
    atmosphere.secondaryAccent.startsWith("#") &&
    atmosphere.secondaryAccent.toLowerCase() !== "#9ca3af"
      ? atmosphere.secondaryAccent
      : "#67e8f9";

  const sampleAt = (
    pts: number[],
    i: number,
    top: number,
    height: number,
    amplitude: number,
  ) => {
    const n = pts.length;
    const step = ww / Math.max(1, n - 1);
    const base = top + height * (1 - amplitude * 0.12);
    const ampH = height * amplitude;
    const px = wx + i * step;
    let py = base - (pts[i]! / 100) * ampH;
    if (
      clearBand &&
      px >= clearBand.left &&
      px <= clearBand.right &&
      py < clearBand.bottom
    ) {
      const floor = clearBand.bottom + 10;
      const mix = Math.min(1, (floor - py) / Math.max(24, ampH * 0.35));
      py = py + (floor - py) * (0.55 + mix * 0.35);
    }
    return { px, py };
  };

  const primary = buildWavePath(shaped, wx, waveTop, ww, waveH, clearBand, amp);
  const trailA = buildWavePath(
    shaped.map((p) => Math.min(100, p * 0.9 + 6)),
    wx,
    waveTop + 12,
    ww,
    waveH - 14,
    clearBand,
    0.7,
  );
  const trailB = buildWavePath(
    shaped.map((p) => Math.min(100, p * 0.76 + 14)),
    wx,
    waveTop + 22,
    ww,
    waveH - 24,
    clearBand,
    0.62,
  );
  const trailC = buildWavePath(
    shaped.map((p) => Math.min(100, p * 0.62 + 20)),
    wx,
    waveTop + 32,
    ww,
    waveH - 34,
    clearBand,
    0.54,
  );

  // Outer neon bloom (green)
  ctx.save();
  ctx.strokeStyle = trail;
  ctx.lineWidth = 34;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = trail;
  ctx.shadowBlur = 56;
  ctx.globalAlpha = 0.28;
  ctx.stroke(primary);
  ctx.restore();

  // Cyan depth glow
  ctx.save();
  ctx.strokeStyle = cyan;
  ctx.lineWidth = 18;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = cyan;
  ctx.shadowBlur = 36;
  ctx.globalAlpha = 0.38;
  ctx.stroke(primary);
  ctx.restore();

  strokeDashedPath(ctx, trailC, trail, 1.4, 0.26, [3, 11]);
  strokeDashedPath(ctx, trailB, cyan, 1.8, 0.32, [5, 10]);
  strokeDashedPath(ctx, trailA, trail, 2.4, 0.52, [10, 7]);

  ctx.save();
  ctx.strokeStyle = trail;
  ctx.lineWidth = 11;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = trail;
  ctx.shadowBlur = 22;
  ctx.globalAlpha = 0.7;
  ctx.stroke(primary);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = core;
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = cyan;
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 1;
  ctx.stroke(primary);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.25;
  ctx.globalAlpha = 0.95;
  ctx.shadowBlur = 0;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(primary);
  ctx.restore();

  const n = shaped.length;
  ctx.save();
  for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 36))) {
    const { px, py } = sampleAt(shaped, i, waveTop, waveH, amp);
    const t = i / Math.max(1, n - 1);
    const size = 1.1 + (shaped[i]! / 100) * 2.1;
    ctx.fillStyle = i % 3 === 0 ? cyan : trail;
    ctx.shadowColor = ctx.fillStyle;
    ctx.globalAlpha = 0.2 + (shaped[i]! / 100) * 0.4;
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.arc(px, py - 4 - t * 2, size, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const i of findPeakIndices(shaped, 4)) {
    const { px, py } = sampleAt(shaped, i, waveTop, waveH, amp);
    ctx.fillStyle = trail;
    ctx.shadowColor = trail;
    ctx.globalAlpha = 0.9;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(px, py, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawVelocityRings(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  color: string,
  clearBand?: { top: number; bottom: number; left: number; right: number },
) {
  const cx = box.x + box.w / 2;
  // Keep original ring scale — only shift the cluster down below the logo.
  const maxR = Math.min(box.w, box.h) * 0.38;
  const logoClear = clearBand
    ? clearBand.bottom + 36
    : box.y + box.h * 0.36;
  // Place center so the outermost ring starts below the wordmark.
  const cy = Math.min(logoClear + maxR, box.y + box.h * 0.78);
  const rings = Math.min(6, Math.max(3, points.length));
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  for (let i = 0; i < rings; i++) {
    const intensity = (points[i % points.length]! / 100) * 0.7 + 0.3;
    const r = maxR * ((i + 1) / rings);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.25 + intensity * 0.55;
    ctx.lineWidth = 3 + intensity * 9;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLapWaves(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  color: string,
  clearBand?: { top: number; bottom: number; left: number; right: number },
) {
  const layers = Math.min(10, Math.max(3, points.length));
  const gap = box.h / (layers + 1);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  for (let i = 0; i < layers; i++) {
    const amp = ((points[i % points.length]! / 100) * 0.32 + 0.12) * gap;
    let y = box.y + gap * (i + 1);
    if (clearBand && y > clearBand.top && y < clearBand.bottom) {
      y = clearBand.bottom + 10 + (i % 3) * 6;
    }
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.32 + (i / layers) * 0.4;
    ctx.lineWidth = 3;
    const steps = 36;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = box.x + t * box.w;
      let py =
        y + Math.sin(t * Math.PI * 2 * (1.5 + (i % 3) * 0.4) + i) * amp;
      if (
        clearBand &&
        px >= clearBand.left &&
        px <= clearBand.right &&
        py < clearBand.bottom
      ) {
        py = clearBand.bottom + 6;
      }
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawForceBlocks(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  color: string,
) {
  // Leave upper band clear for the wordmark.
  const topPad = box.h * 0.42;
  const n = Math.max(1, points.length);
  const gap = 14;
  const barW = (box.w - gap * (n - 1)) / n;
  const drawH = box.h - topPad - 12;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  for (let i = 0; i < n; i++) {
    const h = Math.max(24, (points[i]! / 100) * drawH);
    const x = box.x + i * (barW + gap);
    const y = box.y + box.h - h;
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = g;
    roundRect(ctx, x, y, barW, h, 14);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawStationGrid(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  color: string,
  secondary: string,
) {
  const topPad = box.h * 0.42;
  const n = 8;
  const gap = 12;
  const cellW = (box.w - gap * (n - 1)) / n;
  const drawH = box.h - topPad - 12;
  for (let i = 0; i < n; i++) {
    const v = points[i % points.length] ?? 50;
    const h = Math.max(28, (v / 100) * drawH);
    const x = box.x + i * (cellW + gap);
    const y = box.y + box.h - h;
    ctx.fillStyle = i % 2 === 0 ? color : secondary;
    ctx.globalAlpha = 0.55 + (v / 100) * 0.4;
    roundRect(ctx, x, y, cellW, h, 12);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTopoContours(
  ctx: CanvasRenderingContext2D,
  points: number[],
  box: SignalBox,
  color: string,
  clearBand?: { top: number; bottom: number; left: number; right: number },
) {
  const bands = 7;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  for (let b = 0; b < bands; b++) {
    const level = 15 + b * 12;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.22 + b * 0.08;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < points.length; i++) {
      const t = i / Math.max(1, points.length - 1);
      const px = box.x + t * box.w;
      let py =
        box.y +
        box.h -
        (points[i]! / 100) * box.h * 0.85 +
        (b - bands / 2) * 10 +
        level * 0.15;
      if (
        clearBand &&
        px >= clearBand.left &&
        px <= clearBand.right &&
        py < clearBand.bottom
      ) {
        py = clearBand.bottom + 4 + b * 3;
      }
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawSignal(
  ctx: CanvasRenderingContext2D,
  kind: SignalKind,
  points: number[],
  box: SignalBox,
  atmosphere: AtmosphereTheme,
  clearBand?: { top: number; bottom: number; left: number; right: number },
) {
  const series =
    points.length > 0 ? points : [50, 52, 48, 55, 50, 53, 49, 51];
  switch (kind) {
    case "pulse_wave":
      drawPulseWave(ctx, series, box, atmosphere, clearBand);
      break;
    case "velocity_rings":
      drawVelocityRings(ctx, series, box, atmosphere.signalColor, clearBand);
      break;
    case "lap_waves":
      drawLapWaves(ctx, series, box, atmosphere.signalColor, clearBand);
      break;
    case "force_blocks":
      drawForceBlocks(ctx, series, box, atmosphere.signalColor);
      break;
    case "station_grid":
      drawStationGrid(
        ctx,
        series,
        box,
        atmosphere.signalColor,
        atmosphere.secondaryAccent,
      );
      break;
    case "topo_contours":
      drawTopoContours(ctx, series, box, atmosphere.signalColor, clearBand);
      break;
    default:
      drawPulseWave(ctx, series, box, atmosphere, clearBand);
  }
}

/** Hero glow orb — cinematic bottom-right energy. */
function drawInfoZoneGlow(
  ctx: CanvasRenderingContext2D,
  atmosphere: AtmosphereTheme,
  w: number,
  midY: number,
  cx = w * 0.72,
) {
  const g = ctx.createRadialGradient(cx, midY, 20, cx, midY, w * 0.48);
  g.addColorStop(0, withAlpha(atmosphere.primaryAccent, 0.22));
  g.addColorStop(0.4, withAlpha(atmosphere.primaryAccent, 0.07));
  g.addColorStop(1, withAlpha(atmosphere.primaryAccent, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, midY - w * 0.4, w, w * 0.8);
}

/** Hero — massive bottom-right number, green unit. */
function drawHero(
  ctx: CanvasRenderingContext2D,
  model: WorkoutShareModel,
  atmosphere: AtmosphereTheme,
  cx: number,
  baselineY: number,
) {
  const valueSize = 132;
  const unitSize = 38;
  const unitGap = 44;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = atmosphere.textPrimary;
  ctx.font = `800 ${valueSize}px system-ui, -apple-system, sans-serif`;
  ctx.shadowColor = withAlpha(atmosphere.primaryAccent, 0.7);
  ctx.shadowBlur = 42;
  ctx.fillText(model.hero.value, cx, baselineY);
  ctx.shadowBlur = 0;

  if (model.hero.unit) {
    ctx.fillStyle = atmosphere.primaryAccent;
    ctx.font = `800 ${unitSize}px system-ui, sans-serif`;
    ctx.shadowColor = withAlpha(atmosphere.primaryAccent, 0.5);
    ctx.shadowBlur = 14;
    ctx.fillText(model.hero.unit.toUpperCase(), cx, baselineY + unitGap);
    ctx.shadowBlur = 0;
  }
}

/**
 * Supporting metrics — single left column, max four (Stories hierarchy).
 */
function drawSupportingStack(
  ctx: CanvasRenderingContext2D,
  model: WorkoutShareModel,
  atmosphere: AtmosphereTheme,
  topY: number,
  maxBottom: number,
  margin: number,
): { height: number; centerY: number } {
  const items = model.supporting.slice(0, 4);
  if (items.length === 0) return { height: 0, centerY: topY };

  const rows = items.length;
  const available = Math.max(100, maxBottom - topY);

  let labelSize = 13;
  let valueSize = 32;
  let labelToValue = 26;
  let rowGap = 34;
  let rowH = labelToValue + valueSize * 0.28 + rowGap;

  const needed = rows * rowH - rowGap;
  if (needed > available) {
    const scale = available / needed;
    labelSize = Math.max(11, Math.round(labelSize * scale));
    valueSize = Math.max(20, Math.round(valueSize * scale));
    labelToValue = Math.max(18, Math.round(labelToValue * scale));
    rowGap = Math.max(16, Math.round(rowGap * scale));
    rowH = labelToValue + valueSize * 0.28 + rowGap;
  }

  items.forEach((m, idx) => {
    const x = margin;
    const y = topY + idx * rowH;

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = `600 ${labelSize}px system-ui, sans-serif`;
    const label = m.label.toUpperCase();
    ctx.fillText(label, x, y);

    if (m.key === "best_pace") {
      const labelW = ctx.measureText(label).width;
      const pillH = Math.max(15, labelSize + 3);
      const pillX = x + labelW + 10;
      const pillY = y - labelSize * 0.78;
      ctx.font = `800 ${Math.max(9, labelSize - 1)}px system-ui, sans-serif`;
      const pillTw = ctx.measureText("BEST").width;
      const pillW = pillTw + 14;
      ctx.save();
      ctx.shadowColor = atmosphere.primaryAccent;
      ctx.shadowBlur = 12;
      ctx.fillStyle = atmosphere.primaryAccent;
      roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#04140e";
      ctx.textBaseline = "middle";
      ctx.fillText("BEST", pillX + 7, pillY + pillH / 2 + 0.5);
      ctx.textBaseline = "alphabetic";
    }

    ctx.fillStyle = atmosphere.textPrimary;
    ctx.font = `700 ${valueSize}px system-ui, sans-serif`;
    ctx.fillText(formatShareMetricDisplay(m), x, y + labelToValue);
  });

  const height = rows * rowH - rowGap;
  return { height, centerY: topY + height / 2 };
}

function truncateToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

/**
 * Location row: ⌖ CITY, REGION — muted, tracked, no glow/box/separator.
 */
function drawLocationLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  baselineY: number,
  maxTextWidth: number,
): void {
  const fontSize = 17;
  const color = "rgba(255,255,255,0.58)";
  const tracking = fontSize * 0.08;
  const marker = "⌖";
  const gap = 8;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.font = `500 ${fontSize}px system-ui, sans-serif`;

  const markerW = ctx.measureText(marker).width;
  const textBudget = Math.max(40, maxTextWidth - markerW - gap);
  let display = label;
  let measured = 0;
  const chars = [...label];
  for (let i = 0; i < chars.length; i++) {
    measured += ctx.measureText(chars[i]!).width + (i ? tracking : 0);
  }
  if (measured > textBudget) display = truncateToWidth(ctx, label, textBudget);

  ctx.fillText(marker, x, baselineY);
  let textX = x + markerW + gap;
  for (const ch of display) {
    ctx.fillText(ch, textX, baselineY);
    textX += ctx.measureText(ch).width + tracking;
  }
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  atmosphere: AtmosphereTheme,
  width: number,
  height: number,
  margin: number,
) {
  const y = height - margin - 28;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin + 120, y - 32);
  ctx.lineTo(width - margin - 120, y - 32);
  ctx.stroke();

  ctx.font = "600 23px system-ui, sans-serif";
  const prefix = "Tracked with ";
  const brand = "Evolve";
  const prefixW = ctx.measureText(prefix).width;
  const startX = width / 2 - (prefixW + ctx.measureText(brand).width) / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.fillText(prefix, startX, y);
  ctx.fillStyle = atmosphere.primaryAccent;
  ctx.fillText(brand, startX + prefixW, y);
}

/**
 * Evolve Signal Poster — cinematic Stories card.
 * No social chrome. Map + signal plane, location, left metrics, right hero.
 */
function drawSignalBadge(
  ctx: CanvasRenderingContext2D,
  model: WorkoutShareModel,
  atmosphere: AtmosphereTheme,
  w: number,
  h: number,
  margin: number,
) {
  const supportCount = Math.min(4, model.supporting.length);
  const footerBaseline = h - margin - 28;

  // Map + signal dominate the upper half.
  const signalY = Math.max(margin + 64, Math.round(h * 0.085));
  const signalH = Math.round(h * 0.4);
  const signalBox: SignalBox = {
    x: 0,
    y: signalY,
    w: w,
    h: signalH,
  };
  const signalBottom = signalBox.y + signalBox.h;
  const signalMidY = signalBox.y + signalBox.h * 0.48;

  fillBackground(ctx, w, h, atmosphere, signalMidY);

  // Lower band: metrics left, hero right
  const heroBaseline = footerBaseline - 158;
  const heroCx = w * 0.72;
  const heroUnitBottom = heroBaseline + (model.hero.unit ? 44 : 0);

  const locationLabel =
    model.showLocation ? formatShareLocationLabel(model.location) : null;

  const metricsTop = Math.max(signalBottom + 44, heroBaseline - 280);
  const locationBaseline = locationLabel ? metricsTop : 0;
  const stackTop = locationLabel ? metricsTop + 42 : metricsTop;
  const supportMaxBottom = footerBaseline - 108;

  const logoHeight = 72;
  const logoCx = w / 2;
  const logoBaselineY = signalBox.y + signalBox.h * 0.15;
  const bounds = evolveWordmarkBounds(logoHeight);
  const clearBand = {
    top: logoBaselineY - bounds.ascent - 6,
    bottom: logoBaselineY + bounds.descent + 20,
    left: logoCx - 220,
    right: logoCx + 220,
  };

  if (
    model.showRouteContext &&
    model.routePoints &&
    model.routePoints.length >= 2
  ) {
    drawRouteContext(
      ctx,
      model.routePoints,
      signalBox,
      atmosphere.primaryAccent,
    );
  }

  drawSignal(
    ctx,
    model.signalKind,
    model.signalPoints,
    signalBox,
    atmosphere,
    clearBand,
  );

  // Soft horizontal flare behind EVOLVE
  ctx.save();
  const flare = ctx.createLinearGradient(
    logoCx - 300,
    logoBaselineY,
    logoCx + 300,
    logoBaselineY,
  );
  flare.addColorStop(0, "rgba(255,255,255,0)");
  flare.addColorStop(0.42, withAlpha(atmosphere.primaryAccent, 0.2));
  flare.addColorStop(0.5, "rgba(255,255,255,0.4)");
  flare.addColorStop(0.58, withAlpha(atmosphere.primaryAccent, 0.2));
  flare.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = flare;
  ctx.fillRect(logoCx - 300, logoBaselineY - 11, 600, 3.5);
  ctx.restore();

  drawEvolveWordmark({
    ctx,
    cx: logoCx,
    baselineY: logoBaselineY,
    height: logoHeight,
    glow: true,
    glowBlur: 28,
  });

  drawInfoZoneGlow(
    ctx,
    atmosphere,
    w,
    (stackTop + heroUnitBottom) / 2,
    heroCx,
  );

  if (locationLabel && locationBaseline > signalBottom + 12) {
    drawLocationLabel(
      ctx,
      locationLabel,
      margin,
      locationBaseline,
      Math.min(w * 0.48, heroCx - margin - 80),
    );
  }

  if (supportCount > 0) {
    drawSupportingStack(
      ctx,
      model,
      atmosphere,
      stackTop,
      supportMaxBottom,
      margin,
    );
  }

  drawHero(ctx, model, atmosphere, heroCx, heroBaseline);
  drawFooter(ctx, atmosphere, w, h, margin);
}

export async function renderShareCardToBlob(
  options: ShareRenderOptions,
): Promise<Blob> {
  const format: ShareExportFormat = options.format ?? "stories";
  const { width, height, safeMargin } = getExportDimensions(format);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const { model, atmosphere } = options;
  drawSignalBadge(ctx, model, atmosphere, width, height, safeMargin);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG export failed"));
      },
      "image/png",
      0.95,
    );
  });
}

export function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url || !/^https?:\/\//i.test(url)) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
