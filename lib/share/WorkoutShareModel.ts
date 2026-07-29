import type { ActivityType, WorkoutPost } from "@/lib/types/posts";

/** Export format ids — Stories first; portrait/square reserved for later. */
export type ShareExportFormat = "stories" | "portrait" | "square";

export type ShareTemplateId = "signal_core";

export type AtmosphereId =
  | "midnight"
  | "void"
  | "forest"
  | "electric"
  | "carbon"
  | "ocean";

export type HeroMetricKey =
  | "distance"
  | "duration"
  | "moving"
  | "pace"
  | "best_pace"
  | "speed"
  | "max_speed"
  | "elevation"
  | "calories"
  | "hr"
  | "max_hr"
  | "cadence"
  | "volume"
  | "exercises"
  | "sets"
  | "reps";

export type SignalKind =
  | "pulse_wave"
  | "velocity_rings"
  | "lap_waves"
  | "force_blocks"
  | "station_grid"
  | "topo_contours"
  | "generic_arc";

export interface ShareMetric {
  key: HeroMetricKey;
  label: string;
  value: string;
  unit?: string;
}

export interface AtmosphereTheme {
  id: AtmosphereId;
  name: string;
  background: [string, string, string];
  primaryAccent: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  signalColor: string;
  glow: string;
}

export interface ShareAthlete {
  displayName: string;
  username: string;
  avatarUrl?: string;
}

export interface WorkoutShareModel {
  activityId: string;
  activityType: ActivityType;
  signalKind: SignalKind;
  hero: ShareMetric;
  /** Up to 4 supporting metrics for a clean badge layout. */
  supporting: ShareMetric[];
  availableHeroes: ShareMetric[];
  athlete: ShareAthlete;
  title: string;
  startedAt: string;
  location?: string;
  /** Real GPS samples for optional abstract route context (never invent). */
  routePoints?: { lat: number; lng: number }[];
  signalPoints: number[];
  atmosphereId: AtmosphereId;
  templateId: ShareTemplateId;
  showLocation: boolean;
  showDate: boolean;
  showUsername: boolean;
  /** Ultra-low-opacity route silhouette behind the signal. */
  showRouteContext: boolean;
}

export interface ShareRenderOptions {
  model: WorkoutShareModel;
  atmosphere: AtmosphereTheme;
  format?: ShareExportFormat;
  avatarImage?: HTMLImageElement | null;
}

export interface BuildShareModelInput {
  post: WorkoutPost;
  athlete: ShareAthlete;
  heroKey?: HeroMetricKey;
  /** Previous hero — boosted into the left supporting column when swapped. */
  previousHeroKey?: HeroMetricKey;
  atmosphereId?: AtmosphereId;
  title?: string;
  showLocation?: boolean;
  showDate?: boolean;
  showUsername?: boolean;
  showRouteContext?: boolean;
}
