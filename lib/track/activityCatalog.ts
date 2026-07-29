/** Trackable activity catalog — GPS vs timer capabilities. */

export type TrackActivityId =
  | "running"
  | "walking"
  | "cycling"
  | "hiking"
  | "treadmill"
  | "indoor_cycling"
  | "swimming"
  | "strength"
  | "hyrox"
  | "yoga"
  | "hiit"
  | "functional"
  | "sports"
  | "other";

export type TrackMetricKind =
  | "distance"
  | "pace"
  | "speed"
  | "elevation"
  | "calories"
  | "splits"
  | "laps"
  | "sets"
  | "heart_rate";

export type TrackActivityDef = {
  id: TrackActivityId;
  /** Maps to DB activity_type */
  dbType:
    | "running"
    | "walking"
    | "cycling"
    | "hiking"
    | "treadmill"
    | "indoor_cycling"
    | "swimming"
    | "strength"
    | "hyrox"
    | "functional"
    | "cross_training"
    | "other";
  usesGps: boolean;
  autoDistance: boolean;
  mayNeedManualInput: boolean;
  metrics: TrackMetricKind[];
  titleKey: string;
  descKey: string;
};

export const TRACK_ACTIVITIES: TrackActivityDef[] = [
  {
    id: "running",
    dbType: "running",
    usesGps: true,
    autoDistance: true,
    mayNeedManualInput: false,
    metrics: ["distance", "pace", "calories", "splits", "elevation"],
    titleKey: "activities.running.title",
    descKey: "activities.running.desc",
  },
  {
    id: "walking",
    dbType: "walking",
    usesGps: true,
    autoDistance: true,
    mayNeedManualInput: false,
    metrics: ["distance", "pace", "calories", "splits"],
    titleKey: "activities.walking.title",
    descKey: "activities.walking.desc",
  },
  {
    id: "cycling",
    dbType: "cycling",
    usesGps: true,
    autoDistance: true,
    mayNeedManualInput: false,
    metrics: ["distance", "speed", "calories", "elevation", "splits"],
    titleKey: "activities.cycling.title",
    descKey: "activities.cycling.desc",
  },
  {
    id: "hiking",
    dbType: "hiking",
    usesGps: true,
    autoDistance: true,
    mayNeedManualInput: false,
    metrics: ["distance", "pace", "elevation", "calories"],
    titleKey: "activities.hiking.title",
    descKey: "activities.hiking.desc",
  },
  {
    id: "treadmill",
    dbType: "treadmill",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["distance", "pace", "calories"],
    titleKey: "activities.treadmill.title",
    descKey: "activities.treadmill.desc",
  },
  {
    id: "indoor_cycling",
    dbType: "indoor_cycling",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["distance", "speed", "calories"],
    titleKey: "activities.indoorCycling.title",
    descKey: "activities.indoorCycling.desc",
  },
  {
    id: "swimming",
    dbType: "swimming",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["distance", "laps", "pace", "calories"],
    titleKey: "activities.swimming.title",
    descKey: "activities.swimming.desc",
  },
  {
    id: "strength",
    dbType: "strength",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["sets", "calories"],
    titleKey: "activities.strength.title",
    descKey: "activities.strength.desc",
  },
  {
    id: "hyrox",
    dbType: "hyrox",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["distance", "calories"],
    titleKey: "activities.hyrox.title",
    descKey: "activities.hyrox.desc",
  },
  {
    id: "yoga",
    dbType: "functional",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: false,
    metrics: ["calories", "heart_rate"],
    titleKey: "activities.yoga.title",
    descKey: "activities.yoga.desc",
  },
  {
    id: "hiit",
    dbType: "cross_training",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: false,
    metrics: ["calories", "heart_rate"],
    titleKey: "activities.hiit.title",
    descKey: "activities.hiit.desc",
  },
  {
    id: "functional",
    dbType: "functional",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["calories", "sets"],
    titleKey: "activities.functional.title",
    descKey: "activities.functional.desc",
  },
  {
    id: "sports",
    dbType: "other",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["calories"],
    titleKey: "activities.sports.title",
    descKey: "activities.sports.desc",
  },
  {
    id: "other",
    dbType: "other",
    usesGps: false,
    autoDistance: false,
    mayNeedManualInput: true,
    metrics: ["calories"],
    titleKey: "activities.other.title",
    descKey: "activities.other.desc",
  },
];

export function getTrackActivity(id: TrackActivityId): TrackActivityDef {
  const found = TRACK_ACTIVITIES.find((a) => a.id === id);
  if (!found) return TRACK_ACTIVITIES[TRACK_ACTIVITIES.length - 1]!;
  return found;
}

export const OUTDOOR_GPS_IDS: TrackActivityId[] = [
  "running",
  "walking",
  "cycling",
  "hiking",
];
