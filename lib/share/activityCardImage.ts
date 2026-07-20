import type { WorkoutPost } from "@/lib/types/posts";
import { formatDurationClock, formatPace } from "@/lib/geo/routes";
import { drawRealStreetMap } from "@/lib/share/renderRouteMap";

export interface ShareCardInput {
  post: WorkoutPost;
  displayName: string;
  username: string;
  /** Matches feed map tiles: dark → Dark Matter, light → Voyager. */
  theme?: "light" | "dark";
}

/**
 * Evolve Stories card — “broadcast” layout.
 * Route workouts use the same Carto Voyager street tiles as feed posts.
 */
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

  const { post, displayName, username, theme = "dark" } = input;
  const typeLabel = post.type.charAt(0).toUpperCase() + post.type.slice(1);
  const hero = pickHeroStat(post);
  const support = buildSupportStats(post, hero?.key).slice(0, 3);
  const when = formatStamp(post.createdAt);

  // Warm-ink stage (not classic black GPS night)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#12100e");
  bg.addColorStop(0.4, "#171a1f");
  bg.addColorStop(1, "#0e1412");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Diagonal light plane
  ctx.save();
  ctx.translate(W * 0.55, -80);
  ctx.rotate((-18 * Math.PI) / 180);
  const beam = ctx.createLinearGradient(0, 0, 0, H * 1.2);
  beam.addColorStop(0, "rgba(46, 207, 135, 0.16)");
  beam.addColorStop(0.35, "rgba(122, 151, 184, 0.08)");
  beam.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = beam;
  ctx.fillRect(-200, 0, 520, H * 1.3);
  ctx.restore();

  // Live signal rail — lighter so composition stays visually centered
  const rail = ctx.createLinearGradient(0, 120, 0, H - 120);
  rail.addColorStop(0, "rgba(46, 207, 135, 0.1)");
  rail.addColorStop(0.5, "rgba(46, 207, 135, 0.85)");
  rail.addColorStop(1, "rgba(46, 207, 135, 0.15)");
  ctx.fillStyle = rail;
  ctx.fillRect(48, 160, 6, H - 360);

  for (let i = 0; i < 5; i++) {
    const py = 240 + i * 280;
    ctx.beginPath();
    ctx.fillStyle = i === 1 ? "#2ecf87" : "rgba(46, 207, 135, 0.3)";
    ctx.arc(51, py, i === 1 ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const padX = 88;

  // Brand
  ctx.fillStyle = "#f3efe8";
  ctx.font = "800 36px system-ui, sans-serif";
  ctx.fillText("EVOLVE", padX, 120);
  ctx.strokeStyle = "#2ecf87";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padX, 108);
  ctx.lineTo(padX + 172, 108);
  ctx.stroke();

  // Live chip
  roundRect(ctx, W - padX - 160, 88, 160, 44, 22);
  ctx.fillStyle = "rgba(46, 207, 135, 0.12)";
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#2ecf87";
  ctx.arc(W - padX - 132, 110, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3efe8";
  ctx.font = "700 20px system-ui, sans-serif";
  ctx.fillText("ON AIR", W - padX - 114, 117);

  // Type + stamp
  ctx.fillStyle = "rgba(243, 239, 232, 0.5)";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(`${typeLabel.toUpperCase()}  ·  ${when}`, padX, 190);

  // Giant title
  ctx.fillStyle = "#f7f4ef";
  ctx.font = "800 82px system-ui, sans-serif";
  const titleEnd = wrapText(
    ctx,
    post.title || "Session",
    padX,
    296,
    W - padX * 2,
    88,
    3,
  );

  // Athlete social line
  const avatarY = titleEnd + 56;
  ctx.beginPath();
  ctx.fillStyle = "#2ecf87";
  ctx.arc(padX + 28, avatarY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#042214";
  ctx.font = "800 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(initials(displayName), padX + 28, avatarY + 8);
  ctx.textAlign = "left";
  ctx.fillStyle = "#f7f4ef";
  ctx.font = "700 30px system-ui, sans-serif";
  ctx.fillText(displayName, padX + 72, avatarY - 4);
  ctx.fillStyle = "rgba(243, 239, 232, 0.5)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.fillText(`@${username}`, padX + 72, avatarY + 28);

  // Map / activity panel — centered column
  const panelX = padX;
  const panelY = avatarY + 70;
  const panelW = W - padX * 2;
  const panelH = 520;
  roundRect(ctx, panelX, panelY, panelW, panelH, 32);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fill();
  ctx.strokeStyle = "rgba(243, 239, 232, 0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const route = post.routePreview ?? post.route;
  if (route && route.length > 1 && post.routeVisible !== false) {
    await drawRealStreetMap(
      ctx,
      route,
      panelX + 16,
      panelY + 16,
      panelW - 32,
      panelH - 32,
      {
        hideStart: post.hideStart,
        hideEnd: post.hideEnd,
        theme,
      },
    );
  } else if (post.type === "gym" && post.exercises?.length) {
    drawGymBroadcast(ctx, post, panelX + 44, panelY + 48, panelW - 88);
  } else {
    // Abstract concentric rings — energy, not GPS
    drawEnergyRings(ctx, panelX + panelW / 2, panelY + panelH / 2, 160);
    ctx.fillStyle = "rgba(243, 239, 232, 0.45)";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SESSION LOCKED", panelX + panelW / 2, panelY + panelH / 2 + 8);
    ctx.textAlign = "left";
  }

  // Hero metric — one big number (magazine, not dashboard)
  let y = panelY + panelH + 72;
  if (hero) {
    ctx.fillStyle = "rgba(243, 239, 232, 0.45)";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillText(hero.label.toUpperCase(), padX, y);
    ctx.fillStyle = "#2ecf87";
    ctx.font = "800 100px system-ui, sans-serif";
    ctx.fillText(hero.value, padX, y + 100);
    y += 140;
  }

  // Supporting metrics as type rows with rules
  support.forEach((s) => {
    ctx.strokeStyle = "rgba(243, 239, 232, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(W - padX, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(243, 239, 232, 0.45)";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText(s.label.toUpperCase(), padX, y + 36);
    ctx.fillStyle = "#f7f4ef";
    ctx.font = "700 36px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(s.value, W - padX, y + 38);
    ctx.textAlign = "left";
    y += 70;
  });

  // Caption whisper
  if (post.caption) {
    y += 20;
    ctx.fillStyle = "rgba(243, 239, 232, 0.5)";
    ctx.font = "400 26px system-ui, sans-serif";
    wrapText(ctx, `“${post.caption}”`, padX, y + 28, W - padX * 2, 36, 2);
  }

  // Footer manifesto
  ctx.fillStyle = "rgba(243, 239, 232, 0.35)";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText("TRAIN IN PUBLIC", padX, H - 100);
  ctx.fillStyle = "#2ecf87";
  ctx.font = "800 28px system-ui, sans-serif";
  ctx.fillText("evolve", padX, H - 58);
  ctx.fillStyle = "rgba(243, 239, 232, 0.4)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`@${username}`, W - padX, H - 58);
  ctx.textAlign = "left";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image failed"))),
      "image/png",
      0.95,
    );
  });
}

