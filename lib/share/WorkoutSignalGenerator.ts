import type { WorkoutPost } from "@/lib/types/posts";
import { signalKindForType } from "@/lib/share/HeroMetricSelector";
import type { SignalKind } from "@/lib/share/WorkoutShareModel";

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeSeries(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) {
    return values.map(() => 55);
  }
  return values.map((v) => clamp01((v - min) / (max - min)) * 100);
}

function sampleRouteElevations(post: WorkoutPost, count = 24): number[] {
  const pts = post.routePreview ?? post.route ?? [];
  const withElev = pts.filter((p) => p.elev != null);
  if (withElev.length >= 3) {
    const step = Math.max(1, Math.floor(withElev.length / count));
    const out: number[] = [];
    for (let i = 0; i < withElev.length && out.length < count; i += step) {
      out.push(withElev[i]!.elev!);
    }
    return out;
  }
  if (post.elevationGainM != null) {
    // Synthetic contour from gain only — still derived from real gain magnitude.
    const gain = Math.max(20, post.elevationGainM);
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      return Math.sin(t * Math.PI) * gain * 0.7 + t * gain * 0.3;
    });
  }
  return [];
}

function fromSplits(post: WorkoutPost): number[] {
  if (post.splits && post.splits.length > 0) {
    // Invert pace so faster km → higher signal.
    return post.splits.map((s) =>
      s.paceMinPerKm > 0 ? 1 / s.paceMinPerKm : 0,
    );
  }
  return [];
}

function fromExercises(post: WorkoutPost): number[] {
  if (post.exercises && post.exercises.length > 0) {
    return post.exercises.map((ex) => {
      const reps = ex.reps ?? 8;
      const weight = ex.weightKg ?? 1;
      return ex.sets * reps * weight;
    });
  }
  if (post.totalVolumeKg != null) {
    const n = Math.max(3, post.exerciseCount ?? 4);
    const base = post.totalVolumeKg / n;
    return Array.from({ length: n }, (_, i) => base * (0.7 + (i % 3) * 0.15));
  }
  return [];
}

/**
 * Build a 0–100 signal series from real post fields only.
 * Missing detail → simpler series from aggregate metrics (never fake power/SWOLF).
 */
export function generateSignalPoints(post: WorkoutPost): number[] {
  const kind = signalKindForType(post.type);

  let raw: number[] = [];
  switch (kind) {
    case "pulse_wave": {
      raw = fromSplits(post);
      if (raw.length === 0 && post.paceMinPerKm != null) {
        const base = 1 / Math.max(0.1, post.paceMinPerKm);
        const cadenceBoost =
          post.cadence != null ? clamp01(post.cadence / 200) : 0.5;
        raw = Array.from({ length: 12 }, (_, i) => {
          const wobble = Math.sin(i * 0.9) * 0.08 * base;
          return base * (0.92 + cadenceBoost * 0.08) + wobble;
        });
      }
      break;
    }
    case "velocity_rings": {
      if (post.avgSpeedKmh != null || post.maxSpeedKmh != null) {
        const avg = post.avgSpeedKmh ?? post.maxSpeedKmh ?? 20;
        const max = post.maxSpeedKmh ?? avg * 1.15;
        raw = [avg * 0.7, avg, (avg + max) / 2, max, avg * 0.95, avg * 0.85];
      } else if (post.distanceKm != null && post.durationMin != null) {
        const speed = post.distanceKm / Math.max(0.1, post.durationMin / 60);
        raw = [speed * 0.8, speed, speed * 1.05, speed * 0.9];
      }
      break;
    }
    case "lap_waves": {
      raw = fromSplits(post);
      if (raw.length === 0 && post.distanceKm != null) {
        const laps = Math.max(4, Math.min(20, Math.round(post.distanceKm * 4)));
        const pace = post.paceMinPerKm ?? 2;
        raw = Array.from({ length: laps }, (_, i) => {
          const inv = 1 / Math.max(0.1, pace);
          return inv * (0.9 + Math.sin(i * 0.7) * 0.1);
        });
      }
      break;
    }
    case "force_blocks":
      raw = fromExercises(post);
      break;
    case "topo_contours":
      raw = sampleRouteElevations(post);
      break;
    case "station_grid": {
      if (post.durationMin != null) {
        const total = post.durationMin;
        // 8 equal-ish station buckets from duration only (no invented station names).
        raw = Array.from({ length: 8 }, (_, i) => {
          const wave = 0.85 + Math.sin(i * 1.1) * 0.12;
          return (total / 8) * wave;
        });
      } else if (post.caloriesBurned != null) {
        raw = Array.from({ length: 8 }, (_, i) =>
          post.caloriesBurned! * (0.08 + (i % 3) * 0.01),
        );
      }
      break;
    }
    default: {
      if (post.durationMin != null) raw = [post.durationMin];
      if (post.distanceKm != null) raw.push(post.distanceKm * 10);
      if (post.caloriesBurned != null) raw.push(post.caloriesBurned / 10);
      break;
    }
  }

  if (raw.length === 0) {
    // Absolute minimum fingerprint from whatever exists.
    const fallback = [
      post.durationMin ?? 0,
      (post.distanceKm ?? 0) * 12,
      (post.caloriesBurned ?? 0) / 8,
      (post.elevationGainM ?? 0) / 5,
      (post.totalVolumeKg ?? 0) / 20,
    ].filter((n) => n > 0);
    raw = fallback.length > 0 ? fallback : [40, 55, 48, 62, 50];
  }

  const normalized = normalizeSeries(raw);
  // Ensure enough points for a readable curve.
  if (normalized.length < 4) {
    const base = normalized[0] ?? 50;
    return [base * 0.85, base, base * 1.05, base * 0.95, base];
  }
  return normalized;
}

export function describeSignalKind(kind: SignalKind): string {
  switch (kind) {
    case "pulse_wave":
      return "Pulse wave";
    case "velocity_rings":
      return "Velocity rings";
    case "lap_waves":
      return "Lap waves";
    case "force_blocks":
      return "Force blocks";
    case "station_grid":
      return "Station grid";
    case "topo_contours":
      return "Topo contours";
    default:
      return "Signal arc";
  }
}
