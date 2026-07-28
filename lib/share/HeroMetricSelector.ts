import { formatDurationClock, formatPace } from "@/lib/geo/routes";
import { stripTrailingUnit } from "@/lib/share/formatShareMetric";
import type { ActivityType, WorkoutPost } from "@/lib/types/posts";
import type {
  HeroMetricKey,
  ShareMetric,
  SignalKind,
} from "@/lib/share/WorkoutShareModel";

/** Pace clock only — unit is attached separately as "/km". */
function paceClock(pace?: number): string | null {
  const p = formatPace(pace);
  if (!p) return null;
  return stripTrailingUnit(p, "/km");
}

function metric(
  key: HeroMetricKey,
  label: string,
  value: string,
  unit?: string,
): ShareMetric {
  return { key, label, value, unit };
}

/** Sport-specific signal geometry family. */
export function signalKindForType(type: ActivityType): SignalKind {
  switch (type) {
    case "running":
    case "walking":
      return "pulse_wave";
    case "cycling":
      return "velocity_rings";
    case "swimming":
      return "lap_waves";
    case "gym":
      return "force_blocks";
    case "hiking":
      return "topo_contours";
    case "sports":
      return "station_grid";
    default:
      return "generic_arc";
  }
}

/** Every numeric / countable detail present on the workout. */
export function collectAvailableMetrics(post: WorkoutPost): ShareMetric[] {
  const out: ShareMetric[] = [];
  if (post.distanceKm != null) {
    out.push(
      metric("distance", "Distance", post.distanceKm.toFixed(1), "km"),
    );
  }
  if (post.durationMin != null) {
    out.push(
      metric(
        "duration",
        "Time",
        formatDurationClock(post.durationMin) ?? String(post.durationMin),
      ),
    );
  }
  if (post.movingTimeMin != null) {
    out.push(
      metric(
        "moving",
        "Moving",
        formatDurationClock(post.movingTimeMin) ?? String(post.movingTimeMin),
      ),
    );
  }
  const pace = paceClock(post.paceMinPerKm);
  if (pace) out.push(metric("pace", "Pace", pace, "/km"));
  const bestPace = paceClock(post.fastestPaceMinPerKm);
  if (bestPace) out.push(metric("best_pace", "Best pace", bestPace, "/km"));
  if (post.avgSpeedKmh != null) {
    out.push(
      metric("speed", "Avg speed", post.avgSpeedKmh.toFixed(1), "km/h"),
    );
  }
  if (post.maxSpeedKmh != null) {
    out.push(
      metric("max_speed", "Max speed", post.maxSpeedKmh.toFixed(1), "km/h"),
    );
  }
  if (post.elevationGainM != null) {
    out.push(
      metric(
        "elevation",
        "Elevation",
        String(Math.round(post.elevationGainM)),
        "m",
      ),
    );
  }
  if (post.caloriesBurned != null) {
    out.push(
      metric("calories", "Calories", String(Math.round(post.caloriesBurned))),
    );
  }
  if (post.avgHeartRate != null) {
    out.push(
      metric("hr", "Avg HR", String(Math.round(post.avgHeartRate)), "bpm"),
    );
  }
  if (post.maxHeartRate != null) {
    out.push(
      metric("max_hr", "Max HR", String(Math.round(post.maxHeartRate)), "bpm"),
    );
  }
  if (post.cadence != null) {
    out.push(metric("cadence", "Cadence", String(Math.round(post.cadence))));
  }
  if (post.totalVolumeKg != null) {
    out.push(
      metric(
        "volume",
        "Volume",
        String(Math.round(post.totalVolumeKg)),
        "kg",
      ),
    );
  }
  if (post.exerciseCount != null || (post.exercises?.length ?? 0) > 0) {
    out.push(
      metric(
        "exercises",
        "Exercises",
        String(post.exerciseCount ?? post.exercises?.length ?? 0),
      ),
    );
  }
  if (post.totalSets != null) {
    out.push(metric("sets", "Sets", String(post.totalSets)));
  }
  if (post.totalReps != null) {
    out.push(metric("reps", "Reps", String(post.totalReps)));
  }
  return out;
}

/** Focal metric by activity type — every other available metric still renders. */
export function defaultHeroKey(post: WorkoutPost): HeroMetricKey | null {
  const available = new Set(collectAvailableMetrics(post).map((m) => m.key));
  const prefer = (keys: HeroMetricKey[]) =>
    keys.find((k) => available.has(k)) ?? null;

  switch (post.type) {
    case "running":
    case "walking":
      return prefer([
        "distance",
        "duration",
        "pace",
        "elevation",
        "cadence",
        "hr",
      ]);
    case "cycling":
      return prefer(["distance", "duration", "speed", "elevation", "max_speed"]);
    case "swimming":
      return prefer(["distance", "duration", "pace", "calories"]);
    case "gym":
      return prefer(["volume", "exercises", "sets", "reps", "duration"]);
    case "hiking":
      return prefer(["elevation", "distance", "duration"]);
    case "sports":
      return prefer(["duration", "distance", "calories", "hr"]);
    default:
      return prefer(["duration", "distance", "calories", "volume"]);
  }
}

export function pickHeroMetric(
  post: WorkoutPost,
  override?: HeroMetricKey,
): ShareMetric | null {
  const all = collectAvailableMetrics(post);
  if (all.length === 0) return null;
  if (override) {
    const found = all.find((m) => m.key === override);
    if (found) return found;
  }
  const key = defaultHeroKey(post);
  return all.find((m) => m.key === key) ?? all[0] ?? null;
}

/** Prefer clean Stories hierarchy: time → pace → best → calories, then rest. */
const SUPPORT_PRIORITY: HeroMetricKey[] = [
  "duration",
  "pace",
  "best_pace",
  "calories",
  "elevation",
  "hr",
  "max_hr",
  "speed",
  "max_speed",
  "moving",
  "cadence",
  "volume",
  "exercises",
  "sets",
  "reps",
];

/** Supporting metrics for the badge — capped for a clean layout. */
export function pickSupportingMetrics(
  post: WorkoutPost,
  heroKey: HeroMetricKey | undefined,
  limit = 4,
): ShareMetric[] {
  const available = collectAvailableMetrics(post).filter(
    (m) => m.key !== heroKey,
  );
  const rank = (key: HeroMetricKey) => {
    const i = SUPPORT_PRIORITY.indexOf(key);
    return i === -1 ? SUPPORT_PRIORITY.length + 1 : i;
  };
  return [...available]
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, limit);
}

export function defaultShareTitle(post: WorkoutPost): string {
  if (post.title?.trim()) return post.title.trim();
  switch (post.type) {
    case "running":
      return "Morning Run";
    case "walking":
      return "Recovery Miles";
    case "cycling":
      return "Velocity Test";
    case "swimming":
      return "Pool Endurance";
    case "gym":
      return "Full Body Grind";
    case "hiking":
      return "Elevation Challenge";
    case "sports":
      return "Station Training";
    case "yoga":
      return "Mobility Session";
    default:
      return "Evolve Session";
  }
}
