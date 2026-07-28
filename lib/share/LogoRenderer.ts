/**
 * Canvas letter-spaced EVOLVE mark for Stories export.
 * Matches the EvolveLogo strike-line treatment.
 */
import { EVOLVE_GREEN } from "@/lib/share/AtmosphereThemes";

export interface LogoDrawOptions {
  ctx: CanvasRenderingContext2D;
  cx: number;
  baselineY: number;
  height: number;
  color?: string;
  accent?: string;
  glow?: boolean;
  /** Soft blur radius; keep low when logo sits inside the signal. */
  glowBlur?: number;
}

function fillSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
): number {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const gaps = Math.max(0, chars.length - 1) * tracking;
  const total = widths.reduce((a, b) => a + b, 0) + gaps;
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i]!, x + widths[i]! / 2, y);
    x += widths[i]! + tracking;
  }
  return total;
}

export function drawEvolveWordmark(options: LogoDrawOptions): void {
  const {
    ctx,
    cx,
    baselineY,
    height,
    color = "#ffffff",
    accent = EVOLVE_GREEN,
    glow = true,
    glowBlur = 16,
  } = options;

  const fontSize = Math.round(height * 0.85);
  const tracking = fontSize * 0.16;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;

  if (glow) {
    ctx.shadowColor = "rgba(46,207,135,0.42)";
    ctx.shadowBlur = glowBlur;
  }
  ctx.fillStyle = color;
  const textW = fillSpacedText(ctx, "EVOLVE", cx, baselineY, tracking);
  ctx.shadowBlur = 0;

  const lineY = baselineY - fontSize * 0.42;
  const lineH = Math.max(3, Math.round(fontSize * 0.045));
  const lineX = cx - textW / 2;

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(lineX, lineY, textW, lineH);

  const tipW = textW * 0.18;
  const tipX = lineX + textW - tipW - textW * 0.08;
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 8;
  ctx.fillRect(tipX, lineY, tipW, lineH);
  ctx.shadowBlur = 0;

  ctx.restore();
}

/** Approximate vertical span of the wordmark for layout / wave pocket math. */
export function evolveWordmarkBounds(height: number): {
  fontSize: number;
  ascent: number;
  descent: number;
} {
  const fontSize = Math.round(height * 0.85);
  return {
    fontSize,
    ascent: fontSize * 0.78,
    descent: fontSize * 0.18,
  };
}
