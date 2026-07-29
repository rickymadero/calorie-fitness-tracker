"use client";

import type { PaceSample } from "@/lib/track/liveMetrics";

type LivePaceChartProps = {
  samples: PaceSample[];
  mode: "pace" | "speed" | "elevation";
  title: string;
  units: "metric" | "imperial";
};

export function LivePaceChart({
  samples,
  mode,
  title,
}: LivePaceChartProps) {
  const values = samples
    .map((s) => {
      if (mode === "speed") return s.speedKmh;
      return s.paceSecondsPerKm;
    })
    .filter((v): v is number => v != null && Number.isFinite(v) && v > 0);

  if (values.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted-bg/50 px-4 py-6 text-center text-sm text-muted">
        {title} — collecting data…
      </div>
    );
  }

  const w = 320;
  const h = 96;
  const pad = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.001, max - min);

  // For pace, lower is better — invert Y so faster = higher on chart
  const invert = mode === "pace";

  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const norm = (v - min) / span;
      const y = invert
        ? pad + norm * (h - pad * 2)
        : pad + (1 - norm) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const latest = values[values.length - 1]!;
  const latestLabel =
    mode === "speed"
      ? `${latest.toFixed(1)} km/h`
      : `${Math.floor(latest / 60)}:${Math.round(latest % 60)
          .toString()
          .padStart(2, "0")} /km`;

  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {title}
        </p>
        <p className="text-xs font-medium tabular-nums text-foreground">
          {latestLabel}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-24 w-full"
        role="img"
        aria-label={title}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-accent"
          points={points}
        />
      </svg>
    </div>
  );
}
