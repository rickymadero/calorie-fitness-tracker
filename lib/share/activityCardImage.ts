import type { WorkoutPost } from "@/lib/types/posts";
import { formatDurationClock, formatPace } from "@/lib/geo/routes";

export interface ShareCardInput {
  post: WorkoutPost;
  displayName: string;
  username: string;
}

/** Instagram Stories–friendly portrait card (1080×1920). */
export async function generateActivityShareImage(
  input: ShareCardInput,
): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const { post, displayName, username } = input;

  // Background — Evolve dark athletic
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#070807");
  bg.addColorStop(0.45, "#0d1510");
  bg.addColorStop(1, "#070807");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft green glow
  const glow = ctx.createRadialGradient(W * 0.2, H * 0.15, 40, W * 0.2, H * 0.15, 520);
  glow.addColorStop(0, "rgba(34, 212, 132, 0.28)");
  glow.addColorStop(1, "rgba(34, 212, 132, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Logo
  ctx.fillStyle = "#22d484";
  ctx.font = "700 42px system-ui, sans-serif";
  ctx.fillText("EVOLVE", 72, 120);
  // strike line vibe
  ctx.strokeStyle = "#22d484";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(72, 108);
  ctx.lineTo(290, 108);
  ctx.stroke();

  ctx.fillStyle = "rgba(244,245,244,0.55)";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText("Workout summary", 72, 168);

  // Type + title
  const typeLabel = post.type.charAt(0).toUpperCase() + post.type.slice(1);
  roundRect(ctx, 72, 220, 16 + typeLabel.length * 18, 52, 26);
  ctx.fillStyle = "rgba(34, 212, 132, 0.2)";
  ctx.fill();
  ctx.fillStyle = "#22d484";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText(typeLabel, 92, 254);

  ctx.fillStyle = "#f4f5f4";
  ctx.font = "700 72px system-ui, sans-serif";
  wrapText(ctx, post.title || "Workout", 72, 360, W - 144, 78);

  // Athlete
  ctx.fillStyle = "rgba(244,245,244,0.7)";
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText(`${displayName}  ·  @${username}`, 72, 470);

  // Map panel
  const mapX = 72;
  const mapY = 520;
  const mapW = W - 144;
  const mapH = 620;
  roundRect(ctx, mapX, mapY, mapW, mapH, 36);
  ctx.fillStyle = "#141614";
  ctx.fill();
  ctx.strokeStyle = "#252825";
  ctx.lineWidth = 2;
  ctx.stroke();

  const route = post.routePreview ?? post.route;
  if (route && route.length > 1 && post.routeVisible !== false) {
    drawRouteOnPanel(ctx, route, mapX + 24, mapY + 24, mapW - 48, mapH - 48, {
      hideStart: post.hideStart,
      hideEnd: post.hideEnd,
    });
  } else if (post.type === "gym" && post.exercises?.length) {
    drawGymPanel(ctx, post, mapX + 40, mapY + 48, mapW - 80);
  } else {
    ctx.fillStyle = "rgba(244,245,244,0.4)";
    ctx.font = "500 36px system-ui, sans-serif";
    ctx.fillText("Activity summary", mapX + 48, mapY + mapH / 2);
  }

  // Stats row
  const stats = buildStats(post);
  const rowY = mapY + mapH + 60;
  const cellW = (W - 144) / Math.min(stats.length, 4);
  stats.slice(0, 4).forEach((s, i) => {
    const x = 72 + i * cellW;
    ctx.fillStyle = "#f4f5f4";
    ctx.font = "700 52px system-ui, sans-serif";
    ctx.fillText(s.value, x, rowY + 56);
    ctx.fillStyle = "rgba(244,245,244,0.5)";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(s.label.toUpperCase(), x, rowY + 96);
  });

  // Achievements
  if (post.achievements?.length) {
    let ax = 72;
    const ay = rowY + 160;
    post.achievements.slice(0, 3).forEach((a) => {
      const tw = ctx.measureText(a.label).width + 48;
      roundRect(ctx, ax, ay, Math.max(tw, 120), 48, 24);
      ctx.fillStyle = "rgba(34, 212, 132, 0.18)";
      ctx.fill();
      ctx.fillStyle = "#22d484";
      ctx.font = "600 24px system-ui, sans-serif";
      ctx.fillText(a.label, ax + 24, ay + 32);
      ax += Math.max(tw, 120) + 16;
    });
  }

  // Caption snippet
  if (post.caption) {
    ctx.fillStyle = "rgba(244,245,244,0.65)";
    ctx.font = "400 30px system-ui, sans-serif";
    wrapText(ctx, post.caption, 72, H - 280, W - 144, 42, 3);
  }

  // Footer
  ctx.fillStyle = "rgba(244,245,244,0.35)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("Shared with Evolve", 72, H - 100);
  ctx.fillStyle = "#22d484";
  ctx.fillText("evolve", 72, H - 60);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image failed"))),
      "image/png",
      0.95,
    );
  });
}