function pickHeroStat(post: WorkoutPost): {
  key: string;
  label: string;
  value: string;
} | null {
  if (post.distanceKm != null) {
    return {
      key: "distance",
      label: "Distance km",
      value: post.distanceKm.toFixed(2),
    };
  }
  if (post.totalVolumeKg != null) {
    return {
      key: "volume",
      label: "Volume kg",
      value: String(Math.round(post.totalVolumeKg)),
    };
  }
  if (post.caloriesBurned != null) {
    return {
      key: "cal",
      label: "Calories",
      value: String(post.caloriesBurned),
    };
  }
  if (post.durationMin != null) {
    return {
      key: "time",
      label: "Elapsed",
      value: formatDurationClock(post.durationMin),
    };
  }
  return null;
}

function buildSupportStats(
  post: WorkoutPost,
  skip?: string,
): { label: string; value: string }[] {
  const out: { label: string; value: string; key: string }[] = [];
  if (post.durationMin != null) {
    out.push({
      key: "time",
      label: "Time",
      value: formatDurationClock(post.durationMin),
    });
  }
  const pace = formatPace(post.paceMinPerKm);
  if (pace) out.push({ key: "pace", label: "Pace", value: pace });
  if (post.caloriesBurned != null) {
    out.push({
      key: "cal",
      label: "Calories",
      value: String(post.caloriesBurned),
    });
  }
  if (post.elevationGainM != null) {
    out.push({
      key: "elev",
      label: "Climb",
      value: `${post.elevationGainM} m`,
    });
  }
  if (post.exerciseCount != null) {
    out.push({
      key: "moves",
      label: "Moves",
      value: String(post.exerciseCount),
    });
  }
  if (post.avgSpeedKmh != null && !pace) {
    out.push({
      key: "speed",
      label: "Speed",
      value: `${post.avgSpeedKmh.toFixed(1)} km/h`,
    });
  }
  return out.filter((s) => s.key !== skip).map(({ label, value }) => ({ label, value }));
}

function drawGymBroadcast(
  ctx: CanvasRenderingContext2D,
  post: WorkoutPost,
  x: number,
  y: number,
  w: number,
) {
  ctx.fillStyle = "rgba(243, 239, 232, 0.4)";
  ctx.font = "700 20px system-ui, sans-serif";
  ctx.fillText((post.gymSummary || "LIFT BROADCAST").toUpperCase(), x, y);

  let yy = y + 56;
  (post.exercises ?? []).slice(0, 5).forEach((ex, idx) => {
    ctx.fillStyle = "#2ecf87";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText(String(idx + 1).padStart(2, "0"), x, yy);

    ctx.fillStyle = "#f7f4ef";
    ctx.font = "700 32px system-ui, sans-serif";
    const name =
      ex.name.length > 22 ? `${ex.name.slice(0, 21)}…` : ex.name;
    ctx.fillText(name, x + 64, yy);

    ctx.fillStyle = "rgba(243, 239, 232, 0.45)";
    ctx.font = "500 24px system-ui, sans-serif";
    const detail = `${ex.sets} × ${ex.reps ?? "—"}${
      ex.weightKg ? ` @ ${ex.weightKg}kg` : ""
    }`;
    ctx.fillText(detail, x + 64, yy + 34);
    yy += 88;
  });
}

function drawEnergyRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(46, 207, 135, ${0.08 * i})`;
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, r * (i / 3), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStamp(iso?: string) {
  if (!iso) return "TODAY";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }).toUpperCase();
  } catch {
    return "TODAY";
  }
}

function roundRect(
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
): number {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  let cy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[n] + " ";
      cy += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        const rest = (line + words.slice(n + 1).join(" ")).trim();
        const clipped =
          rest.length > 34 ? `${rest.slice(0, 34).trim()}…` : rest;
        ctx.fillText(clipped, x, cy);
        return cy;
      }
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
  return cy;
}