function buildStats(post: WorkoutPost) {
  const out: { label: string; value: string }[] = [];
  if (post.distanceKm != null) {
    out.push({ label: "Distance", value: `${post.distanceKm.toFixed(2)} km` });
  }
  if (post.durationMin != null) {
    out.push({ label: "Time", value: formatDurationClock(post.durationMin) });
  }
  const pace = formatPace(post.paceMinPerKm);
  if (pace) out.push({ label: "Pace", value: pace.replace("/km", "") });
  if (post.avgSpeedKmh != null && !pace) {
    out.push({ label: "Speed", value: `${post.avgSpeedKmh.toFixed(1)}` });
  }
  if (post.caloriesBurned != null) {
    out.push({ label: "Cal", value: String(post.caloriesBurned) });
  }
  if (post.elevationGainM != null && out.length < 4) {
    out.push({ label: "Elev", value: `${post.elevationGainM}m` });
  }
  if (post.totalVolumeKg != null && out.length < 4) {
    out.push({
      label: "Volume",
      value: `${Math.round(post.totalVolumeKg / 100) / 10}k`,
    });
  }
  if (post.exerciseCount != null && out.length < 4) {
    out.push({ label: "Moves", value: String(post.exerciseCount) });
  }
  if (out.length === 0 && post.durationMin != null) {
    out.push({ label: "Time", value: formatDurationClock(post.durationMin) });
  }
  return out;
}

function drawRouteOnPanel(
  ctx: CanvasRenderingContext2D,
  points: { lat: number; lng: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { hideStart?: boolean; hideEnd?: boolean },
) {
  // Fake streets grid
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, 24);
  ctx.clip();
  ctx.fillStyle = "#101210";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(37, 40, 37, 0.9)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + (h / 8) * i);
    ctx.lineTo(x + w, y + (h / 8) * i);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + (w / 8) * i, y);
    ctx.lineTo(x + (w / 8) * i, y + h);
    ctx.stroke();
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 36;
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const xy = points.map((p) => ({
    x: x + pad + ((p.lng - minLng) / lngSpan) * (w - pad * 2),
    y: y + pad + (1 - (p.lat - minLat) / latSpan) * (h - pad * 2),
  }));

  ctx.strokeStyle = "#22d484";
  ctx.lineWidth = 8;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(34, 212, 132, 0.55)";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  xy.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (!opts.hideStart) {
    ctx.fillStyle = "#22d484";
    ctx.beginPath();
    ctx.arc(xy[0].x, xy[0].y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  if (!opts.hideEnd) {
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(xy[xy.length - 1].x, xy[xy.length - 1].y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#22d484";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGymPanel(
  ctx: CanvasRenderingContext2D,
  post: WorkoutPost,
  x: number,
  y: number,
  w: number,
) {
  ctx.fillStyle = "#f4f5f4";
  ctx.font = "700 40px system-ui, sans-serif";
  ctx.fillText(post.gymSummary || "Gym session", x, y);
  let yy = y + 70;
  (post.exercises ?? []).slice(0, 6).forEach((ex) => {
    ctx.fillStyle = "rgba(244,245,244,0.9)";
    ctx.font = "600 32px system-ui, sans-serif";
    ctx.fillText(ex.name, x, yy);
    ctx.fillStyle = "rgba(244,245,244,0.5)";
    ctx.font = "500 28px system-ui, sans-serif";
    const detail = `${ex.sets} sets${ex.reps ? ` · ${ex.reps} reps` : ""}${
      ex.weightKg ? ` · ${ex.weightKg} kg` : ""
    }`;
    ctx.fillText(detail, x, yy + 38);
    yy += 88;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  roundRectPath(ctx, x, y, w, h, r);
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        ctx.fillText((line + words.slice(n + 1).join(" ")).trim().slice(0, 42) + "…", x, y);
        return;
      }
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}
